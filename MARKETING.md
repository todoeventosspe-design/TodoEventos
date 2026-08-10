# Cómo vamos a conseguir los primeros proveedores

Plan de captación para el arranque. Está ordenado por dependencias y no por
semanas, porque varias cosas del plan original dependen de que antes exista
algo en el producto, y si se hacen en desorden se prometen cosas que no se
pueden cumplir.

## La idea de fondo

Un marketplace vacío no le sirve a nadie. El cliente entra, ve un proveedor y
se va. Entonces no empezamos por ahí.

Lo que ya está construido y sí sirve solo es el panel del proveedor: agenda,
cotizador con PDF, caja, clientes, inventario y reportes. Eso es útil para un
DJ aunque por la plataforma no le llegue ni un cliente. Ese es el gancho.

Primero regalamos la herramienta. El marketplace viene de yapa. Cuando haya
suficiente gente en una categoría recién salimos a buscar clientes.

El nicho para empezar es DJs y música en Lima. Es el rubro que ya conocemos
desde adentro, hay red propia y el primer caso somos nosotros mismos. Un solo
rubro hasta llegar a unos 20. Después catering y fotografía.

## Lo que hay que arreglar antes de salir a hablar con nadie

Son días de trabajo, no semanas, pero salir antes de tenerlos listos significa
prometer cosas que el proveedor no va a encontrar cuando entre.

**El correo de los proveedores es público.** Cualquiera puede pedirle a la API
la lista de correos de todos los proveedores sin siquiera registrarse. Esto
choca de frente con la idea de que el contacto se abre recién después de
reservar, y además le regala a un competidor la lista completa de gente a
quien contactar. El arreglo es una vista pública que exponga solo lo que el
catálogo necesita. Está explicado en [SEGURIDAD.md](SEGURIDAD.md).

**El badge de fundador ya está en el producto.** La columna y el candado que
impide que el proveedor se lo ponga solo están en [fundador.sql](fundador.sql),
la tarjeta del catálogo pinta el anillo dorado y la etiqueta, y el panel de
admin tiene el botón para marcar y desmarcar en la pestaña de aprobados, con
el contador de cuántos van de los 20. Falta una sola cosa antes de poder
prometerlo: correr ese SQL en Supabase.

El contador avisa al llegar a 20 pero no bloquea, porque pasarse es una
decisión comercial y no un error del sistema. Si el número cambia, se cambia
en `LIMITE_FUNDADORES` en `admin.html` y en este documento.

**La prioridad en el orden del catálogo no existe.** El catálogo hoy
ordena por calificación, precio o reseñas. Poner a los fundadores arriba es
cambiar el `order` de la consulta.

Si algo de esto no se va a construir, hay que sacarlo del discurso. Un
proveedor al que le prometimos un badge y entra a buscarlo pierde la confianza
por una tontería.

## La promesa fundador, redactada de nuevo

El plan original decía "0% de comisión por 6 meses". El problema es que hoy no
hay pasarela de pagos ni RUC, así que no hay comisión que cobrar ni que
perdonar. Ofrecer cero por ciento de algo que no cobramos no es una oferta, y
un DJ que ya factura lo nota de inmediato.

Además el reloj corría desde el registro. Si los pagos llegan en el mes ocho,
el beneficio se venció antes de existir.

La versión que sí se sostiene:

> Los primeros 20 proveedores no pagan comisión durante los seis meses
> siguientes al día en que activemos los cobros. Mientras tanto todas las
> herramientas están abiertas y gratis, sin tarjeta y sin permanencia.

Está anclada a un evento y no a una fecha, así que aguanta que el desarrollo
se demore. Y lo que se promete hoy (herramientas gratis) es verdad hoy.

## Lo que podemos decir y lo que no

Sirve tenerlo escrito porque en una conversación de WhatsApp es fácil
entusiasmarse y prometer de más.

Se puede decir, porque existe: las reseñas solo las deja quien reservó por la
plataforma, así que no se pueden inventar. La agenda no te deja aceptar dos
eventos que se pisan. El cotizador saca el PDF con los datos de tu negocio.
Todo es gratis y no pedimos tarjeta.

No se puede decir todavía: que protegemos contra plantones, que el dinero está
garantizado antes del evento, que hay soporte que media si algo sale mal, ni
que va a llegar una cantidad concreta de clientes. Nada de eso está construido.

## Los primeros 20

### Empezar por la red propia

Meta de la primera semana: cinco conocidos adentro. DJs, fotógrafos y
animadores con los que ya se ha trabajado.

El onboarding lo hacemos nosotros. Se les pide por WhatsApp seis fotos y sus
precios, nosotros armamos el perfil completo y ellos solo entran a aprobarlo.
Fricción casi cero.

**Pero el onboarding no termina cuando el perfil está publicado.** Termina
cuando el proveedor tiene sus próximos tres eventos reales cargados en la
agenda, y eso lo hacemos nosotros en la misma llamada, con él al teléfono
dictando fechas.

Esta es la parte que decide si el plan funciona. Un DJ que solo subió fotos no
tiene motivo para volver la semana que viene. Uno que tiene su sábado cargado
ahí entra a mirar. En modo single-player la retención es el producto, y un
perfil publicado sin agenda es un directorio muerto que encima se ve vacío.

