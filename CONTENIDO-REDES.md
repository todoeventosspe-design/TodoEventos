# TodoEventos · Manual de contenido para redes

> **Cómo usar este archivo:** pégalo completo al inicio de una sesión nueva (o
> guárdalo en la carpeta del proyecto para que se lea solo). Contiene todas las
> reglas de marca, estilo, ritmo, sonido y lenguaje acordadas. Nada de lo que
> está acá es opcional, salvo donde dice explícitamente "varía" o "a criterio".

---

## 0. Qué es TodoEventos

Marketplace de servicios para eventos en **Lima, Perú**. Conecta a dos públicos:

- **Clientes:** gente que organiza un evento (cumpleaños, boda, promoción,
  fiesta de fin de año de empresa) y necesita proveedores.
- **Proveedores:** DJs, catering, fotógrafos, locales, animadores, inflables,
  decoración, pastelería, transporte, seguridad.

El gancho para captar proveedores es un **panel de herramientas gratis**
(agenda, cotizador con PDF, caja, clientes, inventario, reportes); el
marketplace viene de yapa. Dominio: **todoeventos.website**.

Hay **dos asistentes de IA**, y son un diferencial que vale la pena mostrar:

- **Raymi** — para clientes, vive en el catálogo. Le cuentas qué evento tienes
  y te propone proveedores **reales del catálogo**. Se le escribe o se le habla.
- **Asesor Personal** — para proveedores, vive en el panel. Explica cómo usar
  las herramientas y da consejos de venta.

---

## 1. Identidad visual

### 1.1 Logo

- **Usar siempre el logo oficial TE**: la T naranja con degradado y la E morada
  con degradado, en 3D. Existe en dos versiones:
  - `logo-te.png` — solo el monograma TE. Para marcas de agua chicas, esquinas,
    avatares, íconos dentro de notificaciones.
  - `logo-te-nombre.png` — el monograma con "Todo Eventos" debajo. Para cierres
    de video, última lámina de carrusel, firmas grandes.
- Ambos están en PNG con **fondo transparente**.
- **NUNCA usar el rayito** amarillo ni ningún logo improvisado. Ese no es el
  logo de la marca.
- Sobre fondos de color saturado (naranja o morado fuerte), el logo va dentro de
  una **caja blanca con esquinas redondeadas** (radio ~40px, padding ~30px) para
  que respire. Sobre fondos claros va directo, sin caja.
- Colocación libre a criterio: esquina inferior derecha como marca de agua, en
  el cierre centrado, o integrado como ícono de app en una notificación falsa.

### 1.2 Colores — regla del público

Esta es la regla más importante del feed. **El color dice a quién le hablamos.**

| Público | Color dominante | Paleta |
|---|---|---|
| **Clientes** | **Morado** | `#7C3AED` (el de la web), `#6D28D9`, `#5B21B6`, `#2E1065` para texto oscuro. Pasteles y claros: `#F3EEFF`, `#EDE4FF`, `#DDD6FE`, `#C4B5FD`, `#F6F2FF`, `#FAF7FF` |
| **Proveedores** | **Naranja** | `#EA580C` (el de la web), `#C2410C`, `#9A3412`, `#431407` para texto oscuro. Claros: `#FFF7ED`, `#FFEDD5`, `#FED7AA`, `#FDBA74` |
| **Ambos** | Morado + naranja | Pantalla partida, mitad y mitad, o una escena de cada color |

Reglas de aplicación:

- **El blanco es apoyo permanente** en los dos lados: tarjetas, cajas de texto,
  láminas de respiro.
- **Varía los tonos dentro de la familia.** Un reel de clientes puede ser
  lavanda pastel y otro morado fuerte; lo que no puede es irse al azul, al rosa
  o al verde.
- **Nada muy oscuro.** Evitar los morados casi negros. Si se necesita contraste,
  usar `#2E1065` o `#431407` solo como color de **texto**, no como fondo
  dominante de toda la pieza.
- El amarillo `#FCD34D` y el dorado existen pero son **acento puntual**
  (insignia de fundador, destacar una palabra), nunca el color base de la pieza.
- Verde `#15803D` solo para montos positivos y confirmaciones. Rojo `#DC2626`
  solo para alertas y red flags.
- Al mirar el feed completo debe notarse el patrón: bloques morados y bloques
  naranjas alternándose. **Que ninguna fila del feed repita el mismo color en
  las 3 celdas.**

### 1.3 Tipografías — fijas, sin excepciones

