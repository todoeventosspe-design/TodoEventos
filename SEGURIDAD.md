# Cómo está protegida la base

Notas para acordarnos de por qué las cosas están como están, y no romperlas
sin querer más adelante.

La regla de fondo: **el navegador no decide nada importante**. Todo lo que
tenga que ver con plata, fechas, permisos o reputación lo decide Postgres. El
JavaScript de la web se puede editar desde el inspector del navegador, así que
cualquier validación que viva solo ahí no sirve de nada.

## Quién ve qué

Cada tabla del proveedor (agenda, caja, clientes, inventario, plantillas,
cotizaciones) tiene RLS activo con la misma política: `provider_id` tiene que
ser igual al usuario de la sesión. Un proveedor no puede leer ni escribir en
las filas de otro, aunque arme la consulta a mano contra la API.

Las políticas usan `(select auth.uid())` y no `auth.uid()` a secas. Es lo
mismo, pero envuelto en `select` Postgres lo calcula una vez por consulta en
lugar de una vez por fila. Si escribes una política nueva, mantén ese formato.

## Los campos del perfil que el usuario no puede tocar

`profiles` tiene un trigger, `protect_profile_privileges()`, que ante cualquier
UPDATE de alguien que no sea admin vuelve a poner el valor anterior en:

- `is_admin`, porque si no cualquiera se hace administrador
- `verification_status`, porque si no cualquiera se aprueba solo y sale en el catálogo
- `role`, para que no se cambie de cliente a proveedor por su cuenta
- `rating` y `reviews_count`, para que nadie se ponga cinco estrellas y 500 reseñas

El usuario sí puede editar su nombre, bio, foto, portada, distrito y
categoría. Si algún día hay que agregar un campo sensible nuevo, va en esa
lista.

Ojo con una trampa al probar esto: el trigger no cancela el UPDATE, deja que
pase y revierte los campos. Entonces la consulta igual reporta "1 fila
afectada". Para saber si funciona hay que mirar el **valor final**, no el
número de filas.

## Aprobar y rechazar proveedores

Son dos funciones (`aprobar_proveedor`, `rechazar_proveedor`) que empiezan con
`IF NOT es_admin() THEN RAISE EXCEPTION`. Cualquiera puede llamarlas desde la
API, pero si no eres admin te rebota.

El linter de Supabase las marca en amarillo junto con `es_admin()`, porque ve
que son `SECURITY DEFINER` y que están expuestas. Es un falso positivo: el
linter no puede ver el `IF` de adentro. `es_admin()` tiene que seguir siendo
llamable por `anon` y `authenticated` porque las políticas RLS la usan.

## Fotos

Las fotos solo se aceptan si la URL empieza con el bucket de Storage del
proyecto. Cualquier otra cosa (`javascript:`, `data:`, un dominio ajeno) se
descarta y se muestra el placeholder. Está en `fotoSegura()` en catalogo.html.
Todo lo que se mete en `innerHTML` pasa antes por `esc()`.

## Fechas

La tabla `agenda` tiene una constraint `EXCLUDE` sobre el rango de tiempo, así
que dos eventos del mismo proveedor no pueden solaparse. No es una validación
del formulario: es la base la que rechaza el insert. Por eso funciona incluso
si dos personas reservan al mismo tiempo.

## Correr el pentest

`pentest.sql` prueba todo lo de arriba: aislamiento entre proveedores,
escritura a nombre ajeno y los cinco intentos de escalada de privilegios. Se
pega en el SQL editor de Supabase y se ejecuta.

Termina lanzando una excepción a propósito, y eso revierte las filas de prueba
que insertó. Si el mensaje dice `OK_PENTEST` está todo bien. Si dice `FALLOS`,
el texto indica qué se pudo hacer que no debería poderse.

Hoy pasa los 18 checks.

## Lo que falta

**Protección de contraseñas filtradas.** Está apagada. Se prende con un toggle
en el panel de Supabase, en Authentication > Policies. Compara contra
HaveIBeenPwned para que nadie use una contraseña que ya se filtró en otro
lado.

**Pruebas de punta a punta con cuentas reales.** El pentest cubre la base de
datos, pero no el recorrido completo por la web con un cliente, un proveedor y
un admin de verdad.

**Políticas duplicadas.** El linter marca 45 casos de tablas con más de una
política permisiva para el mismo rol y acción. Evaluar dos políticas en vez de
una cuesta un poco más, pero juntarlas significa reescribir reglas de
seguridad que hoy funcionan. Con el tráfico actual no se nota. Si algún día se
toca, hay que correr el pentest después.

**`btree_gist` está en el esquema `public`.** Moverlo obliga a recrear la
constraint de la agenda. No vale la pena por ahora.
