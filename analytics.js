/* Métricas del sitio — se incluye en las 9 páginas con
 * <script src="analytics.js"></script>.
 *
 * Dos piezas:
 *
 * 1) Vercel Web Analytics: visitas y páginas más vistas (automático, no
 *    requiere nada más). Solo recolecta en el dominio desplegado en Vercel
 *    y con "Web Analytics" activado en el panel del proyecto.
 *
 * 2) PostHog: comportamiento real — qué botón se toca, a qué perfil de
 *    proveedor apunta cada clic, y en qué paso se cae la gente en los
 *    embudos de registro / reserva / cotización. Trae:
 *      - Autocapture: registra TODOS los clics automáticamente (con el
 *        texto del botón, el enlace y la página), sin tener que
 *        instrumentar cada botón a mano.
 *      - Eventos con nombre + datos de negocio en los puntos clave
 *        (ver window.teTrack, usado en catalogo.html, login.html y
 *        dashboard.html).
 *      - Identidad: cuando ya sabemos quién es (login/registro), se liga
 *        la navegación anónima a la cuenta real (ver window.teIdentify),
 *        para poder seguir a una misma persona en todo su recorrido.
 *
 * CONFIGURACIÓN PENDIENTE (paso del humano, no de código):
 *   1. Crear cuenta gratis en https://posthog.com (o app.posthog.com).
 *   2. Crear un proyecto (ej. "TodoEventos").
 *   3. En Project Settings → Project API Key, copiar la key (empieza con
 *      "phc_") y pegarla abajo en PH_PROJECT_KEY.
 *   4. Copiar el host de la región elegida al crear la cuenta:
 *      - EE.UU.: https://us.i.posthog.com
 *      - Europa: https://eu.i.posthog.com
 *      y pegarlo en PH_API_HOST.
 *   Mientras no se reemplacen estos dos valores, PostHog no manda nada:
 *   la página sigue funcionando normal, solo no hay datos en el panel.
 */
(function () {
  /* ── 1) Vercel Web Analytics ── */
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var vercelScript = document.createElement('script');
  vercelScript.defer = true;
  vercelScript.src = '/_vercel/insights/script.js';
  document.head.appendChild(vercelScript);

  /* ── 2) PostHog ── */
  var PH_PROJECT_KEY = 'REEMPLAZA_CON_TU_PROJECT_API_KEY';
  var PH_API_HOST = 'https://us.i.posthog.com';

  // Snippet oficial de PostHog (instalación por <script>, sin build/npm).
  // No modificar esta parte: crea un "stub" que encola las llamadas
  // (init/capture/identify/...) hasta que la librería real termine de
  // cargar desde el CDN de PostHog.
  !function (t, e) {
    var o, n, p, r;
    e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) {
      function g(t, e) {
        var o = e.split('.');
        2 == o.length && (t = t[o[0]], e = o[1]);
        t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
      }
      (p = t.createElement('script')).type = 'text/javascript';
      p.crossOrigin = 'anonymous'; p.async = !0;
      p.src = s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
      (r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r);
      var u = e;
      for (void 0 !== a ? u = e[a] = [] : a = 'posthog',
        u.people = u.people || [],
        u.toString = function (t) { var e = 'posthog'; return 'posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e; },
        u.people.toString = function () { return u.toString(1) + '.people (stub)'; },
        o = 'capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId'.split(' '),
        n = 0; n < o.length; n++) g(u, o[n]);
      e._i.push([i, s, a]);
    }, e.__SV = 1);
  }(document, window.posthog || []);

  posthog.init(PH_PROJECT_KEY, { api_host: PH_API_HOST, defaults: '2026-05-30' });

  // Identidad: liga esta cuenta real con lo que veníamos rastreando de forma
  // anónima. Cada página que ya sepa quién es el usuario (login, registro,
  // catálogo, dashboard, nav compartido) llama a esto una vez.
  window.teIdentify = function (usuario, rol) {
    try {
      if (!usuario || !usuario.id) return;
      posthog.identify(usuario.id, { email: usuario.email, rol: rol || undefined });
    } catch (e) { /* nunca romper la página por analytics */ }
  };

  // Evento con nombre + datos de negocio (a qué proveedor/servicio apunta,
  // en qué paso del embudo está). $current_url y demás datos de contexto
  // los agrega PostHog solo, no hace falta pasarlos.
  window.teTrack = function (evento, props) {
    try { posthog.capture(evento, props || {}); } catch (e) {}
  };
})();
