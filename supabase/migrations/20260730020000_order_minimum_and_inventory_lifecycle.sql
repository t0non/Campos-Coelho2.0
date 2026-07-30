-- Garante o mínimo comercial em qualquer origem de pedido, preservando
-- pedidos históricos que tenham sido criados antes desta regra.
alter table public.orders
  drop constraint if exists orders_minimum_total;

create or replace function public.enforce_new_order_minimum()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'draft' and new.total < 1000 then
    raise exception 'MINIMUM_ORDER_NOT_REACHED';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_new_order_minimum on public.orders;
create trigger enforce_new_order_minimum
  before insert on public.orders
  for each row execute function public.enforce_new_order_minimum();

create or replace function public.admin_transition_order_status(
  p_order_id uuid,
  p_next_status public.order_status,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_inventory public.inventories%rowtype;
  v_allowed boolean := false;
begin
  if not public.is_admin() or p_actor_id is distinct from auth.uid() then
    return jsonb_build_object('success', false, 'code', 'FORBIDDEN');
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if v_order.id is null then
    return jsonb_build_object('success', false, 'code', 'ORDER_NOT_FOUND');
  end if;

  if v_order.status = p_next_status then
    return jsonb_build_object('success', true, 'unchanged', true);
  end if;

  v_allowed := case v_order.status
    when 'draft' then p_next_status in ('pending', 'cancelled')
    when 'pending' then p_next_status in ('confirmed', 'cancelled')
    when 'confirmed' then p_next_status in ('processing', 'cancelled')
    when 'processing' then p_next_status in ('shipped', 'cancelled')
    when 'shipped' then p_next_status = 'delivered'
    else false
  end;

  if not v_allowed then
    return jsonb_build_object('success', false, 'code', 'INVALID_TRANSITION');
  end if;

  if p_next_status in ('cancelled', 'delivered') then
    for v_item in
      select product_id, variant_id, quantity
      from public.order_items
      where order_id = v_order.id
      order by product_id, variant_id
    loop
      select * into v_inventory
      from public.inventories
      where product_id = v_item.product_id
        and variant_id is not distinct from v_item.variant_id
      for update;

      if v_inventory.id is null
         or v_inventory.quantity_reserved < v_item.quantity
         or (p_next_status = 'delivered' and v_inventory.quantity_available < v_item.quantity) then
        raise exception 'INVENTORY_STATE_INVALID';
      end if;

      if p_next_status = 'cancelled' then
        update public.inventories
        set quantity_reserved = quantity_reserved - v_item.quantity,
            updated_at = now()
        where id = v_inventory.id;

        insert into public.inventory_movements (
          inventory_id, variant_id, actor_id, movement_type, quantity_delta,
          previous_quantity, new_quantity, reason, reference_type, reference_id
        ) values (
          v_inventory.id, v_item.variant_id, p_actor_id, 'release', v_item.quantity,
          v_inventory.quantity_available - v_inventory.quantity_reserved,
          v_inventory.quantity_available - (v_inventory.quantity_reserved - v_item.quantity),
          'Reserva liberada pelo cancelamento do pedido',
          'order', v_order.id
        );
      else
        update public.inventories
        set quantity_available = quantity_available - v_item.quantity,
            quantity_reserved = quantity_reserved - v_item.quantity,
            updated_at = now()
        where id = v_inventory.id;

        insert into public.inventory_movements (
          inventory_id, variant_id, actor_id, movement_type, quantity_delta,
          previous_quantity, new_quantity, reason, reference_type, reference_id
        ) values (
          v_inventory.id, v_item.variant_id, p_actor_id, 'sale', -v_item.quantity,
          v_inventory.quantity_available,
          v_inventory.quantity_available - v_item.quantity,
          'Baixa definitiva após entrega do pedido',
          'order', v_order.id
        );
      end if;
    end loop;
  end if;

  update public.orders
  set status = p_next_status, updated_at = now()
  where id = v_order.id;

  insert into public.order_status_history (order_id, status, created_by, notes)
  values (
    v_order.id,
    p_next_status,
    p_actor_id,
    format('Status alterado de %s para %s pelo painel administrativo.', v_order.status, p_next_status)
  );

  insert into public.audit_logs (actor_id, action, target_table, target_id, payload)
  values (
    p_actor_id,
    'ORDER_STATUS_UPDATED',
    'orders',
    v_order.id,
    jsonb_build_object(
      'order_number', v_order.order_number,
      'previous_status', v_order.status,
      'next_status', p_next_status
    )
  );

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.admin_transition_order_status(uuid, public.order_status, uuid)
  from public, anon, authenticated;
grant execute on function public.admin_transition_order_status(uuid, public.order_status, uuid)
  to authenticated, service_role;
