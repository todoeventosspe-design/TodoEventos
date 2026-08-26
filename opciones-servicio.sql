-- Opciones de precio por servicio (unidad / paquete / mínimo + extra).
-- Se guardan como un arreglo JSON dentro de la propia fila del servicio, así
-- heredan el RLS que ya tiene "services" (el proveedor edita los suyos, el
-- público lee los activos). No hace falta tabla nueva ni políticas nuevas.
--
-- Forma de cada opción dentro del arreglo:
--   { "tipo":"simple", "nombre":"DJ por hora", "precio":150 }
--   { "tipo":"minimo", "nombre":"Sillas Tiffany", "precio_min":300,
--     "cant_min":50, "precio_extra":6 }
--
-- YA CORRIDO en Supabase (vía MCP) el 2026-08-26. Se deja acá como registro.

alter table public.services
  add column if not exists opciones jsonb not null default '[]'::jsonb;
