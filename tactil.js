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

  if (document.querySelector('elevenlabs-convai')) {
    var cargarAsistente = function () {
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      s.async = true;
      document.body.appendChild(s);
    };
    var cuandoQuieta = function () {
      if (window.requestIdleCallback) requestIdleCallback(cargarAsistente, { timeout: 4000 });
      else setTimeout(cargarAsistente, 1500);
    };
    if (document.readyState === 'complete') cuandoQuieta();
    else addEventListener('load', cuandoQuieta);
  }
})();