La consistencia tipográfica entre todas las piezas es crítica.

| Uso | Fuente | Notas |
|---|---|---|
| Titulares, números grandes, rótulos | **Anton** | Siempre en MAYÚSCULAS, `line-height` entre 1.02 y 1.2. Ojo: con acentos (Á, Ó, Í) hay que subir el `line-height` a 1.14–1.2 o la tilde se corta contra la línea de arriba |
| Cuerpo, listas, interfaces, botones | **Epilogue** | Pesos 600–800 para lo importante, 400–600 para párrafos |
| Notas manuscritas, comentarios al margen, remates con humor | **Caveat** | Peso 700. Es el "toque humano" de la marca |

- **Nunca** introducir una cuarta fuente ni sustituir ninguna de estas tres.
- Las tres se embeben localmente (`@font-face` a archivos `.woff2` / `.ttf`), no
  se cargan por CDN en las composiciones de video.
- Tamaños mínimos en video vertical 1080×1920: titulares 90–250px, cuerpo
  36–50px, etiquetas 26–32px. Nada por debajo de 26px.

### 1.4 El toque humano

La marca no habla como corporación. Es un colega que ya pasó por lo mismo.

- En cada pieza hay al menos **una nota manuscrita en Caveat**, ligeramente
  rotada (−2° a −5°), que hace un chiste, relativiza o acompaña: *"no te
  juzgamos, todos empezamos así 😅"*, *"lo intentamos, no nos juzgues 🤞"*,
  *"(sí, en serio)"*, *"y el cumple es en 2 semanas…"*.
- Emojis sí, pero **con moderación y con sentido**: uno o dos por bloque, nunca
  una ristra decorativa.
- Se admite la autocrítica y el humor sobre nosotros mismos.

---

## 2. Reglas de contenido y lenguaje

### 2.1 Lo que SÍ podemos prometer (porque existe)

- Las reseñas **solo las deja quien reservó** por la plataforma: no se pueden
  comprar ni inventar.
- La agenda **no deja aceptar dos eventos que se pisan** (hay un constraint real
  anti-solapamiento en la base de datos).
- El cotizador **saca un PDF** con los datos del negocio del proveedor.
- Los proveedores **fundadores salen primero** en el orden del catálogo (ya está
  implementado).
- **Todo es gratis, sin tarjeta y sin permanencia.**
- El cliente **ve el precio "desde"** antes de escribirle a nadie.
- Raymi y el Asesor Personal responden al toque, a cualquier hora.

### 2.2 Lo que NO se puede decir (todavía no existe)

- ❌ "Tu pago está protegido" / "el dinero queda retenido" / "paga seguro".
  **No hay pasarela de pagos.** Prohibido en todo el contenido.
- ❌ "Te protegemos contra plantones".
- ❌ "Hay soporte que media si algo sale mal".
- ❌ Prometer una cantidad concreta de clientes que van a llegar.
- ❌ Decir "pide tu cotización" cuando el flujo real del catálogo es **reservar**.
  El cliente ve precios "desde" y manda una **solicitud de reserva**.

### 2.3 La promesa del Programa Fundador (redacción exacta)

> Los primeros **20 proveedores** no pagan comisión durante los **seis meses
> siguientes al día en que activemos los cobros**. Mientras tanto todas las
> herramientas están abiertas y gratis, sin tarjeta y sin permanencia.

Beneficios que se pueden listar: insignia dorada en el perfil, sale primero en
el catálogo, le armamos el perfil nosotros, 0% de comisión por 6 meses desde que
se activen los cobros.

**El contador (ej. 14/20) se actualiza con la cifra real el día de publicar.**

### 2.4 Precios en el contenido

- Los precios que se muestran son **referenciales del mercado limeño** y la
  pieza **debe decirlo en pantalla**: *"precios referenciales de Lima · cada
  proveedor pone el suyo"*.
- **Nunca** comparar lado a lado a dos proveedores reales de la plataforma.
- Hablar de rangos del mercado sí; poner a dos de los nuestros a competir, no.

### 2.5 Llamado a la acción

- **Un solo CTA por pieza.** O "regístrate como proveedor" o "busca tu
  proveedor". Nunca los dos en la misma publicación.
- El CTA va siempre con el link: *"link en la bio · todoeventos.website"*.
- El CTA del cierre se pinta como botón: pastilla redondeada, fondo del color
  contrario al fondo de la escena.

### 2.6 Ritmo de publicación

