/* Fluidez táctil — se incluye en todas las páginas con
   <script src="tactil.js"></script>, DESPUÉS de los scripts propios de la
   página (necesita que sus funciones ya existan).

   1) iOS Safari solo pinta el estado :active (el "se hundió el botón" de
      estilo.css) si hay algún listener de touchstart en la página.
   2) Muchos botones llaman a funciones async (guardar, aceptar, abrir
      perfil...) que esperan al servidor sin mostrar nada: en el celular eso
      se sentía como "no respondió" y el usuario volvía a tocar. Envolvemos
      una sola vez todas las funciones async globales: el botón tocado queda
      marcado .te-busy hasta que la función termina.
   3) El asistente de ElevenLabs tarda ~1 s de procesador en arrancar; si
      carga junto con la página, los primeros toques no responden. Se carga
      recién cuando la página ya está lista y quieta. */
(function () {
  document.addEventListener('touchstart', function () {}, { passive: true });

  var AsyncFunction = (async function () {}).constructor;
  var dentro = 0; // llamadas anidadas (una async que llama a otra) no se marcan

  Object.keys(window).forEach(function (nombre) {
    var fn;
    try { fn = window[nombre]; } catch (e) { return; }
    if (!(fn instanceof AsyncFunction)) return;

    window[nombre] = function () {
      var ev = window.event;
      var btn = !dentro && ev && ev.type === 'click' && ev.target && ev.target.closest &&
                ev.target.closest('button, a, [role="button"]');
      dentro++;
      var p;
      try { p = fn.apply(this, arguments); } finally { dentro--; }
      if (btn) {
        btn.classList.add('te-busy');
        var listo = function () { btn.classList.remove('te-busy'); };
        // ponytail: tope de 15 s por si la promesa nunca termina (modal abandonado)
        var tope = setTimeout(listo, 15000);
        Promise.resolve(p).then(listo, listo).then(function () { clearTimeout(tope); });
      }
      return p;
    };
  });

  // Se carga tras 3 s SIN toques ni scroll: si arrancara mientras el usuario
  // navega, sus ~1 s de procesador en celular caerían justo sobre sus toques.
  if (document.querySelector('elevenlabs-convai')) {
    var eventos = ['pointerdown', 'scroll', 'keydown'], espera;
    var cargarAsistente = function () {
      eventos.forEach(function (t) { removeEventListener(t, reprogramar, true); });
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      s.async = true;
      document.body.appendChild(s);
    };
    var reprogramar = function () { clearTimeout(espera); espera = setTimeout(cargarAsistente, 3000); };
    eventos.forEach(function (t) { addEventListener(t, reprogramar, { capture: true, passive: true }); });
    reprogramar();
  }

  // 4) Cada "pestaña" es una página aparte: sin esto, cada toque bajaba la
  //    página nueva de cero. El navegador la descarga de antemano (prefetch)
  //    y la deja armada al acercar el dedo (prerender), así abre al instante.
  //    Chrome/Edge lo usan; los que no lo entienden lo ignoran.
  if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    var publicas = "a[href^='index.html'], a[href^='catalogo.html'], a[href^='login.html'], a[href^='nosotros.html'], a[href^='proveedores.html'], a[href^='cuenta.html'], a[href^='dashboard.html']";
    var reglas = document.createElement('script');
    reglas.type = 'speculationrules';
    reglas.textContent = JSON.stringify({
      prefetch: [{ where: { selector_matches: publicas }, eagerness: 'immediate' }],
      // ponytail: prerender solo páginas sin sesión obligatoria; cuenta/dashboard redirigen si no hay sesión
      prerender: [{ where: { selector_matches: "a[href^='index.html'], a[href^='catalogo.html'], a[href^='login.html'], a[href^='nosotros.html'], a[href^='proveedores.html']" }, eagerness: 'moderate' }]
    });
    document.head.appendChild(reglas);
  }
})();
