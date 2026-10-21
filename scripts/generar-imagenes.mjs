#!/usr/bin/env node
/**
 * Genera los iconos y la imagen para compartir (S-06) en `public/`:
 *   favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png y og.jpg (1200 × 630).
 * La imagen para compartir va en JPEG: un degradado con una foto pesa unas cinco veces menos que en
 * PNG, y algunas redes (WhatsApp) no muestran la vista previa de imágenes demasiado pesadas.
 * `public/favicon.svg` es la fuente del icono y se edita a mano.
 *
 * Se ejecuta a mano cuando cambia la foto (src/assets/foto.webp), el icono o el texto de
 * scripts/plantillas/og.html; los PNG resultantes se commitean. No forma parte del despliegue:
 * así no hay dependencias nuevas en la compilación.
 *
 * Uso:  node scripts/generar-imagenes.mjs     (necesita Google Chrome instalado)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { PERSONA } from '../src/content/persona.ts';

const raiz = new URL('../', import.meta.url);
const ruta = (p) => new URL(p, raiz);

const svg = readFileSync(ruta('public/favicon.svg'), 'utf8');
// iOS pone sus propias esquinas redondeadas: el icono táctil va a sangre, sin transparencia.
const svgASangre = svg.replace('rx="15"', 'rx="0"');
const aDataUri = (s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;

const foto = `data:image/webp;base64,${readFileSync(ruta('src/assets/foto.webp')).toString('base64')}`;
const plantillaOg = readFileSync(ruta('scripts/plantillas/og.html'), 'utf8').replace('{{FOTO}}', foto)
  .replace('{{NOMBRE}}', PERSONA.name)
  .replace('{{DOMINIO}}', new URL(PERSONA.siteUrl).host)
  .replaceAll('{{OS_NOMBRE}}', PERSONA.osName)
  .replaceAll('{{TAGLINE}}', PERSONA.tagline);

const navegador = await chromium.launch({ channel: 'chrome' });

async function pintar(html, ancho, alto, transparente, jpeg = false) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  await pagina.setContent(html, { waitUntil: 'load' });
  const png = await pagina.screenshot({
    ...(jpeg ? { type: 'jpeg', quality: 90 } : { type: 'png', omitBackground: transparente }),
    clip: { x: 0, y: 0, width: ancho, height: alto },
  });
  await pagina.close();
  return png;
}

const icono = (fuente, lado) =>
  pintar(
    `<!doctype html><style>html,body{margin:0;background:transparent}img{display:block;width:${lado}px;height:${lado}px}</style><img src="${aDataUri(fuente)}">`,
    lado,
    lado,
    true,
  );

/** Un .ico con varios PNG dentro (formato admitido desde Windows Vista y por todos los navegadores). */
function empaquetarIco(imagenes) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0);
  cabecera.writeUInt16LE(1, 2);
  cabecera.writeUInt16LE(imagenes.length, 4);
  let desplazamiento = 6 + 16 * imagenes.length;
  const entradas = imagenes.map(({ lado, png }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(lado >= 256 ? 0 : lado, 0);
    e.writeUInt8(lado >= 256 ? 0 : lado, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(desplazamiento, 12);
    desplazamiento += png.length;
    return e;
  });
  return Buffer.concat([cabecera, ...entradas, ...imagenes.map((i) => i.png)]);
}

const salidas = {
  'apple-touch-icon.png': await icono(svgASangre, 180),
  'icon-192.png': await icono(svg, 192),
  'icon-512.png': await icono(svg, 512),
  'og.jpg': await pintar(plantillaOg, 1200, 630, false, true),
  'favicon.ico': empaquetarIco(await Promise.all([16, 32, 48].map(async (lado) => ({ lado, png: await icono(svg, lado) })))),
};

await navegador.close();
for (const [nombre, datos] of Object.entries(salidas)) {
  writeFileSync(ruta(`public/${nombre}`), datos);
  console.log(`public/${nombre}  ${(datos.length / 1024).toFixed(1)} KB`);
}
