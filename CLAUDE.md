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
| `analytics.js` | Vercel Web Analytics + evento `clic_boton` por cada clic en botón/enlace, incluido en todas las páginas. Falta activar "Web Analytics" en el panel de Vercel (paso del humano). |
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
    política de lectura de solicitudes para el admin, y `opciones-servicio.sql`
    (columna `services.opciones jsonb`, aplicada vía MCP el 2026-08-26).
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

Fix de móvil (barra de navegación): la barra del nav (logo + links + buscador
+ 2 botones) no entraba en celular y se desbordaba a la derecha; eso hacía que
el celular encogiera toda la página (shrink-to-fit) con la franja blanca a la
derecha. Arreglado en `estilo.css` (nav compacto en ≤760px: se ocultan los
links de texto y el buscador, quedan logo + "Para proveedores" + "Ingresar")
y en `catalogo.html` (una media query de touch-targets volvía a mostrar
`.btn-prov`/`.nl-link` que estaban ocultos). También se colapsó la franja de
confianza (`.tbar`) a 1 columna en móvil (una regla sin media query la dejaba
siempre en 3). OJO con Vercel: si la web en vivo se ve distinta al repo (hero
viejo de 2 columnas), es un deploy viejo — hay que asegurar que Vercel
despliegue el `main` actual.

Opciones de precio por servicio: en "Editar servicio" del dashboard el
proveedor arma opciones con dos modos — "Precio por unidad o por paquete"
(nombre + precio) y "Mínimo + extra por unidad" (nombre + precio del mínimo +
cantidad mínima + precio c/u extra). Se guardan en `services.opciones` (jsonb,
hereda el RLS de services) y se muestran al cliente dentro del detalle de cada
servicio en el catálogo (sección "Opciones y precios"). El precio base sigue
siendo el "desde" del catálogo.

Repaso de móvil completo (todas las páginas verificadas renderizando a 360/390px,
el ancho del documento queda igual al viewport, sin scroll horizontal): inicio,
catálogo (+ modales de proveedor, reserva y carrito), login, cuenta, nosotros,
para-proveedores. En el dashboard del proveedor las tablas de 5 columnas ahora
se deslizan de lado dentro de `.tbl-scroll` en vez de apretujarse, el sidebar ya
era un cajón con hamburguesa (`toggleNav`) en ≤720px, y stat-grid colapsa a 1
columna en móvil.

Fix de "no me deja cambiar la foto del servicio" (dashboard, Editar servicio):
dos bugs distintos, ambos arreglados.
1. Las miniaturas de foto tenían `draggable="true"` (reordenar arrastrando,
   feature de otra sesión) — el drag nativo es SOLO de mouse, pero en celular
   (sobre todo iOS Safari) el navegador igual "atrapaba" el gesto del dedo
   pensando que era el inicio de un drag, bloqueando el scroll de la modal
   justo al llegar a las fotos. Arreglado: `touch-action:pan-y` en
   `.service-img-item`, y `draggable` ya no se pone en pantallas táctiles
   (detectado con `esDispositivoTactil()`, `matchMedia('(pointer: coarse)')`).
2. El bug real detrás de "subí la foto nueva pero la que se ve sigue siendo la
   vieja": quitar la portada (foto 1) y agregar una nueva la manda al FINAL
   del arreglo, no al frente — y la portada (`image_url`, la que se ve en el
   marketplace) es siempre `imagenes[0]`. La única forma de cambiar cuál foto
   quedaba de portada era arrastrar, que en celular no funcionaba para nada
   (ver punto 1) y en computadora no era evidente. Arreglado: botón directo
   "Hacer portada" en cada foto que no es la portada (`hacerPortadaServicioImagen`),
   funciona igual con clic o con tap. El arreglo se probó de punta a punta con
   Playwright (quitar + agregar + hacer portada + guardar), casos de 1 foto y
   de varias, y en modo táctil — sin errores, el `image_url` final queda
   correcto en los 3 casos.

Visor de servicio (dashboard, "Mi Perfil" → clic en un servicio) y recortador
de fotos: mismo bug de fondo que el punto anterior — `#service-viewer-overlay`
no tenía `max-height`/`overflow-y`, así que con varias fotos/opciones se salía
de la pantalla por arriba Y por abajo, sin forma de scrollear ni de llegar al
botón "Editar este servicio". Arreglado igual que el modal de editar (88vh +
overflow-y:auto), y se agregó un botón "Editar" compacto arriba junto al
título (visible apenas se abre, sin scrollear) además del que ya había abajo.

Nuevo: recortador/preview de foto (`abrirRecorteFoto`, dentro de "Editar
servicio" → clic en cualquier foto). Muestra la foto en un marco con la
proporción real de donde se usa — 3:2 para la portada (como se ve la tarjeta
del catálogo), 1:1 para las demás (como se ven en las galerías) — con
arrastre (Pointer Events, mouse y táctil) y zoom (slider) para elegir qué
parte queda visible. Al guardar, recorta con `<canvas>` en el navegador,
sube el resultado como una foto NUEVA a `fotos-servicios` y reemplaza esa URL
en el arreglo (la original queda huérfana en Storage, mismo comportamiento ya
existente al "quitar" una foto — no se borra nada del bucket). Requiere que
el bucket sirva con CORS abierto para que `canvas.toBlob()` no falle por
"tainted canvas" (los buckets públicos de Supabase Storage lo hacen por
default; no se pudo probar contra el proyecto real desde este entorno, avisar
si en producción tira error de seguridad al recortar). Probado de punta a
punta con Playwright: centrado inicial correcto, arrastre cambia el offset y
lo limita bien en los extremos, el zoom cambia la escala, y guardar sube el
blob y reemplaza la foto correcta en el arreglo — sin errores.

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
