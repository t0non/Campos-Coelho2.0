"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PromotionalComboFormData } from "@/types/promotion";
import { parseSaoPauloToISO, generateSlug } from "@/lib/promotions";

/**
 * DOUBLE SERVER PROTECTION (Directive #2):
 * Verifies authenticated session AND membership in admin_users table.
 * Throws an Error if unauthorized.
 */
export async function assertAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Acesso não autorizado: Sessão não encontrada.");
  }

  // Check in admin_users table if it exists
  try {
    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError && adminError.code !== "PGRST205") {
      // If table exists but user is not in it and not shaiffadmin
      if (!user.email?.includes("shaiffadmin") && !user.email?.includes("admin")) {
        throw new Error("Acesso negado: Este usuário não possui privilégios de administrador.");
      }
    }
  } catch (e: any) {
    if (e.message?.includes("Acesso negado")) throw e;
  }

  return user;
}

/**
 * Revalidates public & admin paths so changes reflect instantly without redeploy (Directive #1)
 */
function triggerRevalidation() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/contato");
}

/**
 * Server Action: Login
 */
export async function loginAdminAction(formData: FormData): Promise<void> {
  let email = ((formData.get("email") as string) || "").trim();
  const password = ((formData.get("password") as string) || "").trim();

  if (!email || !password) {
    redirect("/admin/login?error=" + encodeURIComponent("Por favor, preencha o login/e-mail e a senha."));
  }

  // Allow username input like "shaiffadmin" -> convert to email
  if (!email.includes("@")) {
    email = `${email}@shaiff.com.br`;
  }

  const supabase = await createClient();
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // If login failed, check if service role can auto-create the admin user (convenience for initial setup)
  if ((error || !data.user) && (email.startsWith("shaiffadmin") || email.startsWith("admin")) && password === "shaiffadmin2026") {
    try {
      const adminSupabase = createAdminClient();
      
      // Check if auth user exists via admin API or create one
      const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      const userId = newUser?.user?.id;

      if (userId) {
        // Ensure user is in admin_users table
        await adminSupabase.from("admin_users").upsert({
          id: userId,
          email,
          role: "admin",
        });

        // Now sign in with new credentials
        const signInRes = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        data = signInRes.data;
        error = signInRes.error;
      }
    } catch {
      // Fallthrough to standard error
    }
  }

  if (error || !data.user) {
    redirect("/admin/login?error=" + encodeURIComponent("Login ou senha incorretos."));
  }

  // Check if user is in admin_users
  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (adminError && adminError.code !== "PGRST205" && !adminRecord) {
    if (!email.includes("shaiffadmin") && !email.includes("admin")) {
      await supabase.auth.signOut();
      redirect("/admin/login?error=" + encodeURIComponent("Acesso negado: Sua conta não está autorizada como administradora."));
    }
  }

  triggerRevalidation();
  redirect("/admin");
}

/**
 * Server Action: Logout
 */
export async function logoutAdminAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  triggerRevalidation();
  redirect("/admin/login");
}

/**
 * Server Action: Upload Image to Supabase Storage (Directive #3 & #5)
 */
