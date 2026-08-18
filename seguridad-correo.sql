-- Cierra el hueco del correo público.
--
-- El problema (SEGURIDAD.md / MARKETING.md): cualquiera, sin registrarse, podía
-- pedirle a la API el email de todos los proveedores. Choca con la idea de que
-- el contacto se abre recién tras reservar, y le regala a un competidor la
-- lista entera de a quién contactar.
--
-- El arreglo: el rol anónimo deja de poder leer la columna `email` de profiles,
-- pero conserva TODO lo demás (nombre, distrito, rating, etc.) para que el
-- catálogo y los perfiles públicos sigan funcionando igual. Los usuarios
-- logueados (dueño del perfil, admin) NO se tocan: siguen leyendo su propio
-- correo y los admins el de los postulantes.
--
-- Se hace con un bloque que descubre las columnas solo, así no depende del
-- esquema exacto y no hay forma de olvidar una columna y dejar el catálogo en
-- blanco. Se pega en el SQL editor de Supabase y se ejecuta. Es idempotente.

do $$
declare cols text;
begin
  -- todas las columnas de profiles MENOS email (y menos telefono/phone si algún
  -- día existe: son igual de sensibles y conviene no exponerlas al anónimo)
  select string_agg(quote_ident(column_name), ', ')
    into cols
    from information_schema.columns
    where table_schema = 'public'
      and table_name  = 'profiles'
      and column_name not in ('email', 'phone', 'telefono');

  if cols is null then
    raise exception 'No encontré la tabla public.profiles';
  end if;

  -- se quita el SELECT a nivel tabla (que abarca todas las columnas) y se
  -- devuelve solo sobre las columnas seguras
  execute 'revoke select on public.profiles from anon';
  execute 'grant select ('||cols||') on public.profiles to anon';
end $$;

-- Comprobación rápida: esto, corrido como anónimo, debe FALLAR con
-- "permission denied for column email":
--   set role anon; select email from profiles limit 1; reset role;
-- Y esto debe seguir funcionando (el catálogo):
--   set role anon; select full_name, location, rating from profiles limit 1; reset role;

-- ── Pendiente que NO es SQL ──
-- La "protección de contraseñas filtradas" se prende con un toggle en el panel
-- de Supabase: Authentication → Policies (compara contra HaveIBeenPwned).
