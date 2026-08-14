-- Tabla de feedback: comentarios que cualquiera puede enviar desde el botón
-- que aparece en todas las páginas. Solo el admin los lee (desde su panel).
--
-- Se pega en el SQL editor de Supabase y se ejecuta. Es idempotente.

create table if not exists feedback (
  id         bigint generated always as identity primary key,
  mensaje    text not null,
  pagina     text,
  email      text,
  created_at timestamptz not null default now()
);

alter table feedback enable row level security;

-- Enviar feedback: abierto a todos (anónimos y logueados).
grant insert on feedback to anon, authenticated;
drop policy if exists feedback_enviar on feedback;
create policy feedback_enviar on feedback
  for insert to anon, authenticated
  with check (true);

-- Leerlo: solo el admin.
grant select on feedback to authenticated;
drop policy if exists feedback_admin_lee on feedback;
create policy feedback_admin_lee on feedback
  for select to authenticated
  using (es_admin());

-- Nota: no se le da SELECT a anon, así que nadie puede leer el feedback de los
-- demás desde la API pública. Solo insertar.
