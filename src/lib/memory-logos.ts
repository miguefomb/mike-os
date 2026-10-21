/**
 * Los logos del memory (C-05): qué herramienta lleva qué logo. Salen de `simple-icons` (SVG con licencia CC0; las marcas son de sus
 * dueños y aquí solo sirven para nombrar la herramienta), importados uno a uno para que solo entren los que se usan. Este archivo solo lo
 * importa la ventana del memory, que se carga al abrirla.
 *
 * Solo logos que se reconocen a simple vista (decisión de Pol, 2026-10-16): fuera los de nicho aunque estén en el Stack (GitHub Actions, MCP,
 * TanStack, Hono, Zod…). Todos son herramientas del Stack salvo GitHub, que va aparte en `MEMORY_EXTRAS`.
 */
import {
  siAnthropic,
  siAstro,
  siClaude,
  siCloudflare,
  siGithub,
  siHtml5,
  siJavascript,
  siNextdotjs,
  siPython,
  siReact,
  siRust,
  siStripe,
  siSupabase,
  siSvelte,
  siSwift,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVite,
} from 'simple-icons';

/** El trazo de cada logo, en una caja de 24 × 24, por el id de la herramienta (el de `stack.json`, o el de `MEMORY_EXTRAS`). */
export const MEMORY_LOGOS: Readonly<Record<string, string>> = {
  typescript: siTypescript.path,
  javascript: siJavascript.path,
  'html-css': siHtml5.path,
  python: siPython.path,
  rust: siRust.path,
  swift: siSwift.path,
  react: siReact.path,
  tailwind: siTailwindcss.path,
  vite: siVite.path,
  nextjs: siNextdotjs.path,
  astro: siAstro.path,
  svelte: siSvelte.path,
  supabase: siSupabase.path,
  cloudflare: siCloudflare.path,
  'claude-code': siClaude.path,
  anthropic: siAnthropic.path,
  stripe: siStripe.path,
  vercel: siVercel.path,
  github: siGithub.path,
};

/** Nombres más cortos que los del Stack, para que quepan en la carta. */
export const MEMORY_NAMES: Readonly<Record<string, string>> = { anthropic: 'Anthropic', cloudflare: 'Cloudflare' };

/** Lo que entra en el juego sin estar en el Stack (que cuenta dependencias, no dónde vive el código). */
export const MEMORY_EXTRAS: readonly { id: string; name: string }[] = [{ id: 'github', name: 'GitHub' }];

/** Herramientas de la web de Miguel y de Mike OS, sin inventar estadísticas de repositorios. */
export const MEMORY_PROFILE_TOOLS = [
  { id: 'html-css', name: 'HTML y CSS' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'nextjs', name: 'Next.js' },
  { id: 'tailwind', name: 'Tailwind CSS' },
  { id: 'vite', name: 'Vite' },
  { id: 'claude-code', name: 'Claude Code' },
  { id: 'vercel', name: 'Vercel' },
  { id: 'astro', name: 'Astro' },
  { id: 'svelte', name: 'Svelte' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'cloudflare', name: 'Cloudflare' },
];
