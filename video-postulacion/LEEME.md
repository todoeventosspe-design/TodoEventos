# Video de postulación (problema y solución)

Video de 1:58 para el formulario de la competencia de startups de la
Universidad de Lima ("Graba un video mostrándonos el problema y solución de tu
proyecto, máximo 2 minutos"). 1920×1080, 30 fps, con banda sonora original.

**Esto NO es parte del sitio.** Vive acá solo para poder volver a generarlo o
retocarlo sin empezar de cero. No lo carga ninguna página.

## Qué cuenta

| Tiempo | Bloque |
|---|---|
| 0:00–0:06 | Apertura: "Organizar un evento en Lima hoy se hace así" |
| 0:06–0:40 | **El caos del cliente.** Valeria busca DJ, catering y fotógrafo por DM. Tres conversaciones ficticias con zoom sobre el "Visto hace 2 días", el "te paso la info" que nunca llega y el precio que cambia. Cierra con el marcador: 9 proveedores escritos, 3 respuestas, 0 precios en firme. |
| 0:40–1:07 | **El caos del proveedor.** La bandeja de Marco con 14 mensajes sin responder, y su agenda real: una libreta con dos eventos el mismo sábado. |
| 1:07–1:14 | La brecha: "Ella busca. Él existe. No se cruzan." |
| 1:14–1:50 | **La solución**, con capturas reales del producto. Lado del cliente: catálogo con precios, y Raymi armando el evento completo. Lado del proveedor: las solicitudes de reserva que le entran (la demanda), agenda sin cruces, cotizador con total y PDF, reportes. |
| 1:50–1:58 | Cierre de marca. |

Los mensajes, los nombres y los montos son **inventados**: representan el
problema, no son capturas de conversaciones reales de nadie.

> **Ojo con la escena de Raymi.** El panel del asistente está reconstruido en
> `escena.html`, porque el widget real es de ElevenLabs y no se puede renderizar
> en el contenedor de render. Muestra lo que hacen las tres client tools que ya
> están escritas en `catalogo.html` (`buscar_proveedores`, `mostrar_proveedor`,
> `filtrar_catalogo`). Esas tres **todavía no están declaradas en el panel de
> ElevenLabs** (ver "Pendientes" en `CLAUDE.md`): hasta que se declaren, el
> agente en vivo no va a armar la propuesta como se ve en el video. Si alguien
> del jurado va a probarlo en vivo, hay que cerrar esa configuración antes.

## La banda sonora

`musica.py` la sintetiza entera: no hay ni una pista de librería, así que no
hay nada que licenciar. Sigue el arco del video y cambia de tonalidad justo
donde el video cambia de tema:

- **La menor, 80 bpm (0 → 1:14)** — el problema. Colchón grave, un reloj en
  corcheas y un arpegio inquieto. El bloque del proveedor suma un tom para que
  pese más.
- **Do mayor, 96 bpm (1:14 → final)** — la solución. Es el relativo mayor de La
  menor: las mismas notas, otro centro. Suena a que algo se destraba, justo
  cuando aparece el panel.

Cada cosa que pasa en pantalla tiene su sonido, clavado al guion: las burbujas
del chat, el "visto" sin respuesta (un golpe sordo, sin brillo), los empujes de
cámara, los ocho mensajes sin responder cayendo uno tras otro, el lapicero
sobre la libreta, el sello CRUCE y los mensajes de Raymi.

La mezcla se revisó por bandas de frecuencia, no de oído: el objetivo era que
la diferencia entre graves y agudos quedara en 13–17 dB para que se entienda en
el parlante de una laptop, que es donde lo va a ver el jurado. El nivel final lo
fija `loudnorm` de ffmpeg a −16 LUFS, que es el estándar de video web.

## Cómo está hecho

Es el mismo enfoque de los videos anteriores: una escena HTML animada que se
fotografía cuadro por cuadro y se une en un MP4.

- `escena.html` — la escena entera. Todo el movimiento lo controla `seek(t)`,
  que dibuja el estado exacto del segundo `t`. No hay animaciones CSS: por eso
  cada pasada del render sale idéntica a la anterior. Los textos y los tiempos
  de cada bloque están arriba del `<script>`, en las constantes `B`, `CHATS`,
  `BANDEJA`, `LIBRETA`, `TARJETAS`, `MINIS` y `TOMAS`.
- `stub.js` + `capturar.mjs` — generan `capturas/`. Levantan el sitio real con
  un cliente de Supabase **falso** (datos de demostración) para poder
  fotografiar el catálogo y el dashboard llenos, sin tocar la base de
  producción y sin necesitar una cuenta.
- `render.mjs` — llama a `seek(t)` 30 veces por segundo y guarda un JPG por
  fotograma.
- `vistazo.mjs` — fotografía solo los segundos que le pidas, para revisar la
  composición sin renderizar el video entero.
- `fonts/` + `fuentes.css` — Anton, Epilogue (las del sitio) y Caveat (la
  letra manuscrita de la libreta), locales porque el contenedor de render no
  llega a Google Fonts.

## Volver a generarlo

Hace falta Playwright y un ffmpeg con libx264 (el que trae Playwright solo
tiene VP8; `npm i ffmpeg-static` trae uno completo).

```bash
# 1. capturas del producto (sirve el repo en el puerto 8099)
npx http-server -p 8099 -s .
node capturar.mjs

# 2. fotogramas (sirve esta carpeta en el puerto 8100)
npx http-server -p 8100 -s video-postulacion
node render.mjs                 # ~4 min, 3540 JPG
node vistazo.mjs 16 27 60 88    # o solo estos segundos, para revisar

# 3. la banda sonora (necesita numpy y scipy)
python3 musica.py               # ~2 min → banda.wav

# 4. armar el MP4
ffmpeg -framerate 30 -i fotogramas/f%05d.jpg -i banda.wav \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k \
  -shortest -movflags +faststart salida.mp4
```

`fotogramas/` y el `.mp4` no se versionan: se regeneran.

## Si hay que retocar

- **Cambiar un texto de los chats:** `CHATS` en `escena.html`.
- **Cambiar un zoom:** los arreglos `ZOOMS` dentro de `cliente()` y
  `proveedor()`. El punto al que apuntan se **mide del DOM** (`medirFocos()`),
  no se escribe a mano, así que basta con nombrar el elemento.
- **Cambiar el encuadre de una captura:** `TOMAS`, campos `de` y `a2`. Van en
  píxeles de la página capturada (`{x, y, w}`); el alto sale solo de la
  proporción del visor, por eso nunca quedan bordes en blanco.
- **Cambiar la duración de un bloque:** la constante `B` y `DURACION`. Ojo con
  el límite de 2 minutos del formulario: hoy quedan 2 segundos de margen.
- **Cambiar el texto de Raymi:** los arreglos `RAYMI` y `PROPUESTA`. Las
  cuentas tienen que cerrar (los tres precios suman el total que se muestra).
- **Si se mueve un tiempo, hay que mover el sonido.** Los efectos de
  `musica.py` están clavados a los segundos del guion: la función `efectos()`
  repite las mismas marcas de tiempo que `escena.html`. Si cambias una, cambia
  la otra o el efecto queda desfasado.
