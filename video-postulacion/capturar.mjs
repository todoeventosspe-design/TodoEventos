// Fotografía el producto REAL (catálogo + dashboard) con datos de demostración,
// para usar esas capturas como material de la parte "solución" del video.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import fs from 'node:fs';
const { chromium } = pw;

const BASE = 'http://127.0.0.1:8099/';
const OUT = 'capturas/';
fs.mkdirSync(OUT, { recursive: true });
const stub = fs.readFileSync('stub.js', 'utf8');

const navegador = await chromium.launch();
const ctx = await navegador.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
  locale: 'es-PE'
});
await ctx.addInitScript(stub);

// Los CDN externos no son alcanzables desde este contenedor (política de
// egreso + TLS del proxy), así que se sirven desde copias locales: es la
// misma versión que usa el sitio, solo que servida del disco.
const VENDOR = 'vendor/package/dist/';
await ctx.route('**/*', async r => {
  const u = r.request().url();
  if (u.includes('elevenlabs') || u.includes('/_vercel/')) return r.abort();
  if (u.includes('tabler-icons.min.css')) {
    let css = fs.readFileSync(VENDOR + 'tabler-icons.min.css', 'utf8');
    return r.fulfill({ contentType: 'text/css', body: css });
  }
  if (u.includes('tabler-icons.woff2') || u.includes('/fonts/tabler-icons')) {
    const f = u.split('/').pop().split('?')[0];
    if (fs.existsSync(VENDOR + 'fonts/' + f))
      return r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(VENDOR + 'fonts/' + f) });
  }
  if (u.includes('fonts.googleapis.com')) {
    return r.fulfill({ contentType: 'text/css', body: fs.readFileSync('fuentes-abs.css', 'utf8') });
  }
  if (u.includes('/__f/') || u.includes('fonts.gstatic.com')) {
    const f = u.split('/').pop().split('?')[0];
    if (fs.existsSync('video/fonts/' + f))
      return r.fulfill({ contentType: 'font/ttf', body: fs.readFileSync('video/fonts/' + f) });
  }
  if (u.includes('jspdf')) {
    return r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(VENDOR + 'jspdf.umd.min.js', 'utf8') });
  }
  if (u.includes('supabase-js')) {
    // El cliente falso ya está instalado; el bundle real sobra.
    return r.fulfill({ contentType: 'application/javascript', body: '/* demo */' });
  }
  return r.continue();
});

const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('  [err]', m.text().slice(0, 140)); });

async function abrir(url) {
  await page.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  // El widget de feedback y el del asistente no deben salir en el video.
  await page.addStyleTag({ content: '#fbk-tab,#fbk-ov,elevenlabs-convai{display:none !important;}' });
  await page.evaluate(() => document.fonts.ready);
}

async function foto(nombre) {
  await page.waitForTimeout(700);
  await page.screenshot({ path: OUT + nombre + '.png' });
  console.log('  ✓', nombre);
}

// ── CATÁLOGO ──────────────────────────────────────────────────────────────
console.log('Catálogo…');
await abrir('catalogo.html');
await page.evaluate(() => {
  const mk = (id, name, cat, price, rating, reviews, district, icon, img) => ({
    id, providerId: 'p' + id, name, cat, price, precioACotizar: false, rating, reviews,
    esNuevo: false, esFundador: id % 3 === 0, district, tags: [], foto: null,
    imagenes: [], img, icon, badge: rating >= 4.8 ? 'Mejor calificado' : '✓ Verificado',
    desc: '', noIncluye: '', website: null
  });
  providers = [
    mk(1, 'Sonido Marco · DJ & Luces', 'musica', 1200, 4.9, 23, 'Miraflores', 'ti-music', 'b'),
    mk(2, 'Catering Doña Rosa', 'catering', 38, 4.7, 41, 'San Isidro', 'ti-tools-kitchen-2', 'a'),
    mk(3, 'Estudio Lente Azul', 'fotografia', 950, 4.9, 17, 'Barranco', 'ti-camera', 'c'),
    mk(4, 'Salón Los Jardines', 'locales', 2400, 4.6, 12, 'La Molina', 'ti-building', 'd'),
    mk(5, 'Animaciones Chispa', 'animadores', 600, 4.8, 29, 'Surco', 'ti-confetti', 'f'),
    mk(6, 'Decoración Pétalo', 'decoracion', 780, 4.7, 14, 'San Borja', 'ti-sparkles', 'e'),
    mk(7, 'Bar Móvil Nébula', 'bar', 1500, 4.8, 21, 'Miraflores', 'ti-glass-cocktail', 'e'),
    mk(8, 'Pastelería Dulce Lima', 'pasteleria', 320, 5.0, 33, 'Jesús María', 'ti-cake', 'g')
  ];
  render();
});
await foto('catalogo-grilla');

