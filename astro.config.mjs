// @ts-check
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import svelte from '@astrojs/svelte';
import { cspDirectives, inlineScriptHash, scriptResources } from './src/lib/csp.ts';
import { PREFS_BOOT_SCRIPT } from './src/lib/prefs.ts';
import { PERSONA } from './src/content/persona.ts';

// Los proyectos incrustables autorizan su origen en `frame-src` (M-11). Se leen aquí porque la
// política se fija al compilar; el esquema de la colección valida estos mismos archivos.
const projectsDir = new URL('./src/content/projects/', import.meta.url);
const projects = readdirSync(projectsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(new URL(f, projectsDir), 'utf8')));

// Sobre mí (M-06): si hay PDF en public/, el documento enseña el botón de descarga. Se decide aquí, en Node: las páginas
// se ejecutan dentro del emulador de Cloudflare, donde `existsSync` no ve los archivos del disco.
const cvPdfExists = existsSync(new URL('./public/cv.pdf', import.meta.url));

const OS_SHARED = [
  'src/os/icons.ts',
  'src/os/items.ts',
  'src/lib/notes.ts',
  'src/content/links.ts',
  'src/os/stores/os-actions.ts',
  'src/os/shell/AppIcon.svelte',
  'src/os/stores/player.svelte.ts',
  'src/lib/favorites.ts',
  'src/os/apps/mail/turnstile-client.ts',
  'src/os/stores/prefs.svelte.ts',
  'src/lib/prefs.ts',
];

// Todas las páginas se pre-renderizan. Solo /api/contact (M-08) se ejecuta bajo demanda.
export default defineConfig({
  site: PERSONA.siteUrl,
  adapter: vercel(),
  session: false,
  // La barra de desarrollo de Astro se pinta abajo en el centro, encima del dock.
  devToolbar: { enabled: false },
  integrations: [svelte()],
  vite: {
    define: { __CV_PDF_EXISTS__: JSON.stringify(cvPdfExists) },
    build: {
      rollupOptions: {
        output: {
          // Las apps pesadas se cargan al abrirlas, y lo que comparten con la home Rollup lo parte en un archivo por módulo
          // (cada uno, una petición más al cargar la home). Se agrupa en uno solo; el presupuesto de S-06 lo vigila.
          manualChunks(id) {
            if (OS_SHARED.some((m) => id.endsWith(m))) return 'os-shared';
            // La ayuda de Vite para las importaciones dinámicas: con la Terminal también bajo demanda, Rollup la sacaba a su propio archivo.
            if (id.includes('vite/preload-helper')) return 'os-shared';
          },
        },
      },
    },
  },
  // Shiki (el resaltado de código por defecto) usa estilos en línea que la CSP bloquea. Las notas
  // (S-01) aún no llevan código; cuando lo lleven, habrá que elegir Prism o un resaltado propio.
  markdown: { syntaxHighlight: false },
  security: {
    // Astro escribe esta política en una etiqueta <meta> de cada página y añade los hashes de sus
    // propios scripts y estilos. `frame-ancestors` y el resto de cabeceras van en public/_headers.
    csp: {
      directives: cspDirectives(projects),
      scriptDirective: {
        resources: scriptResources(),
        // Script de arranque del tema (M-09): en línea, por eso lleva su hash.
        hashes: [inlineScriptHash(PREFS_BOOT_SCRIPT)],
      },
    },
  },
});
