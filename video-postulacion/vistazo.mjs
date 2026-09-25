// Fotografía unos pocos segundos sueltos de la escena para revisar
// la composición antes de renderizar el video entero.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import fs from 'node:fs';
const { chromium } = pw;

const tiempos = process.argv.slice(2).map(Number);
fs.mkdirSync('vistazo', { recursive: true });

const navegador = await chromium.launch();
const page = await navegador.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.log('  [err]', m.text().slice(0, 160)); });
page.on('pageerror', e => console.log('  [pageerror]', e.message));
await page.goto('http://127.0.0.1:8100/escena.html', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

for (const t of tiempos) {
  await page.evaluate(x => window.seek(x), t);
  await page.waitForTimeout(220);
  const n = 'vistazo/t' + String(t).replace('.', '_') + '.png';
  await page.screenshot({ path: n });
  console.log('  ✓', n);
}
await navegador.close();