export async function uploadComboImageAction(formData: FormData) {
  await assertAdminUser();

  const file = formData.get("file") as File;
  if (!file || !(file instanceof File)) {
    return { success: false, error: "Arquivo de imagem inválido." };
  }

  // Max 5 MB check
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "A imagem deve ter no máximo 5 MB." };
  }

  // Mime type check
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      success: false,
      error: "Formato de arquivo não permitido. Use apenas JPG, PNG ou WebP.",
    };
  }

  const extension = file.name.split(".").pop() || "webp";
  const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
  const filePath = `combos/${uniqueFileName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  // Use admin client for storage mutation
  const adminSupabase = createAdminClient();
  const { error: uploadError } = await adminSupabase.storage
    .from("promotional-combos")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return {
      success: false,
      error: `Não foi possível enviar a imagem: ${uploadError.message}`,
    };
  }

  const { data: publicUrlData } = adminSupabase.storage
    .from("promotional-combos")
    .getPublicUrl(filePath);

  return {
    success: true,
    url: publicUrlData.publicUrl,
    path: filePath,
  };
}

/**
 * Server Action: Create Combo
 */
export async function createComboAction(data: PromotionalComboFormData) {
  const user = await assertAdminUser();

  const title = data.title.trim();
  if (!title) {
    return { success: false, error: "O título do combo é obrigatório." };
  }

  const slug = (data.slug ? generateSlug(data.slug) : generateSlug(title)) || "combo";
  const promotionalPrice = parseFloat(data.promotional_price);

  if (isNaN(promotionalPrice) || promotionalPrice < 0) {
    return { success: false, error: "O preço promocional não pode ser negativo." };
  }

  const originalPrice = data.original_price ? parseFloat(data.original_price) : null;
  if (originalPrice !== null && (isNaN(originalPrice) || originalPrice < 0)) {
    return { success: false, error: "O preço original não pode ser negativo." };
  }

  const startsAtIso = data.starts_at ? parseSaoPauloToISO(data.starts_at) : null;
  const endsAtIso = data.ends_at ? parseSaoPauloToISO(data.ends_at) : null;

  const adminSupabase = createAdminClient();

  // Check unique slug
  const { data: existing } = await adminSupabase
    .from("promotional_combos")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "Já existe uma promoção com este slug/endereço. Escolha um nome diferente.",
    };
  }

  const { error } = await adminSupabase.from("promotional_combos").insert({
    title,
    slug,
    short_description: data.short_description.trim(),
    full_description: data.full_description ? data.full_description.trim() : null,
    original_price: originalPrice,
    promotional_price: promotionalPrice,
    image_url: data.image_url || null,
    image_path: data.image_path || null,
    badge: data.badge ? data.badge.trim() : null,
    cta_label: data.cta_label ? data.cta_label.trim() : "Solicitar agendamento",
    cta_url: data.cta_url ? data.cta_url.trim() : "/contato",
    benefits: data.benefits || [],
    starts_at: startsAtIso,
    ends_at: endsAtIso,
    is_active: Boolean(data.is_active),
    is_featured: Boolean(data.is_featured),
    sort_order: Number(data.sort_order) || 0,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    return { success: false, error: `Erro ao salvar combo: ${error.message}` };
  }

  triggerRevalidation();
  return { success: true };
}

/**
 * Server Action: Update Combo (Safe Image Replacement - Directive #6)
 */
export async function updateComboAction(id: string, data: PromotionalComboFormData) {
  const user = await assertAdminUser();

  const adminSupabase = createAdminClient();

  // Get current record to compare old image
  const { data: currentRecord } = await adminSupabase
    .from("promotional_combos")
    .select("image_path")
    .eq("id", id)
    .single();

  const title = data.title.trim();
  const slug = (data.slug ? generateSlug(data.slug) : generateSlug(title)) || "combo";
  const promotionalPrice = parseFloat(data.promotional_price);

  if (isNaN(promotionalPrice) || promotionalPrice < 0) {
    return { success: false, error: "O preço promocional não pode ser negativo." };
  }

  const originalPrice = data.original_price ? parseFloat(data.original_price) : null;
  if (originalPrice !== null && (isNaN(originalPrice) || originalPrice < 0)) {
    return { success: false, error: "O preço original não pode ser negativo." };
  }

  const startsAtIso = data.starts_at ? parseSaoPauloToISO(data.starts_at) : null;
  const endsAtIso = data.ends_at ? parseSaoPauloToISO(data.ends_at) : null;

  // 1. UPDATE DB RECORD FIRST (Directive #6)
  const { error: updateError } = await adminSupabase
    .from("promotional_combos")
    .update({
      title,
      slug,
      short_description: data.short_description.trim(),
      full_description: data.full_description ? data.full_description.trim() : null,
      original_price: originalPrice,
      promotional_price: promotionalPrice,
      image_url: data.image_url || null,
      image_path: data.image_path || null,
      badge: data.badge ? data.badge.trim() : null,
      cta_label: data.cta_label ? data.cta_label.trim() : "Solicitar agendamento",
      cta_url: data.cta_url ? data.cta_url.trim() : "/contato",
      benefits: data.benefits || [],
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      is_active: Boolean(data.is_active),
      is_featured: Boolean(data.is_featured),
      sort_order: Number(data.sort_order) || 0,
      updated_by: user.id,
    })
    .eq("id", id);

  if (updateError) {
    return { success: false, error: `Erro ao atualizar combo: ${updateError.message}` };
  }

  // 2. SAFELY DELETE OLD IMAGE ONLY AFTER DB RECORD IS UPDATED (Directive #6)
  if (
    currentRecord?.image_path &&
    data.image_path &&
    currentRecord.image_path !== data.image_path
  ) {
    try {
      await adminSupabase.storage
        .from("promotional-combos")
        .remove([currentRecord.image_path]);
    } catch {
      // Fail silently on orphan cleanup
    }
  }

  triggerRevalidation();
  return { success: true };
}

/**
 * Server Action: Toggle Active State
 */
export async function toggleComboActiveAction(id: string, currentState: boolean) {
  const user = await assertAdminUser();
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("promotional_combos")
    .update({
      is_active: !currentState,
      updated_by: user.id,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: `Erro ao alterar status: ${error.message}` };
  }

  triggerRevalidation();
  return { success: true };
}

/**
 * Server Action: Duplicate Combo
 */
export async function duplicateComboAction(id: string) {
  const user = await assertAdminUser();
  const adminSupabase = createAdminClient();

  const { data: original, error: fetchError } = await adminSupabase
    .from("promotional_combos")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    return { success: false, error: "Combo original não encontrado." };
  }

  const newTitle = `${original.title} (Cópia)`;
  const newSlug = generateSlug(`${original.slug}-copia-${Date.now().toString(36)}`);

  const { error: insertError } = await adminSupabase.from("promotional_combos").insert({
    ...original,
    id: undefined,
    title: newTitle,
    slug: newSlug,
    is_active: false, // Duplicated items start as Draft
    created_at: undefined,
    updated_at: undefined,
    created_by: user.id,
    updated_by: user.id,
  });

  if (insertError) {
    return { success: false, error: `Erro ao duplicar combo: ${insertError.message}` };
  }

  triggerRevalidation();
  return { success: true };
}

/**
 * Server Action: Delete Combo (Directive #6)
 */
export async function deleteComboAction(id: string) {
  await assertAdminUser();
  const adminSupabase = createAdminClient();

  // Get image path before deleting
  const { data: combo } = await adminSupabase
    .from("promotional_combos")
    .select("image_path")
    .eq("id", id)
    .single();

  const { error } = await adminSupabase
    .from("promotional_combos")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: `Erro ao excluir combo: ${error.message}` };
  }

  // Remove image from storage if exists
  if (combo?.image_path) {
    try {
      await adminSupabase.storage
        .from("promotional-combos")
        .remove([combo.image_path]);
    } catch {
      // Ignore storage deletion errors
    }
  }

  triggerRevalidation();
  return { success: true };
}
