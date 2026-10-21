#!/usr/bin/env node
/**
 * Actualiza `src/content/repos.json` (la ventana GitHub, C-01) con todos tus repositorios públicos.
 *
 * Solo lee la lista pública de repositorios (`GET /users/<tu usuario>/repos`): nunca ve los privados. El token es opcional (sin él, GitHub deja
 * 60 peticiones por hora y aquí se hace una o dos); con `STACK_GITHUB_TOKEN`, `GH_TOKEN` o `GITHUB_TOKEN` no hay límite que preocupe.
 * La lista se rehace entera cada vez: los repositorios borrados o convertidos en privados desaparecen.
 *
 *   node scripts/actualizar-repos.mjs           # actualiza el archivo si hay cambios
 *   node scripts/actualizar-repos.mjs --dry     # solo enseña el resultado
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { OWNER, sameRepos, toPublicRepos } from '../src/lib/repos.ts';

const salida = new URL('../src/content/repos.json', import.meta.url);
const dry = process.argv.includes('--dry');
const token = process.env.STACK_GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'pol-os-actualizar-repos', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

const todos = [];
for (let page = 1; ; page++) {
  const res = await fetch(`https://api.github.com/users/${OWNER}/repos?type=owner&per_page=100&page=${page}`, { headers });
  if (!res.ok) {
    console.error(`GitHub respondió ${res.status} ${res.statusText}; no se escribe nada.`);
    process.exit(1);
  }
  const batch = await res.json();
  todos.push(...batch);
  if (batch.length < 100) break;
}

const repos = toPublicRepos(todos);
const datos = { generatedAt: new Date().toISOString().slice(0, 10), repos };
console.log(`${repos.length} repositorios públicos de ${OWNER}: ${repos.map((r) => r.name).join(', ') || 'ninguno'}.`);

let anterior = null;
try {
  anterior = JSON.parse(readFileSync(salida, 'utf8'));
} catch {
  /* primera vez */
}
if (anterior && sameRepos(anterior, datos)) {
  console.log('Sin cambios.');
} else if (dry) {
  console.log('Habría cambios (modo --dry: no se escribe).');
} else {
  writeFileSync(salida, `${JSON.stringify(datos, null, 2)}\n`);
  console.log('src/content/repos.json actualizado.');
}
