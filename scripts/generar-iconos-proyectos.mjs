#!/usr/bin/env node
/** Iconos propios de Mike OS: SVG editable y PNG de 256 px para proyectos y accesos directos. */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const file = (name) => new URL(name, root);
const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve('astro/package.json'));
const { default: sharp } = await import(pathToFileURL(astroRequire.resolve('sharp')).href);
const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Cada símbolo está dibujado para leerse también en los iconos pequeños de la carpeta.
const icons = [
  {
    id: 'mad-mike-prods', name: 'Mad Mike Prods', colors: ['#ff8c42', '#c14b18'], shortcut: true,
    art: `<rect x="56" y="108" width="144" height="91" rx="17" fill="white"/>
      <g transform="rotate(-12 128 88)"><rect x="55" y="65" width="146" height="31" rx="9" fill="white"/>
      <path d="m80 65 17 31m20-31 17 31m20-31 17 31" stroke="var(--ink)" stroke-width="14"/></g>
      <path d="m112 128 38 26-38 26z" fill="var(--ink)"/>
      <path d="M185 157v-23l19-5v21" fill="none" stroke="white" stroke-width="7" stroke-linejoin="round"/>
      <ellipse cx="180" cy="159" rx="10" ry="7" fill="white"/>`,
  },
  {
    id: 'facturas-presupuestos',
    art: `<path d="M86 47h61l38 38v109a16 16 0 0 1-16 16H86a16 16 0 0 1-16-16V63a16 16 0 0 1 16-16Z" fill="white"/>
      <path d="M146 47v27a12 12 0 0 0 12 12h27" fill="var(--ink)" opacity=".22"/>
      <path d="M94 104h39m-39 22h54m-54 22h28" stroke="var(--ink)" stroke-width="9" stroke-linecap="round" opacity=".75"/>
      <circle cx="172" cy="182" r="34" fill="var(--ink)" stroke="white" stroke-width="7"/>
      <path d="m158 182 10 10 19-21" fill="none" stroke="white" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'zoom-gamma',
    art: `<rect x="49" y="58" width="112" height="74" rx="14" fill="white" opacity=".52"/>
      <rect x="89" y="104" width="119" height="81" rx="14" fill="white"/>
      <path d="M148 185v22m-26 0h52" stroke="white" stroke-width="9" stroke-linecap="round"/>
      <path d="m139 128 28 17-28 17Z" fill="var(--ink)"/>
      <path d="M73 166H49v-25m0 0-12 13m12-13 13 12M181 67h26v24m0 0-13-12m13 12 12-13" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'prompt-images',
    art: `<rect x="52" y="47" width="143" height="143" rx="18" transform="rotate(-10 124 118)" fill="white" opacity=".42"/>
      <rect x="63" y="67" width="143" height="143" rx="18" fill="white"/>
      <rect x="75" y="79" width="119" height="119" rx="9" fill="var(--ink)" opacity=".19"/>
      <path d="m76 178 37-44 22 25 21-22 38 43v9H76Z" fill="var(--ink)" opacity=".85"/>
      <circle cx="106" cy="109" r="14" fill="var(--ink)"/>
      <path d="m189 36 5 17 17 5-17 5-5 17-5-17-17-5 17-5Z" fill="white"/>`,
  },
  {
    id: 'codigos-chatgpt',
    art: `<path d="M65 62h126a17 17 0 0 1 17 17v92a17 17 0 0 1-17 17h-71l-38 27v-27H65a17 17 0 0 1-17-17V79a17 17 0 0 1 17-17Z" fill="white"/>
      <path d="m98 107-21 20 21 20m61-40 21 20-21 20m-19-49-19 59" fill="none" stroke="var(--ink)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'papercraft-dog',
    art: `<path d="m66 83 39-28 25 23 27-23 37 28-12 94-52 31-52-31Z" fill="white"/>
      <path d="m66 83 39-28-6 69Zm128 0-37-28 7 69Z" fill="var(--ink)" opacity=".5"/>
      <path d="m78 177 52-40 52 40-52 31Z" fill="var(--ink)" opacity=".16"/>
      <path d="m130 78-31 46 31 13 34-13Z" fill="var(--ink)" opacity=".08"/>
      <path d="m116 152 14 13 15-13Z" fill="var(--ink)"/>
      <circle cx="103" cy="129" r="7" fill="var(--ink)"/><circle cx="157" cy="129" r="7" fill="var(--ink)"/>
      <path d="M130 165v14" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>`,
  },
  {
    id: 'web-madmike', name: 'Mi pagina web', colors: ['#46b5f5', '#2456bd'], shortcut: true,
    art: `<rect x="45" y="58" width="166" height="142" rx="18" fill="white"/>
      <path d="M45 91h166" stroke="var(--ink)" stroke-width="7" opacity=".22"/>
      <circle cx="64" cy="75" r="4" fill="var(--ink)"/><circle cx="79" cy="75" r="4" fill="var(--ink)" opacity=".6"/>
      <circle cx="128" cy="142" r="37" fill="none" stroke="var(--ink)" stroke-width="7"/>
      <ellipse cx="128" cy="142" rx="16" ry="37" fill="none" stroke="var(--ink)" stroke-width="6"/>
      <path d="M91 142h74" stroke="var(--ink)" stroke-width="6"/>
      <path d="m171 157 5 54 12-17 20-5Z" fill="var(--ink)" stroke="white" stroke-width="5" stroke-linejoin="round"/>`,
  },
  {
    id: 'este-portfolio',
    art: `<rect x="46" y="57" width="164" height="135" rx="18" fill="white"/>
      <path d="M46 91h164" stroke="var(--ink)" stroke-width="7" opacity=".22"/>
      <circle cx="65" cy="75" r="4" fill="var(--ink)"/><circle cx="80" cy="75" r="4" fill="var(--ink)" opacity=".7"/><circle cx="95" cy="75" r="4" fill="var(--ink)" opacity=".4"/>
      <path d="m78 117 21 20-21 20m38 0h30" fill="none" stroke="var(--ink)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="74" y="207" width="108" height="12" rx="6" fill="white" opacity=".65"/>`,
  },
  {
    id: 'mikeflix',
    art: `<rect x="42" y="48" width="172" height="123" rx="18" fill="white"/>
      <rect x="54" y="60" width="148" height="99" rx="9" fill="var(--ink)"/>
      <path d="m115 84 35 26-35 26Z" fill="#f7b32b"/>
      <path d="M128 171v17m-29 0h58" stroke="white" stroke-width="8" stroke-linecap="round"/>
      <rect x="57" y="201" width="142" height="27" rx="9" fill="white"/>
      <circle cx="74" cy="214" r="4" fill="#f7b32b"/>
      <path d="M92 214h49m14 0h24" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>`,
  },
];

