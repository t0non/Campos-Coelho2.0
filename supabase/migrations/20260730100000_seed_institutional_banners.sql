insert into public.banners (
  id,
  title,
  subtitle,
  image_url,
  mobile_image_url,
  link_url,
  position,
  is_active
)
values
  (
    'f96dd5f4-bf54-4c2a-a9b5-b2db9c8b4a01',
    'Atendimento por telefone',
    '__institutional__',
    '/images/institutional/contact-phone-desktop-v1.webp',
    '/images/institutional/contact-phone-mobile-v1.webp',
    '/',
    80,
    true
  ),
  (
    'f96dd5f4-bf54-4c2a-a9b5-b2db9c8b4a02',
    'Nossa localização',
    '__institutional__',
    '/images/institutional/location-desktop-v1.webp',
    '/images/institutional/location-mobile-v1.webp',
    '/',
    81,
    true
  )
on conflict (id) do nothing;
