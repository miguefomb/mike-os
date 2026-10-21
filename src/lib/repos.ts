/**
 * Los repositorios de la ventana GitHub (C-01): de la respuesta de la API de GitHub a las tarjetas, sin red ni DOM. Lo usan el script diario
 * (`scripts/actualizar-repos.mjs`, que Node ejecuta sin compilar: solo sintaxis «borrable»), la ventana y los tests.
 *
 * Muestra todos los repositorios públicos del perfil de Miguel, incluidos forks y archivados.
 */
import { PERSONA } from '../content/persona.ts';

export const OWNER = PERSONA.github;
export const PROFILE_URL = `https://github.com/${OWNER}`;

/** Lo que interesa de cada repositorio en la respuesta de `GET /users/{owner}/repos`. */
export interface ApiRepo {
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  private: boolean;
  topics?: string[];
}

export interface Repo {
  name: string;
  url: string;
  description: string | null;
  /** La web del repositorio, solo si es `https://`. */
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  /** Último push, en ISO. */
  pushedAt: string;
  archived: boolean;
}

export interface ReposFile {
  generatedAt: string;
  repos: Repo[];
}

const isHttps = (u: string | null | undefined): u is string => {
  if (!u) return false;
  try {
    return new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
};

/** Todos los repositorios públicos del perfil, del más reciente al más antiguo, sin depender de sus topics. */
export function toPublicRepos(api: readonly ApiRepo[]): Repo[] {
  return api
    .filter((r) => !r.private)
    .filter((r) => r.html_url.startsWith(`${PROFILE_URL}/`))
    .map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description?.trim() || null,
      homepage: isHttps(r.homepage) ? r.homepage : null,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      pushedAt: r.pushed_at,
      archived: r.archived,
    }))
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));
}

/** ¿Han cambiado los repositorios? (La fecha de generación no cuenta: si no, habría un commit cada día.) */
export const sameRepos = (a: Pick<ReposFile, 'repos'>, b: Pick<ReposFile, 'repos'>) => JSON.stringify(a.repos) === JSON.stringify(b.repos);

/** «hace 3 días», «hace 2 meses»… a partir de `now`. */
export function updatedAgo(iso: string, now: Date): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'ahora mismo';
}

/** El punto de color de cada lenguaje, con los colores habituales de GitHub; gris para el resto. */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572a5',
  Rust: '#dea584',
  Swift: '#f05138',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Astro: '#ff5a03',
  Svelte: '#ff3e00',
  MDX: '#fcb32c',
  Go: '#00add8',
  Shell: '#89e051',
};
export const languageColor = (lang: string | null) => (lang && LANGUAGE_COLORS[lang]) || '#8b949e';