mkdirSync(file('src/assets/project-icons/'), { recursive: true });
for (const spec of icons) {
  const projectPath = file(`src/content/projects/${spec.id}.json`);
  const project = existsSync(projectPath) ? JSON.parse(readFileSync(projectPath, 'utf8')) : null;
  const name = spec.name ?? project.name;
  const [from, to] = spec.colors ?? [project.colors.from, project.colors.to];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" style="--ink:${to}"><title>${escape(name)}</title>
    <defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient><radialGradient id="light" cx=".25" cy="0" r="1"><stop stop-color="white" stop-opacity=".2"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="${to}" flood-opacity=".28"/></filter></defs>
    <rect width="256" height="256" rx="59" fill="url(#bg)"/><rect width="256" height="256" rx="59" fill="url(#light)"/><rect x="1" y="1" width="254" height="254" rx="58" fill="none" stroke="white" stroke-opacity=".25" stroke-width="2"/><g filter="url(#shadow)">${spec.art.replaceAll('var(--ink)', to)}</g></svg>\n`;
  const sourcePath = file(`src/assets/project-icons/${spec.id}.svg`);
  const output = `/${spec.shortcut ? 'links' : 'projects'}/${spec.id}.png`;
  writeFileSync(sourcePath, svg);
  await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(file(`public${output}`)));
  if (project && !spec.shortcut) {
    project.icon = output;
    writeFileSync(projectPath, `${JSON.stringify(project, null, 2)}\n`);
  }
  console.log(`${name}: ${output}`);
}
