/* Widget de feedback — se incluye en todas las páginas con
   <script src="feedback.js"></script>. Es autónomo: no depende de que la
   página haya inicializado Supabase. Inserta el comentario directo en la tabla
   "feedback" vía la API REST (la key anon es pública por diseño). El admin lo
   lee desde su panel. */
(function(){
  if(window.__feedbackWidget) return;
  window.__feedbackWidget = true;

  var SUPABASE_URL = 'https://vqnyaozauljtashpjfoo.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbnlhb3phdWxqdGFzaHBqZm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDM0NzIsImV4cCI6MjA5OTI3OTQ3Mn0.0JT-UAQnSUygXPNjI69Sf3Rg3mv_NeTwwz9-7vnWcno';

  var css = ''
    + '#fbk-tab{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:99990;'
    + 'background:linear-gradient(135deg,#7c3aed,#f97316);color:#fff;border:none;cursor:pointer;'
    + 'font-family:inherit;font-size:12px;font-weight:700;padding:14px 9px;border-radius:10px 0 0 10px;'
    + 'writing-mode:vertical-rl;text-orientation:mixed;letter-spacing:.06em;box-shadow:-2px 4px 16px rgba(0,0,0,.32);transition:padding .15s;}'
    + '#fbk-tab:hover{padding-right:13px;}'
    + '#fbk-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99991;display:none;align-items:center;justify-content:center;padding:20px;}'
    + '#fbk-ov.open{display:flex;}'
    + '#fbk-box{background:#161022;color:#f1ecf9;border:1px solid rgba(255,255,255,.12);border-radius:16px;max-width:420px;width:100%;padding:22px;font-family:inherit;box-shadow:0 20px 60px rgba(0,0,0,.5);}'
    + '#fbk-box h3{font-size:17px;font-weight:700;margin:0 0 4px;}'
    + '#fbk-box p{font-size:13px;color:#b4aac9;margin:0 0 16px;line-height:1.5;}'
    + '#fbk-box textarea,#fbk-box input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);border-radius:9px;color:#f1ecf9;padding:10px 12px;font-family:inherit;font-size:14px;margin-bottom:10px;}'
    + '#fbk-box textarea{min-height:92px;resize:vertical;}'
    + '#fbk-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:2px;}'
    + '#fbk-actions button{border:none;border-radius:9px;padding:10px 16px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;}'
    + '#fbk-cancel{background:transparent;color:#b4aac9;}'
    + '#fbk-send{background:linear-gradient(135deg,#7c3aed,#f97316);color:#fff;}'
    + '#fbk-send:disabled{opacity:.6;}'
    + '#fbk-ok{color:#34d399;font-size:14px;text-align:center;padding:14px 0;display:none;}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var tab = document.createElement('button');
  tab.id = 'fbk-tab';
  tab.type = 'button';
  tab.textContent = 'Feedback';
  document.body.appendChild(tab);

  var ov = document.createElement('div');
  ov.id = 'fbk-ov';
  ov.innerHTML = ''
    + '<div id="fbk-box">'
    + '<div id="fbk-form">'
    + '<h3>Tu opinión nos ayuda</h3>'
    + '<p>¿Algo para mejorar, un error, una idea? Cuéntanos.</p>'
    + '<textarea id="fbk-msg" placeholder="Escribe tu comentario…"></textarea>'
    + '<input id="fbk-email" type="email" placeholder="Tu correo (opcional, por si queremos responderte)">'
    + '<div id="fbk-actions"><button type="button" id="fbk-cancel">Cancelar</button>'
    + '<button type="button" id="fbk-send">Enviar</button></div>'
    + '</div>'
    + '<div id="fbk-ok">¡Gracias! Recibimos tu comentario. 🙌</div>'
    + '</div>';
  document.body.appendChild(ov);

  function open(){ ov.classList.add('open'); document.getElementById('fbk-msg').focus(); }
  function close(){ ov.classList.remove('open'); }

  tab.addEventListener('click', open);
  ov.addEventListener('click', function(e){ if(e.target === ov) close(); });
  document.getElementById('fbk-cancel').addEventListener('click', close);

  document.getElementById('fbk-send').addEventListener('click', async function(){
    var msg = document.getElementById('fbk-msg').value.trim();
    if(!msg){ document.getElementById('fbk-msg').focus(); return; }
    var email = document.getElementById('fbk-email').value.trim() || null;
    var btn = this;
    btn.disabled = true; btn.textContent = 'Enviando…';
    try{
      await fetch(SUPABASE_URL + '/rest/v1/feedback', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          mensaje: msg,
          pagina: (location.pathname.split('/').pop() || 'inicio'),
          email: email
        })
      });
    }catch(e){ /* aunque falle la red, no frustramos al usuario */ }
    document.getElementById('fbk-form').style.display = 'none';
    document.getElementById('fbk-ok').style.display = 'block';
    setTimeout(function(){
      close();
      document.getElementById('fbk-form').style.display = 'block';
      document.getElementById('fbk-ok').style.display = 'none';
      document.getElementById('fbk-msg').value = '';
      document.getElementById('fbk-email').value = '';
      btn.disabled = false; btn.textContent = 'Enviar';
    }, 1600);
  });
})();
