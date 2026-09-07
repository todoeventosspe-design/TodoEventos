// ============================================================
// TodoEventos.pe - chrome compartido (topbar + nav + footer) y sesion.
//
// Antes este codigo vivia copiado y pegado en index, nosotros y
// proveedores; cualquier cambio habia que hacerlo tres veces. Ahora las
// paginas ponen <div id="chrome-nav"></div> arriba y
// <div id="chrome-footer"></div> abajo, cargan este archivo al final del
// body, y el resto pasa solo.
//
// catalogo.html NO usa este chrome (su nav tiene buscador propio y barra
// de categorias), pero si comparte el cliente de Supabase y la sesion.
// ============================================================

const SUPABASE_URL = 'https://vqnyaozauljtashpjfoo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbnlhb3phdWxqdGFzaHBqZm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDM0NzIsImV4cCI6MjA5OTI3OTQ3Mn0.0JT-UAQnSUygXPNjI69Sf3Rg3mv_NeTwwz9-7vnWcno';

// Lee la sesion de donde haya quedado guardada (localStorage si se marco
// "Recordarme" al iniciar sesion, o sessionStorage si no).
let sb = null;
try {
  const storageAdapter = {
    getItem: (key) => localStorage.getItem(key) ?? sessionStorage.getItem(key),
    setItem: (key, value) => {
      const recordar = localStorage.getItem('te_remember') !== 'false';
      if (recordar) {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key);
      }
    },
    removeItem: (key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  };
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { storage: storageAdapter }
  });
} catch (e) {
  console.error('No se pudo inicializar Supabase:', e);
}

// ── CHROME ──────────────────────────────────────────────────────────────

const CHROME_NAV = `
<header id="nav"><div class="nav-in">
  <a href="index.html" class="logo"><span class="a">Todo</span><span class="b">Eventos</span></a>
  <nav class="nav-links">
    <a href="index.html" class="nlink">Inicio</a>
    <a href="catalogo.html" class="nlink">Marketplace</a>
    <a href="nosotros.html" class="nlink">Nosotros</a>
  </nav>
  <form class="navsearch" onsubmit="goSearch(); return false;">
    <button type="submit" aria-label="Buscar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>
    <input type="search" id="nav-q" placeholder="Busca DJ, catering, fotógrafo, local…" aria-label="Buscar proveedores">
  </form>
  <div class="nav-end">
    <a href="login.html?modo=registro&rol=proveedor" class="nprov">Para proveedores</a>
    <a href="login.html?v=2" class="btn-ingresar" id="btn-ingresar">Ingresar</a>
    <div class="user-menu" id="user-menu">
      <button class="user-avatar" id="user-avatar-btn" onclick="toggleUserDropdown()"></button>
      <div class="user-dropdown" id="user-dropdown">
        <div class="user-dropdown-name" id="user-dropdown-name"></div>
        <a href="#" id="link-mi-espacio"><span id="link-mi-espacio-texto">Ir al marketplace</span></a>
        <a href="cuenta.html">Mi cuenta</a>
        <a href="admin.html" id="link-admin" style="display:none;">Panel de admin</a>
        <button class="salir" onclick="cerrarSesion()">Cerrar sesión</button>
      </div>
    </div>
  </div>
</div></header>`;

const CHROME_FOOTER = `
<footer>
  <div class="wrap">
    <div class="f-top">
      <div>
        <span class="logo"><span class="a" style="color:#A78BFA">Todo</span><span class="b">Eventos</span></span>
        <p class="f-desc">El marketplace de servicios para eventos en Lima, Perú.</p>
      </div>
      <div class="f-col"><h5>Marketplace</h5>
        <a href="catalogo.html">Todo el catálogo</a>
        <a href="catalogo.html?cat=musica">Música &amp; DJs</a>
        <a href="catalogo.html?cat=catering">Catering</a>
        <a href="catalogo.html?cat=fotografia">Fotografía</a>
      </div>
      <div class="f-col"><h5>TodoEventos</h5>
        <a href="nosotros.html">Nosotros</a>
        <a href="proveedores.html">Para proveedores</a>
        <a href="nosotros.html#contacto">Contacto</a>
      </div>
      <div class="f-col"><h5>Legal</h5>
        <a href="#">Términos y condiciones</a>
        <a href="#">Política de privacidad</a>
        <a href="#">Centro de ayuda</a>
      </div>
    </div>
    <div class="f-bot">
      <span>© 2026 TodoEventos.pe · Lima, Perú</span>
      <div class="f-links"><a href="#">Términos</a><a href="#">Privacidad</a><a href="#">Contacto</a></div>
    </div>
  </div>
</footer>`;

(function montarChrome() {
  const top = document.getElementById('chrome-nav');
  const foot = document.getElementById('chrome-footer');
  if (top) top.outerHTML = CHROME_NAV;
  if (foot) foot.outerHTML = CHROME_FOOTER;
})();

// La barra de categorias (si la pagina tiene una) se pega justo debajo del
// nav; el alto se mide en vez de mantenerlo a mano.
function medirNav() {
  const nav = document.getElementById('nav');
  if (nav) document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
}
medirNav();
addEventListener('resize', medirNav);

// ── BUSCADOR ────────────────────────────────────────────────────────────

function goSearch() {
  const q = (document.getElementById('nav-q')?.value || '').trim();
  window.location.href = q ? 'catalogo.html?q=' + encodeURIComponent(q) : 'catalogo.html';
}

// ── SESION ──────────────────────────────────────────────────────────────

function toggleUserDropdown() {
  document.getElementById('user-dropdown').classList.toggle('open');
}
document.addEventListener('click', function (e) {
  const menu = document.getElementById('user-menu');
  if (menu && !menu.contains(e.target)) {
    document.getElementById('user-dropdown')?.classList.remove('open');
  }
});

async function cerrarSesion() {
  if (sb) await sb.auth.signOut();
  window.location.href = 'index.html';
}

async function verificarSesionNav() {
  if (!sb) return;
  const { data } = await sb.auth.getSession();
  if (!data.session) return; // sin sesion: queda el boton "Ingresar"

  const usuario = data.session.user;
  const { data: perfil } = await sb
    .from('profiles')
    .select('full_name, role, is_admin')
    .eq('id', usuario.id)
    .single();

  const nombre = (perfil && perfil.full_name) ? perfil.full_name : usuario.email;
  const rol = perfil ? perfil.role : 'cliente';

  if (typeof window.teIdentify === 'function') window.teIdentify(usuario, rol);

  if (perfil && perfil.is_admin) {
    const linkAdmin = document.getElementById('link-admin');
    if (linkAdmin) linkAdmin.style.display = 'flex';
  }

  document.getElementById('btn-ingresar').style.display = 'none';
  document.getElementById('user-menu').classList.add('show');
  document.getElementById('user-avatar-btn').textContent = nombre.trim().charAt(0).toUpperCase();
  document.getElementById('user-dropdown-name').textContent = nombre;

  const destino = rol === 'proveedor' ? 'dashboard.html' : 'catalogo.html';
  document.getElementById('link-mi-espacio').href = destino;
  document.getElementById('link-mi-espacio-texto').textContent =
    rol === 'proveedor' ? 'Mi dashboard' : 'Ir al marketplace';
}
verificarSesionNav();
