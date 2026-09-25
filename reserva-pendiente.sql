-- Hace que las reservas nuevas nazcan "pendiente" (el proveedor tiene que
-- aceptarlas o rechazarlas) en vez de nacer "confirmada" de una.
--
-- IMPORTANTE: no toca la funcion blindar_reserva() para nada -- esa funcion
-- ya calcula precio/comision/datos del cliente y bloquea la agenda, y no
-- tenemos forma de leer su codigo actual desde aca para editarla a ciegas
-- (podria romper el calculo de comision o el anti-solapamiento). En vez de
-- eso, se agrega un SEGUNDO trigger BEFORE INSERT que corre DESPUES del de
-- blindar_reserva (el nombre "zz_" lo manda al final del orden alfabetico,
-- que es el orden en que Postgres ejecuta los triggers BEFORE de una misma
-- fila) y simplemente pisa el status a 'pendiente' justo antes de guardar.
--
-- La agenda se sigue bloqueando igual (blindar_reserva ya lo hace), asi que
-- nadie mas puede reservar ese horario mientras el proveedor decide.

create or replace function forzar_reserva_pendiente()
returns trigger
language plpgsql
as $$
begin
  new.status := 'pendiente';
  return new;
end;
$$;

drop trigger if exists zz_forzar_reserva_pendiente on requests;

create trigger zz_forzar_reserva_pendiente
  before insert on requests
  for each row
  execute function forzar_reserva_pendiente();

-- Verificacion rapida despues de correr esto: en el SQL editor, mira los
-- triggers de la tabla "requests" y confirma que el de blindar_reserva
-- (o como se llame) queda ANTES que "zz_forzar_reserva_pendiente" en el
-- orden alfabetico. Si por algun motivo el trigger de blindar_reserva
-- empieza con una letra "z" o mas adelante, avisame y lo renombramos.
--
--   select tgname from pg_trigger
--   where tgrelid = 'requests'::regclass and not tgisinternal
--   order by tgname;
