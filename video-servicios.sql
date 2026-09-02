-- Video por servicio: campo + bucket de Storage + politicas.
-- YA APLICADA via MCP el 2026-09-02. Queda aca como registro.

alter table services add column if not exists video_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos-servicios', 'videos-servicios', true, 52428800,
        array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;

-- Lectura publica (el catalogo muestra el video a cualquier visitante)
create policy "lectura publica de videos de servicios"
on storage.objects for select
using (bucket_id = 'videos-servicios');

-- El proveedor solo sube/borra dentro de su propia carpeta (su user id),
-- mismo patron que ya usa el bucket "fotos-servicios".
create policy "proveedor sube su video"
on storage.objects for insert
with check (bucket_id = 'videos-servicios' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "proveedor borra su video"
on storage.objects for delete
using (bucket_id = 'videos-servicios' and (storage.foldername(name))[1] = auth.uid()::text);