// ── DASHBOARD ─────────────────────────────────────────────────────────────
console.log('Dashboard…');
await page.setViewportSize({ width: 1600, height: 1260 });
await abrir('dashboard.html');
await page.waitForTimeout(2500);

// Cada herramienta carga su tabla una sola vez al arrancar; si alguna consulta
// de demostración llegó después de ese arranque, se recargan a mano.
await page.evaluate(async () => {
  if (typeof loadAgendaEvents === 'function') agendaEvents = await loadAgendaEvents();
  if (typeof loadCajaMovimientos === 'function') cajaMovimientos = await loadCajaMovimientos();
  if (typeof loadCrmClientes === 'function') crmClientes = await loadCrmClientes();
  if (typeof loadInvItems === 'function') invItems = await loadInvItems();
  const n = document.getElementById('sidebar-nombre');
  if (n) n.textContent = 'Sonido Marco · DJ & Luces';
});
await page.evaluate(() => goHome());
await page.waitForTimeout(1200);
await foto('panel-inicio');

for (const [tool, nombre] of [['agenda', 'panel-agenda'], ['cotizador', 'panel-cotizador'], ['caja', 'panel-caja'], ['analytics', 'panel-reportes'], ['crm', 'panel-crm']]) {
  await page.evaluate(t => {
    window.scrollTo(0, 0);
    // La agenda de demostración vive en el mes siguiente (eventos futuros,
    // sin el atenuado de los días ya pasados), así que el calendario se
    // posiciona ahí antes de la foto.
    if (t === 'agenda') {
      const h = new Date();
      calMonth = (h.getMonth() + 1) % 12;
      calYear = h.getFullYear() + (h.getMonth() === 11 ? 1 : 0);
    }
    openTool(t);
  }, tool);
  await page.waitForTimeout(1200);

  // El cotizador vacío no dice nada: se llena una cotización de ejemplo
  // usando los mismos campos y el mismo botón que usa el proveedor.
  if (tool === 'cotizador') {
    await page.evaluate(() => {
      const set = (id, v) => { const e = document.getElementById(id); if (e) e.value = v; };
      const hoy = new Date(); hoy.setDate(hoy.getDate() + 21);
      set('cot-cliente', 'Valeria Quispe');
      set('cot-telefono', '987 654 321');
      set('cot-correo', 'valeria.quispe@correo.com');
      set('cot-distrito', 'Miraflores');
      set('cot-lugar', 'Casa Hacienda Los Ficus, Av. Pardo 1420');
      set('cot-fecha', hoy.toISOString().slice(0, 10));
      set('cot-invitados', '120');
      set('cot-notas', 'Armado 2 horas antes. Ingreso de equipos por la puerta lateral.');
    });
    for (const [n, c, p] of [
      ['DJ + sonido profesional (5 horas)', '1', '1200'],
      ['Luces robóticas Beam', '6', '90'],
      ['Máquina de humo', '1', '150'],
      ['Hora adicional', '2', '150']
    ]) {
      await page.evaluate(([n, c, p]) => {
        document.getElementById('new-item-nombre').value = n;
        document.getElementById('new-item-cant').value = c;
        document.getElementById('new-item-precio').value = p;
        addCotizadorItem();
      }, [n, c, p]);
    }
    await page.waitForTimeout(500);
    await foto(nombre);
    // Segunda toma bajada hasta el total y el botón de PDF: es el remate
    // de la escena del cotizador.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);
    await foto('panel-cotizador-total');
    await page.evaluate(() => window.scrollTo(0, 0));
    continue;
  }

  await page.waitForTimeout(400);
  await foto(nombre);
}

await navegador.close();
console.log('Listo.');
