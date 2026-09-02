/* Vercel Web Analytics + seguimiento de clics en botones y enlaces.
 *
 * Se incluye en todas las páginas con <script src="analytics.js"></script>.
 *
 * Qué hace:
 *  1) Carga el recolector de Vercel Web Analytics (visitas, países, páginas más
 *     vistas, etc.). SOLO recolecta cuando la web corre en el dominio desplegado
 *     en Vercel y con "Web Analytics" activado en el panel del proyecto; en local
 *     no hace nada.
 *  2) Manda un EVENTO por cada clic en un botón o enlace, con el nombre del botón
 *     y la página, para poder ver en el panel de Vercel qué se toca más.
 *
 * OJO con el plan gratis de Vercel: los eventos personalizados tienen un tope
 * mensual (aprox. 2.500 en Hobby). Cada clic cuenta como un evento. Si el sitio
 * recibe mucho tráfico y se llega al tope, Vercel deja de contar hasta el mes
 * siguiente (no se rompe nada). Para medir TODOS los clics sin límite, la opción
 * ideal es Microsoft Clarity (gratis e ilimitado, con mapa de calor).
 */
(function () {
  // 1) Cola de la que se cuelga el SDK de Vercel Analytics cuando termina de cargar.
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

  // 2) Cargar el recolector oficial de Vercel (ruta interna del despliegue).
  var s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.appendChild(s);

  // 3) Un evento por cada clic en botón / enlace / control.
  function etiquetaDe(el) {
    var t = (el.getAttribute('aria-label') ||
             el.getAttribute('title') ||
             el.textContent ||
             el.getAttribute('name') ||
             el.id || '').replace(/\s+/g, ' ').trim();
    return t ? t.slice(0, 60) : 'sin-nombre';
  }

  function paginaActual() {
    var p = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
    return p || 'index';
  }

  // Fase de captura para atrapar el clic aunque otro handler use stopPropagation.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest &&
             e.target.closest('button, a, [role="button"], input[type="submit"], input[type="button"], .btn, [onclick]');
    if (!el) return;
    try {
      window.va('event', {
        name: 'clic_boton',
        data: { boton: etiquetaDe(el), pagina: paginaActual() }
      });
    } catch (err) { /* nunca romper la página por analytics */ }
  }, true);
})();