- **3 publicaciones por semana** (lunes, miércoles, viernes).
- Todo video vertical se sube a Reels, Facebook y TikTok el mismo día.
- Stories una o dos veces por semana, del banco de guiones.
- Responder comentarios y mensajes en menos de 2 horas.
- Pedir permiso al proveedor antes de usar sus fotos.

---

## 3. Estilo de los videos (reels)

### 3.1 Formato técnico

- **1080×1920**, 30 fps, MP4.
- Duración: **16 a 21 segundos**. Si el contenido no entra, se recorta
  contenido, no se acelera el ritmo.
- **Sin música de fondo horneada.** El audio en tendencia se pone después desde
  la app de Instagram o TikTok. Los videos se entregan solo con efectos de
  sonido.
- Se construyen con **HyperFrames** (HTML + GSAP, timeline pausado y seekeable).

### 3.2 Ritmo de lectura — la regla más delicada

Este es el punto en el que más se corrigió. El objetivo es un **punto medio**:
ni atropellado ni lento.

- **Cada bloque de información dura entre 2,4 y 3,2 segundos.** Ese es el
  estándar. Menos que eso no se alcanza a leer; más que eso aburre.
- **Una idea por pantalla.** Si una escena tiene un titular, un subtítulo y un
  panel, eso es la escena completa: no se le meten tres cosas más.
- Las entradas de elementos duran **0,3 a 0,5 s**. Entre un elemento y el
  siguiente dentro de la misma escena, **0,7 a 0,85 s** de separación.
- Las burbujas, ítems de lista o tarjetas que se acumulan: **máximo 3 o 4 por
  escena**, nunca 6 o 7.
- El cierre (logo + CTA) ocupa **2,5 a 3,2 segundos**.
- Referencia de ritmo correcto: el reel "15 vs 15" del 25 sep, versión final de
  20,5 s.

### 3.3 Recursos de comprensión — se usan, pero NO en todos

Son herramientas para que no se malentienda el mensaje. **No convertir ninguna
en fórmula repetida**; se eligen según lo que cada video necesita.

- **Tarjeta de título a pantalla completa**, con una palabra gigante en Anton
  que entra con zoom (`scale` de 0.3 a 1, ease `back.out(2.2)`), sobre fondo
  liso del color del público. Ejemplo: `POV:` chico arriba y `CLIENTE` gigante
  abajo, luego corte a `POV:` + `PROVEEDOR`. Dura ~1,1 s cada una. Sirve para
  contextualizar de golpe antes de que aparezca todo lo demás.
- **Rótulo numerado por paso**, abajo y grande: `1 · ELIGE LA PLANTILLA`,
  `2 · ESCRIBE EL CLIENTE`. Para tutoriales y demostraciones.
- **Rótulo de sección con número** arriba a la izquierda: `1 · AGENDA`,
  `2 · COTIZADOR`. Para recorridos por varias funciones.
- **Zoom de énfasis**: cuando un número o una palabra importa, se le hace un
  pulso de escala (`scale` 1 → 1,15 → 1, en 0,15 s, yoyo). Por ejemplo cuando un
  contador llega a su tope.
- **Pantalla de respiro**: una escena corta (1,2–1,6 s) con solo una frase
  manuscrita grande, que separa dos bloques. Ej: *"tranqui, ordenemos 👇"*.
- **Titular propio para cada escena de solución**, en vez de mostrar la
  interfaz sin explicar: *"El cliente ve el precio antes de escribir"*,
  *"El DJ recibe la reserva con fecha"*.

### 3.4 Estructura típica de un reel

1. **Gancho (0–3 s)** — el problema, la pregunta o el reto. Tiene que frenar el
   pulgar. Puede ser una tarjeta de título gigante, una pregunta en Anton que
   entra en dos golpes, o una escena reconocible (el chat caótico, el cuaderno).
2. **Desarrollo (3–14 s)** — una idea por pantalla, con su titular. Acumulación
   controlada, contadores, pasos numerados, rounds.
3. **Giro o remate (opcional)** — el chiste, el "¿y la torta?", el "mismo
   problema de los dos lados".
4. **Cierre (últimos 2,5–3 s)** — titular de cierre en Anton, nota manuscrita,
   botón de CTA, link y logo oficial. Siempre en ese orden de aparición.

### 3.5 Animación

- Motor: GSAP, un solo timeline pausado registrado en `window.__timelines`.
- Eases variados, nunca el mismo en toda la pieza: `back.out(1.8)` para entradas
  con rebote, `power3.out` para deslizamientos, `expo.out` para titulares,
  `sine.inOut` para movimientos ambientales.
