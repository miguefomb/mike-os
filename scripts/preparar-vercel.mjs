#!/usr/bin/env node
/** Tras Astro, incorpora las cabeceras también a la salida Build Output API de Vercel. */
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const source = JSON.parse(readFileSync(new URL('vercel.json', root), 'utf8'));
const path = new URL('.vercel/output/config.json', root);
const output = JSON.parse(readFileSync(path, 'utf8'));
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const headers = source.headers.map((rule) => ({
  src: `^${rule.source.split('(.*)').map(escape).join('(.*)')}$`,
  headers: Object.fromEntries(rule.headers.map(({ key, value }) => [key, value])),
  continue: true,
}));
output.routes = [...headers, ...output.routes];
writeFileSync(path, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Vercel: ${headers.length} reglas de cabeceras incorporadas a la salida.`);