### Después, prospección directa

Grupos de Facebook del rubro, hashtags de Instagram, Marketplace. Mensaje
corto y personalizado, mencionando algo real de su perfil.

Sobre las expectativas: en el plan original figuraba 5% de conversión. Para
mensaje frío de una marca que nadie conoce, lo realista está entre 1% y 2%.
Con diez contactos al día durante un mes salen unos seis proveedores, no
quince. Llegamos a 20 sobre todo por la red propia, y el canal frío es
complemento. Conviene saberlo para no frustrarse en la semana dos.

### Ferias

Ferias de bodas y de eventos distritales, con el QR de registro impreso. Es
el canal donde el proveedor ya está en modo negocio.

## Contenido

Una publicación por semana, sostenida. El plan original decía tres, y tres por
semana mientras además se programa el producto es la receta conocida para
abandonar en la semana tres. Una sostenida durante seis meses vale más que
tres durante tres semanas.

Dos series que funcionan:

Cuánto cobra un DJ, un fotógrafo o un catering en Lima. Los proveedores
consumen contenido de precios de su propio rubro sin parar, y los clientes
también. Cuidado con publicar los precios de proveedores que ya están en la
plataforma comparándolos entre sí: hablar de rangos del mercado sí, poner a
dos de los nuestros lado a lado no.

Detrás de cámaras de eventos reales. Da credibilidad de colega a colega y no
de plataforma anónima, que es exactamente lo que hace falta para que otro DJ
se anime.

Cada quince días, la historia de un proveedor fundador. Tres preguntas, una
foto y el link a su perfil. Él lo comparte con su audiencia y eso nos da
alcance que no pagamos.

Cuando haya dominio propio: páginas por categoría y distrito, del tipo "DJ
para fiestas en Miraflores". El catálogo ya filtra así, solo falta que se
pueda indexar.

## Referidos

Desde los 15 proveedores. Un proveedor trae a otro y suma un mes más sin
comisión por cada uno que quede activado. En este rubro se conocen todos
porque trabajan juntos en los mismos eventos.

Del lado del cliente, el correo de "deja tu reseña" al terminar el evento
cierra preguntando si conoce algún buen proveedor para recomendar.

## Recién ahí, clientes

Cuando una categoría tenga 15 proveedores activos de verdad. Antes de eso, un
cliente que entra al catálogo ve el vacío y no vuelve, y esa primera impresión
se quema una sola vez. Mientras tanto la web le habla al proveedor.

Después: anuncios en Meta segmentados a Lima, entre S/.10 y S/.15 por día,
apuntando a la categoría que esté densa.

## Que no se vayan por fuera

Vale la pena ser honestos con esto. Mientras el pago se coordine por WhatsApp
entre cliente y proveedor, el flujo del producto obliga a que intercambien
contacto. No se puede construir fricción contra algo que el propio producto
exige. Cualquier medida de bloqueo hoy sería puro teatro.

Lo que sí se puede hacer ahora es que quedarse adentro convenga:

Las reseñas verificadas ya funcionan y solo salen de reservas hechas acá. El
proveedor que cobra por fuera se queda sin reseña, y sin reseñas no sube en el
catálogo. Ese es el argumento real y es cierto.

La agenda le sirve aunque el cliente no venga de la plataforma. Cuanto más la
use, más caro le sale irse.

No mostrar el contacto en el perfil público, que hoy está roto por lo del
correo y hay que arreglar.

Más adelante, cuando existan los pagos, entra el resto: mensajería interna,
adelanto cobrado por la plataforma y las condiciones de servicio. Sancionar a
alguien por irse por fuera cuando todavía no le damos ninguna razón para
quedarse sería injusto y además nos haría perder al proveedor.

Lo que importa de verdad en el período fundador no es la plata que se escapa,
porque no hay comisión que perder. Es que el proveedor se acostumbre a
trabajar adentro. Cuando llegue la comisión, lo que le va a costar irse es la
reputación que acumuló, no la tarifa.

## Qué medir

Cada semana, cuatro números:

Cuántos proveedores se registraron y cuántos quedaron activados. Activado
quiere decir servicio publicado, tres fotos o más, y por lo menos un bloque en
la agenda. Registrados sin activar no cuentan para nada.

Cuántos proveedores entraron al panel esta semana. Es el número más
importante de todos y no estaba en el plan original. Predice mejor que
cualquier otro si esto va a funcionar, porque mide si la herramienta les
sirve. Si baja, no importa cuántos registres.

Reservas creadas y cuántas se completaron.

De dónde salió cada proveedor. Se pregunta al momento de darlo de alta: red
propia, Facebook, Instagram o referido. Sin esto no sabemos qué canal repetir.

Y llevar la cuenta de las horas invertidas por proveedor activado. Es el costo
real de adquisición en esta etapa, donde se paga con tiempo y no con plata.

## Plata

De la fase de los primeros 20 hasta los referidos: S/. 0. Solo tiempo.

Cuando se abra la demanda: entre S/. 300 y S/. 450 al mes en anuncios.

## Antes de arrancar

Instagram y TikTok de la marca. WhatsApp Business con el catálogo cargado.
Cuando haya dominio, Analytics y Search Console configurados desde el primer
día, porque los datos que no se miden desde el comienzo no se recuperan
después.
