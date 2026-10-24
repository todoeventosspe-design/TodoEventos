-- Blindaje del flujo de reservas (tabla "requests").
--
-- Arregla dos huecos que tenia el flujo "pendiente -> el proveedor decide":
--
-- 1) Una reserva pendiente NO bloqueaba la agenda (el trigger solo disparaba
--    si nacia "confirmada", pero zz_forzar_reserva_pendiente la fuerza a
--    "pendiente"). Dos clientes podian pedir el mismo horario y al aceptar la
--    segunda el choque fallaba en silencio desde el navegador.
--    Ahora la agenda se bloquea apenas nace la reserva, y el estado de la
--    agenda sigue al de la reserva (confirmar / rechazar / cancelar) dentro de
--    la base, no desde el JS.
--
-- 2) Cliente y proveedor podian editar CUALQUIER columna de su reserva por la
--    API (montos, comision, fechas, o confirmarse la reserva el propio
--    cliente). Ahora solo se puede cambiar el estado, y solo en transiciones
--    validas segun quien lo hace.
--
-- Se corre A MANO en el SQL Editor de Supabase. No toca blindar_reserva() ni
-- zz_forzar_reserva_pendiente().

-- ─── 1. Agenda: bloquear desde que nace la reserva ───────────────────────────
create or replace function bloquear_agenda_por_reserva()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into agenda (provider_id, request_id, title, event_date, type, client_name, start_time, end_time, status)
  values (new.provider_id, new.id, coalesce(new.event_type,'Evento') || ' — ' || new.client_name,
          new.event_date, coalesce(new.event_type,'Evento'), new.client_name, new.start_time, new.end_time,
          case when new.status = 'confirmada' then 'Confirmado' else 'Pendiente' end);
  return new;
end;
$$;

drop trigger if exists trg_bloquear_agenda on requests;
create trigger trg_bloquear_agenda
  after insert on requests
  for each row
  execute function bloquear_agenda_por_reserva();

-- ─── 2. La agenda sigue el estado de la reserva ──────────────────────────────
create or replace function sincronizar_agenda_por_estado()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.status = 'confirmada' then
    update agenda set status = 'Confirmado' where request_id = new.id;
    if not found then
      insert into agenda (provider_id, request_id, title, event_date, type, client_name, start_time, end_time, status)
      values (new.provider_id, new.id, coalesce(new.event_type,'Evento') || ' — ' || coalesce(new.client_name,'Cliente'),
              new.event_date, coalesce(new.event_type,'Evento'), new.client_name, new.start_time, new.end_time, 'Confirmado');
    end if;
  elsif new.status in ('rechazada','cancelada') then
    delete from agenda where request_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sincronizar_agenda_estado on requests;
create trigger trg_sincronizar_agenda_estado
  after update of status on requests
  for each row
  when (old.status is distinct from new.status)
  execute function sincronizar_agenda_por_estado();

-- ─── 3. Solo se puede cambiar el estado, y solo en transiciones validas ──────
-- auth.uid() null = SQL Editor / service_role: se deja pasar (arreglos del admin).
create or replace function proteger_reserva()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return new;
  end if;

  if (new.provider_id, new.service_id, new.client_id, new.event_date, new.start_time, new.end_time,
      new.total_amount, new.commission_amount, new.client_name, new.client_email, new.client_phone,
      new.event_type, new.message, new.created_at)
     is distinct from
     (old.provider_id, old.service_id, old.client_id, old.event_date, old.start_time, old.end_time,
      old.total_amount, old.commission_amount, old.client_name, old.client_email, old.client_phone,
      old.event_type, old.message, old.created_at) then
    raise exception 'Solo se puede cambiar el estado de una reserva';
  end if;

  if new.status = old.status then
    return new;
  end if;

  if uid = old.provider_id then
    if old.status = 'pendiente' and new.status in ('confirmada','rechazada') then return new; end if;
    if old.status = 'confirmada' and new.status = 'cancelada' then return new; end if;
  elsif uid = old.client_id then
    if old.status in ('pendiente','confirmada') and new.status = 'cancelada' then return new; end if;
  end if;

  raise exception 'Cambio de estado no permitido';
end;
$$;

drop trigger if exists trg_proteger_reserva on requests;
create trigger trg_proteger_reserva
  before update on requests
  for each row
  execute function proteger_reserva();
