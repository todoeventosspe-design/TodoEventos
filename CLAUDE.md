# TodoEventos.pe — contexto del proyecto

Este archivo lo lee Claude Code al iniciar cada sesión. Es el punto de partida
para cualquier chat nuevo: léelo entero antes de tocar nada.

## Qué es

Marketplace de servicios para eventos en Lima, Perú. Conecta a clientes que
organizan un evento (boda, cumpleaños, promoción) con proveedores (DJs,
catering, fotógrafos, locales, animadores, etc.). El gancho para captar
proveedores es un panel de herramientas gratis (agenda, cotizador con PDF,
caja, CRM, inventario, reportes); el marketplace viene de yapa.

## Arquitectura (las 3 piezas)

- **Código → GitHub** (`todoeventosspe-design/TodoEventos`). Sitio de **HTML
  estático puro**, sin build. Cada página es un `.html` autónomo.
- **Hosting → Vercel.** Dominio **todoeventos.website** (comprado en Vercel).
  Se **despliega solo** en ~30s cada vez que se mergea a `main`. Un solo
  proyecto Vercel conectado al repo.
- **Base de datos → Supabase** (proyecto `vqnyaozauljtashpjfoo`). Postgres con
  RLS. Auth de Supabase + **Resend** como SMTP (correos de confirmación con
  código de 8 dígitos).
- **Asistentes de IA → ElevenLabs.** Raymi (clientes, `agent_1801kyrek4bjebtsayxyheen8zqc`)
  y Asesor Personal (proveedores, `agent_5301kz33f0fbfztb6rpxnr8nxf7z`).

## Mapa de archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Landing / inicio |
| `catalogo.html` | Marketplace: grilla, filtros, ficha, reserva, chat Raymi |
| `dashboard.html` | Panel del proveedor (agenda, cotizador, caja, CRM, inventario, reportes, Mi Perfil) |
| `cuenta.html` | Cuenta del cliente (info, reputación, servicios contratados, reseñas) |
| `admin.html` | Panel de admin: aprobar/rechazar proveedores, badges de fundador, feedback |
| `login.html` | Login + registro (cliente y proveedor), verificación por código |
| `nosotros.html`, `proveedores.html`, `confirmacion.html` | Institucionales / flujo |
| `feedback.js` | Widget de feedback incluido en todas las páginas |
| `*.sql` | Migraciones que se corren A MANO en el SQL editor de Supabase |
| `MARKETING.md`, `SEGURIDAD.md`, `ASISTENTE.md` | Decisiones de fondo — LEER |

## Cómo se trabaja (convenciones)

- **Nada importante lo decide el navegador.** Plata, fechas, permisos y
  reputación los decide Postgres (RLS + triggers). El JS es editable desde el
  inspector, así que cualquier validación que viva solo ahí no vale.
- **Flujo de cambios:** rama `claude/todoeventos-edcixu` → commit → PR → el
  humano la mergea → Vercel despliega. NO se pushea directo a `main`.
- **SQL:** los archivos `.sql` NO se aplican solos. El humano los pega en el
  **SQL Editor de Supabase** y les da Run. Borrar el texto del editor no
  deshace nada; los cambios quedan en la base. El editor es solo un borrador.
  - Ya corridos: `fundador.sql`, `pentest.sql`, `seguridad-correo.sql`,
    `programa-fundador.sql`, la columna `solicitudes_proveedor.fotos`, la
    política de lectura de solicitudes para el admin.
  - `pentest.sql` termina en un "error" a propósito; si dice `OK_PENTEST :: 19
    checks` está todo bien.
- **Seguridad ya montada:** RLS por `provider_id`; trigger
  `protect_profile_privileges()` protege is_admin/rol/rating/reseñas;
  `protect_founder_badge()` protege is_founder; `fotoSegura()`/`fotoAdminSegura()`
  validan que las URLs de fotos sean del Storage; `esc()` antes de todo
  `innerHTML`; la agenda tiene constraint anti-solapamiento.
- **ElevenLabs:** colores y textos del widget se configuran en el PANEL de cada
  agente, NO en el HTML (el panel gana). La API key nunca va en el repo.

## Estado actual (a la fecha del último trabajo)

Funcionando y en producción: catálogo, reserva blindada, panel del proveedor
completo, admin (aprobar/rechazar + fundadores + feedback), auth con correos
por Resend, dominio propio con HTTPS y auto-deploy, seguridad (pentest 19/19).
Registro de proveedor con nombre = negocio, edición de perfil, y subida de
2–8 fotos que el admin ve al aprobar.

Correcciones del feedback de un amigo (programador/marketing) ya aplicadas:
favicon de marca en todas las páginas (`favicon.svg`); alto del hero fijo (los
3 slides se apilan en la misma celda de grid, ya no salta); form de registro
de proveedor con inputs alineados aunque el label ocupe 2 líneas; popups
propios (`teConfirm`/`teAviso`) en lugar de los `confirm/alert` nativos de
Chrome en el flujo de reserva del catálogo; visor de fotos (lightbox) al hacer
clic en cualquier galería del catálogo; botón de favorito funcional (se marca
y se recuerda en `localStorage`); modal de feedback reestilizada al tema claro
(antes quedó oscura del tema viejo). La barra de categorías ya estaba unificada
entre index y catálogo (12 categorías idénticas). Los `alert/confirm` internos
del dashboard y admin se dejaron nativos a propósito (herramientas internas).

## Pendientes (revisar y priorizar con el humano)

- **ElevenLabs (config de panel):** declarar las 3 client tools de Raymi (para
  que no invente precios), colores morado/naranja de los widgets, pegar el
  párrafo de navegación en el prompt de Raymi.
- **Correr en Supabase lo nuevo que aún no:** `feedback.sql`.
- **Pruebas e2e** completas con cuentas reales antes de traer proveedores.
- **Foto de Vicente** en Nosotros (la de Julián ya está optimizada en WebP).
- **Pagos** (necesita RUC/pasarela) — desbloquea mensajería, adelantos, SEO.
- **Protección de contraseñas filtradas:** requiere plan Pro de Supabase.

## Detalle largo

Para el "por qué" de las decisiones, leer `MARKETING.md` (captación y qué se
puede prometer), `SEGURIDAD.md` (cómo está protegida la base) y `ASISTENTE.md`
(el agente del catálogo). El tablero de auditoría del estado está en un
artifact de la sesión (pedir el link al humano si hace falta).