- **Todo elemento decorativo tiene movimiento sutil permanente** (respiración de
  escala, deriva lenta). Los decorativos estáticos se ven muertos.
- Entradas combinadas: no todo entra con `y: 30, opacity: 0`. Se mezclan
  direcciones, escalas y rotaciones.
- Nada de animaciones infinitas (`repeat: -1`): se calcula el número finito.
- Nada de relojes, `Math.random()` sin semilla ni fetch en tiempo de render.

### 3.6 Efectos de sonido — obligatorios y variados

**Todos los reels llevan efectos de sonido.** Suben muchísimo la sensación de
dinamismo. Pero la regla dura es: **ningún video puede sonar igual al anterior.**

- A cada video se le asigna una **paleta sonora propia**, coherente con su tema.
  No repetir el mismo whoosh + campanita en todas las piezas.
- Volúmenes entre **0,3 y 0,7**. Los efectos van por debajo, nunca saturan,
  porque encima se le va a poner música desde la app.
- Cada efecto va **sincronizado al fotograma** de la animación que acompaña.

**Ejemplos de paletas ya usadas (no repetirlas tal cual):**

| Video | Paleta sonora |
|---|---|
| 15 vs 15 | vibración de celular, mensajes de chat, marimba, boing, tada |
| Panel del proveedor | papel, lápiz garabateando, teclado, marimba por herramienta, caja registradora |
| Speedrun del cotizador | tic-tac continuo, pitidos, tecleo, campana de ring, bocina de fiesta |
| Presupuesto | aplauso, monedas, silbato que baja, globo que revienta |
| Versus Halloween | scratch de DJ, bombo, tarola, campana de box, aplausos |
| IA | glitch digital, tecleo, burbujas, pings de respuesta, chime |

**Biblioteca disponible** (45 efectos, mezcla de librería y sintetizados):
airhorn, balloon, beep, bell-ring, boing, bubble, buzz, chime, clap, click,
click-soft, coin, error, glitch-1/2/3, impact-bass-1/2, kaching, key-press,
kick, marimba-hi, marimba-lo, msg, notification, paper, ping, pop, register,
riser, scratch, scribble, shutter, slide-down, slide-up, snare, sparkle,
swoosh-soft, tada, tick, type-ding, typing, whoosh, whoosh-cinematic,
whoosh-short.

Si hace falta un sonido que no está, se sintetiza con numpy + ffmpeg antes de
reutilizar uno ya usado.

### 3.7 Cada pieza es distinta

No hay plantilla. **Ninguna pieza puede parecerse a otra**: ni en formato, ni en
gancho, ni en paleta sonora, ni en recurso visual. Formatos ya usados que **no
se repiten**: chat de WhatsApp, POV en pantalla partida, cuaderno con manchas,
speedrun con cronómetro, presupuesto que baja, versus con rounds, chat con IA,
credencial dorada, contador de cupos, red flags numeradas, tier list por rubro,
calendario que se tacha, cromo de álbum, audiograma, "un día con…", adivina
quién, bingo.

---

## 4. Estilo de las piezas estáticas

### 4.1 Formato

- **1080×1350** (4:5 vertical, que es el que más pantalla ocupa en el feed).
- Carruseles de 5 a 7 láminas. Posts sueltos de 1 lámina.
- PNG.

### 4.2 Anatomía de una lámina

- **Etiqueta** arriba a la izquierda: pastilla redondeada, texto corto en
  mayúsculas con `letter-spacing` amplio (`RED FLAG`, `CÓMO FUNCIONA`,
  `SI ERES…`, `PROGRAMA FUNDADOR`).
- **Titular** en Anton, 88–120px, máximo 3 líneas.
- **Cuerpo** en Epilogue 44–50px, con la frase clave en negrita y color de
  acento.
- **Nota manuscrita** en Caveat cuando aporta.
- **Numeración de lámina** abajo a la izquierda (`03 / 07`), discreta.
- **Logo** abajo a la derecha.
- La **primera lámina** es la portada: fondo fuerte, titular gigante, gancho
  claro. La **última** es el cierre con CTA y logo con nombre.

### 4.3 Reglas de composición

- Dos puntos focales mínimo por lámina; el ojo tiene que viajar.
- Anclar el contenido a los bordes (izquierda y arriba, o derecha y abajo); no
  centrar todo flotando.
