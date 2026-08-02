-- Badge de fundador: la columna y su candado.
--
-- Marca a los primeros proveedores del programa fundador, los que no van a
-- pagar comision durante los seis meses siguientes al dia en que activemos los
-- cobros. El catalogo la lee para pintar el anillo dorado en la tarjeta.
--
-- Se pega en el SQL editor de Supabase y se ejecuta con el rol postgres. Es
-- idempotente: se puede correr dos veces sin romper nada.

alter table profiles
  add column if not exists is_founder boolean not null default false;

comment on column profiles.is_founder is
  'Proveedor del programa fundador. Solo lo marca un admin.';

-- El badge es una promesa comercial, asi que no puede ser autoservicio: sin
-- este candado cualquier proveedor se lo pone solo con un update contra la API
-- y deja de significar nada.
--
-- Va como trigger aparte y no dentro de protect_profile_privileges() para no
-- reescribir una funcion que hoy protege bien los otros cinco campos. En
-- INSERT no existe OLD, asi que ahi el valor se fuerza a false.
create or replace function protect_founder_badge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if es_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.is_founder := false;
  else
    new.is_founder := old.is_founder;
  end if;
  return new;
end;
$$;

drop trigger if exists zz_protect_founder_badge on profiles;
create trigger zz_protect_founder_badge
  before insert or update on profiles
  for each row execute function protect_founder_badge();

-- El boton del panel de admin llama a esta funcion. Tiene que ser un RPC y no
-- un update directo por dos razones: RLS no deja que un admin escriba en el
-- perfil de otro, y el chequeo de permiso tiene que vivir en la base y no en
-- el navegador. Mismo patron que aprobar_proveedor y rechazar_proveedor.
--
-- Devuelve cuantos fundadores quedaron, que es lo que el panel muestra al lado
-- del limite de 20. El limite no se fuerza aca a proposito: pasarse no es un
-- ataque sino una decision comercial, y el numero puede cambiar. El panel
-- avisa antes de cruzarlo.
create or replace function marcar_fundador(p_user_id uuid, p_valor boolean)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare total int;
begin
  if not es_admin() then
    raise exception 'Solo un admin puede marcar fundadores';
  end if;

  update profiles set is_founder = coalesce(p_valor, false) where id = p_user_id;
  if not found then
    raise exception 'No existe ese perfil';
  end if;

  select count(*) into total from profiles where is_founder;
  return total;
end;
$$;

revoke all on function marcar_fundador(uuid, boolean) from public, anon;
grant execute on function marcar_fundador(uuid, boolean) to authenticated;

-- A mano, si hiciera falta, desde el SQL editor (que corre como postgres):
--
--   update profiles set is_founder = true where id = 'el-uuid-del-proveedor';
--   select count(*) from profiles where is_founder;
