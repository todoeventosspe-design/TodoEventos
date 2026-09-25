// Renderiza la escena fotograma a fotograma llamando a seek(t).
// No depende del reloj del navegador: cada imagen es el estado exacto
// del segundo que le toca, así el video sale idéntico en cada pasada.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import fs from 'node:fs';
const { chromium } = pw;

const FPS = Number(process.env.FPS || 30);
const DESDE = Number(process.env.DESDE || 0);
const HASTA = Number(process.env.HASTA || 0);   // 0 = hasta el final
const SALIDA = process.env.SALIDA || 'fotogramas';

fs.mkdirSync(SALIDA, { recursive: true });

const navegador = await chromium.launch({ args: ['--force-device-scale-factor=1', '--hide-scrollbars'] });
const page = await navegador.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('[pageerror]', e.message));

await page.goto('http://127.0.0.1:8100/escena.html', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// Las capturas del producto deben estar decodificadas antes del primer
// fotograma: si no, los primeros cuadros de la solución salen en blanco.
await page.evaluate(async () => {
  const urls = ['capturas/catalogo-grilla.png', 'capturas/panel-agenda.png',
                'capturas/panel-cotizador-total.png', 'capturas/panel-reportes.png'];
  await Promise.all(urls.map(u => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = u; })));
});
await page.waitForTimeout(800);

const duracion = HASTA || await page.evaluate(() => window.DURACION);
const total = Math.round(duracion * FPS) - Math.round(DESDE * FPS);
console.log(`Renderizando ${total} fotogramas (${DESDE}s → ${duracion}s @ ${FPS} fps)`);

const t0 = Date.now();
for (let i = 0; i < total; i++) {
  const t = DESDE + i / FPS;
  await page.evaluate(x => window.seek(x), t);
  await page.screenshot({
    path: `${SALIDA}/f${String(i).padStart(5, '0')}.jpg`,
    type: 'jpeg', quality: 93
  });
  if (i % 150 === 0 || i === total - 1) {
    const s = (Date.now() - t0) / 1000;
    const faltan = i ? (s / i) * (total - i) : 0;
    console.log(`  ${i + 1}/${total}  ${s.toFixed(0)}s transcurridos, ~${faltan.toFixed(0)}s restantes`);
  }
}
await navegador.close();
console.log('Fotogramas listos.');