- Márgenes laterales de 64px.
- Las tarjetas y paneles van con sombra generosa
  (`0 20px 50px rgba(...,.18)`), no con bordes de 1px que en pantalla chica
  desaparecen.
- Mockups de la interfaz: recrearlos, no capturar pantallas borrosas.

---

## 5. Voz y copy

- **Español peruano, trato de tú**, conversacional, sin tecnicismos.
- Frases cortas. Nada de párrafos de cinco líneas.
- Referencias locales reales: Miraflores, Surco, San Isidro, Barranco, el
  feriado de Angamos, Halloween y Día de la Canción Criolla el mismo 31 de
  octubre, la jarana criolla, los anticuchos y picarones, la hora loca, el
  candy bar, "¿y si llueve?" de los inflables.
- Los dolores concretos que sí funcionan: el "te confirmo mañana", el visto, el
  "¿precio?" por interno, el audio de 2 minutos, el cuaderno con manchas de
  café, el Excel llamado `precios_FINAL(3).xlsx`, el "somos 80… bueno, como
  110", el "pon algo que todos conozcan".
- Los titulares del plan de contenido son **referencias**, no texto final: se
  reescriben para que tengan gancho.

### 5.1 Estructura del caption

1. Gancho en la primera línea (lo único que se ve sin desplegar).
2. Desarrollo en 2–4 bloques cortos separados por línea en blanco.
3. Un solo CTA con `👉` y el link.
4. Pregunta a la comunidad cuando el formato lo pide (votación, comentarios).
5. Hashtags al final, 5 a 7, mezclando genéricos locales y de rubro:
   `#EventosLima #FiestasLima #ProveedoresDeEventos #DJLima #CumpleañosLima
   #BodasPeru #CateringLima #TodoEventos`.

---

## 6. Flujo técnico de producción

### 6.1 Reels

```bash
# proyecto nuevo
npx hyperframes init "reel-<nombre>" --non-interactive --example=blank --skill=general-video

# validar siempre antes de renderizar (tiene que decir "Check passed")
npx hyperframes check

# revisar fotogramas clave antes de gastar un render
npx hyperframes snapshot --at 1.5,6,12,18

# render final
npx hyperframes render -o renders/reel-<fecha>-<nombre>.mp4 --quiet --skill=general-video
```

- Dependencias del entorno: `ffmpeg`, Chrome headless
  (`npx hyperframes browser ensure`), fuentes locales y GSAP local.
- Los efectos de sonido se inyectan como etiquetas `<audio>` con `id`,
  `data-start`, `data-duration`, `data-track-index` y `data-volume`.
- Si `check` reporta solapamiento de texto en un número de Anton (la caja de la
  fuente es más alta que el glifo), se marca ese elemento con
  `data-layout-allow-overlap` en vez de romper el diseño.

### 6.2 Piezas estáticas

Se escriben en HTML con las tres fuentes embebidas y se capturan con Playwright
a 1080×1350, una captura por `.slide`.

### 6.3 Revisión obligatoria antes de entregar

1. `check` pasa sin errores.
2. Mirar las capturas: ningún texto cortado, tapado ni pegado al borde.
3. Las tildes de Anton no se cortan.
4. El logo correcto está presente.
5. El color corresponde al público.
6. Ningún efecto de sonido repite la paleta del video anterior.
7. No hay ninguna promesa de las prohibidas en la sección 2.2.

---

## 7. Entrega

- Reels: MP4 1080×1920 con audio, nombrados `reel-<fecha>-<tema>.mp4`.
- Carruseles: PNG numerados `c-<fecha>-01.png`, `c-<fecha>-02.png`…
- Posts: `post-<fecha>-<tema>.png`.
- Un archivo de captions con el texto de cada publicación y los guiones de
  stories.
- Una maqueta del feed para ver cómo se alternan los colores.
- **Mandar cada pieza apenas esté lista**, no todo junto al final.

---

## 8. Pendientes y cosas a confirmar

- Los 4 posts de **proveedores destacados** están en espera hasta tener las
  fotos y el permiso de cada proveedor. Formatos pensados, uno distinto cada
  vez: cromo de álbum Panini, audiograma de nota de voz, "un día con…" por
  horas, y "¿adivina quién?" con pistas.
- El número de fundadores (`14/20`) se actualiza con la cifra real el día de
  publicar.
- Si en algún momento se activan los pagos, recién ahí se puede hablar de pago
  protegido, mensajería interna y adelantos.
