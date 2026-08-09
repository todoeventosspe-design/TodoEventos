-- Interruptor del programa fundador: poder DEJAR de otorgar badges cuando
-- queramos, sin quitarle el suyo a los que ya lo tienen.
--
-- Idea: una perilla global "programa abierto / cerrado". Mientras está abierta,
-- el admin puede marcar fundadores como hasta ahora. Cuando la plataforma ya
-- lleve tiempo y no queramos dar más, el admin la cierra desde su panel y a
-- partir de ahí no se pueden marcar nuevos. Los fundadores existentes quedan
-- intactos: cerrar no borra nada.
--
-- Se pega en el SQL editor de Supabase DESPUÉS de fundador.sql. Es idempotente.

-- 1) Una tabla de una sola fila para la configuración de la app.
create table if not exists app_config (
  id                   int primary key default 1,
  founder_program_open boolean not null default true,
  constraint app_config_singleton check (id = 1)
);
insert into app_config (id) values (1) on conflict (id) do nothing;

-- Cualquiera logueado puede LEER el estado (el panel lo muestra). Nadie escribe
-- directo: se cambia solo por la función de abajo, que valida que seas admin.
alter table app_config enable row level security;
drop policy if exists app_config_lectura on app_config;
create policy app_config_lectura on app_config
  for select to authenticated using (true);

-- 2) Abrir / cerrar el programa. Solo admin.
create or replace function set_founder_program(p_open boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not es_admin() then
    raise exception 'Solo un admin puede abrir o cerrar el programa fundador';
  end if;
  update app_config set founder_program_open = coalesce(p_open, true) where id = 1;
  return coalesce(p_open, true);
end;
$$;
revoke all on function set_founder_program(boolean) from public, anon;
grant execute on function set_founder_program(boolean) to authenticated;

-- 3) marcar_fundador ahora respeta la perilla: si el programa está cerrado, no
--    deja MARCAR nuevos (pero sí deja QUITAR, por si hay que corregir).
create or replace function marcar_fundador(p_user_id uuid, p_valor boolean)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare total int; abierto boolean;
begin
  if not es_admin() then
    raise exception 'Solo un admin puede marcar fundadores';
  end if;

  -- solo se controla al MARCAR; quitar siempre se permite
  if coalesce(p_valor, false) then
    select founder_program_open into abierto from app_config where id = 1;
    if not coalesce(abierto, true) then
      raise exception 'El programa fundador está cerrado. Ábrelo antes de marcar nuevos fundadores.';
    end if;
  end if;

  update profiles set is_founder = coalesce(p_valor, false) where id = p_user_id;
  if not found then
    raise exception 'No existe ese perfil';
  end if;

  select count(*) into total from profiles where is_founder;
  return total;
end;
$$;

-- Cómo usarlo:
--   Cerrar el programa (dejar de dar badges):  select set_founder_program(false);
--   Reabrirlo:                                 select set_founder_program(true);
--   Ver el estado:                             select founder_program_open from app_config;
-- Desde el panel de admin también hay un botón para esto (pestaña Aprobados).
