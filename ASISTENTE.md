# El asistente del catálogo

El chat que está en `catalogo.html` es un agente de ElevenLabs. Antes era un
motor de reglas escrito a mano: unas quinientas líneas de expresiones
regulares que adivinaban la intención por palabras sueltas y respondían con
textos ya escritos. Funcionaba mientras el usuario preguntara lo previsto y se
quedaba mudo apenas se salía del guion.

Ahora la conversación la maneja el agente en la nube. En el repo quedan tres
funciones que le dan acceso al catálogo real.

## Por qué esas tres funciones importan

Un agente de lenguaje suelto, sin acceso a la base, inventa. Si alguien
pregunta cuánto cobra un DJ, va a decir un número que suena razonable. Y ese
número, en una página que muestra proveedores con nombre y apellido, es una
mentira sobre el negocio de otra persona.

Las funciones evitan eso. Están al final del `<script>` de `catalogo.html`:

| Función | Qué hace |
|---|---|
| `buscar_proveedores` | Devuelve proveedores reales del catálogo, filtrados por categoría, presupuesto o distrito |
| `mostrar_proveedor` | Abre en pantalla la ficha del servicio que el agente está recomendando |
| `filtrar_catalogo` | Filtra la grilla que se ve detrás del chat |

Cuando no hay resultados, `buscar_proveedores` devuelve el texto *"No hay
ningún proveedor cargado con esos filtros. Dilo tal cual, sin ofrecer
alternativas inventadas."* La instrucción va dentro del propio resultado a
propósito: es el momento exacto en que el modelo tiene la tentación de rellenar.

## Lo que falta hacer en el panel de ElevenLabs

El código ya está listo, pero el agente todavía no sabe que estas herramientas
existen. Hay que declararlas en el panel, en el agente **Eventín**, sección
**Herramientas**, creando tres de tipo **cliente** (client tool). Los nombres
tienen que coincidir exactamente con los de la tabla de arriba o el agente va a
llamar a algo que no existe.

### 1. `buscar_proveedores`

Descripción:

> Busca proveedores reales en el catálogo de TodoEventos. Úsala SIEMPRE antes
> de mencionar cualquier precio, nombre de proveedor o disponibilidad. Nunca
> inventes proveedores ni precios: si esta herramienta no devuelve resultados,
> dilo con esas palabras.

Parámetros, los tres opcionales:

| Nombre | Tipo | Descripción |
|---|---|---|
| `categoria` | string | Una de: `musica`, `catering`, `fotografia`, `locales`, `animadores`, `decoracion`, `bar`, `pasteleria`, `transporte`, `seguridad` |
| `presupuesto_max` | number | Precio máximo en soles |
| `distrito` | string | Distrito de Lima, por ejemplo Miraflores o Barranco |

### 2. `mostrar_proveedor`

Descripción:

> Abre en la pantalla del usuario la ficha del servicio que estás
> recomendando, para que lo vea sin buscarlo. Usa el id que te devolvió
> buscar_proveedores.

Un parámetro, obligatorio: `id` (number), el id del servicio.

### 3. `filtrar_catalogo`

Descripción:

> Filtra el catálogo que el usuario tiene detrás del chat, para que vea la
> categoría de la que están hablando.

Un parámetro, obligatorio: `categoria` (string), de la misma lista de diez de
arriba.

### Y en el mensaje del sistema

Conviene agregar un párrafo, porque el prompt actual no menciona nada de esto:

> Trabajas dentro del catálogo de TodoEventos.pe, un marketplace de servicios
> para eventos en Lima. Nunca menciones un precio, un proveedor o una
> disponibilidad sin haber llamado antes a `buscar_proveedores`: los datos que
> devuelve son los únicos reales. Si no hay proveedores para lo que el usuario
> pide, dilo con franqueza en vez de sugerir opciones genéricas. Cuando
> recomiendes algo concreto, llama a `mostrar_proveedor` para que aparezca en
> pantalla. Todos los precios están en soles.

## Dos requisitos para que el widget funcione

**El agente tiene que ser público, con la autenticación desactivada.** El
widget embebido no admite agentes autenticados; para eso hay que usar el SDK y
un backend que firme las URLs. Está en el panel, en Configuración.

**Los textos y colores se configuran en el panel, no en el HTML.** En el repo
el widget es una sola línea con el `agent-id` y nada más. Se probó pasar
`action-text` y compañía como atributos y el panel gana igual, así que tener
las dos configuraciones sería mantener una que no se aplica. Hoy el botón dice
"Need help?" y "Message" en inglés: se cambia en el panel, pestaña Widget.

## Detalles sueltos

El agente se llama **Eventín** pero su primer mensaje dice "Soy Sofía". Uno de
los dos hay que cambiarlo.

La clave de API que se generó para esto **no hace falta y conviene revocarla**.
El widget embebido funciona solo con el `agent-id`, que es público por diseño.
La clave daría acceso a la cuenta entera desde el navegador de cualquiera, así
que no debe terminar nunca en el HTML.

## Cómo probar que quedó bien

Abre `catalogo.html`, escríbele al chat "¿cuánto cuesta un DJ?" y fíjate en dos
cosas: que el precio que responde sea el que está en el catálogo, y que la
ficha del proveedor se abra sola en pantalla. Si contesta un precio que no
existe en la base, es que las herramientas no quedaron declaradas en el panel.

Para revisar el lado del navegador sin gastar créditos del agente, en la
consola:

```js
const e = new CustomEvent('elevenlabs-convai:call', { detail: { config: {} } });
document.querySelector('elevenlabs-convai').dispatchEvent(e);
e.detail.config.clientTools.buscar_proveedores({ categoria: 'musica' });
```

Tiene que devolver los proveedores de música que hay cargados.
