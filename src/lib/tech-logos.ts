/**
 * Las tecnologías de «Cómo está hecho» (S-10), cada una con su logo. Los logos salen de `simple-icons` (SVG con licencia CC0; las marcas
 * son de sus dueños y aquí solo sirven para nombrar la tecnología). Se importa cada logo por su nombre, así que solo entran los que se usan.
 * Una tecnología sin logo en esa colección (`logo: null`) se enseña igualmente, con su nombre y sus iniciales.
 */
import {
  siAstro,
  siClaude,
  siVercel,
  siGithub,
  siGithubactions,
  siPnpm,
  siSvelte,
  siTypescript,
  siVite,
  siVitest,
} from 'simple-icons';

export interface Tech {
  id: string;
  name: string;
  /** Para qué se usa, en una línea. */
  role: string;
  /** El trazo del logo en una caja de 24 × 24, o null si la colección no lo tiene. */
  logo: string | null;
}

export const TECHS: readonly Tech[] = [
  { id: 'astro', name: 'Astro', role: 'El sitio: páginas estáticas, contenido y rutas', logo: siAstro.path },
  { id: 'svelte', name: 'Svelte', role: 'El escritorio, las ventanas y las apps', logo: siSvelte.path },
  { id: 'typescript', name: 'TypeScript', role: 'Todo el código, en modo estricto', logo: siTypescript.path },
  { id: 'vercel', name: 'Vercel', role: 'El alojamiento y las funciones de servidor', logo: siVercel.path },
  { id: 'cloudflare-turnstile', name: 'Cloudflare Turnstile', role: 'La verificación anti-bots de los formularios', logo: null },
  { id: 'vite', name: 'Vite', role: 'La compilación y el servidor de desarrollo', logo: siVite.path },
  { id: 'vitest', name: 'Vitest', role: 'Las pruebas unitarias', logo: siVitest.path },
  { id: 'playwright', name: 'Playwright', role: 'Las pruebas en un navegador real', logo: null },
  { id: 'pnpm', name: 'pnpm', role: 'Los paquetes del proyecto', logo: siPnpm.path },
  { id: 'github', name: 'GitHub', role: 'El repositorio y los datos de los proyectos', logo: siGithub.path },
  { id: 'github-actions', name: 'GitHub Actions', role: 'Actualización opcional de los datos de GitHub', logo: siGithubactions.path },
  { id: 'claude-code', name: 'Claude Code', role: 'El agente de desarrollo de la plantilla original', logo: siClaude.path },
];

/** Las iniciales de una tecnología, para cuando no tiene logo: «Cloudflare Turnstile» → «CT». */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
