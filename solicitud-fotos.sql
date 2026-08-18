-- Fotos en la solicitud de proveedor.
--
-- Al registrarse, el proveedor sube de 2 a 8 fotos de su trabajo. Se guardan en
-- Storage (bucket fotos-servicios, bajo su propia carpeta) y aca solo quedan
-- sus URLs, para que el admin las vea al aprobar.
--
-- Se pega en el SQL editor de Supabase y se ejecuta. Es idempotente.
-- Correr ANTES de desplegar el registro con fotos (si no, el insert sin la
-- columna falla; el codigo igual reintenta sin fotos, pero conviene correrlo).

alter table solicitudes_proveedor
  add column if not exists fotos text[] not null default '{}';

comment on column solicitudes_proveedor.fotos is
  'URLs (en Storage) de las fotos que el proveedor subio al registrarse.';
