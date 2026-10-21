import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { LINKS, PROFILE_LINKS } from '../content/links';
import { isSafeProjectUrl } from './project-url';

// Guardas sobre el contenido real de src/content/projects: lo que un error al editar un JSON rompería sin avisar.
const dir = join(process.cwd(), 'src/content/projects');
const projects = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ id: f.replace(/\.json$/, ''), ...(JSON.parse(readFileSync(join(dir, f), 'utf8')) as Record<string, unknown>) })) as {
  id: string;
  name: string;
  url: string;
  domain: string;
  icon?: string;
  order: number;
  embeddable: boolean;
  example: boolean;
  summary: string;
  details?: string[];
  stack: string[];
  repo?: string;
  github?: { languages: { name: string; bytes: number }[]; topics: string[]; license: string | null };
  screenshots?: { src: string; alt: string; still?: string }[];
}[];

describe('proyectos de src/content/projects', () => {
  test('hay proyectos y ninguno es de ejemplo falso', () => {
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.map((p) => p.id)).not.toEqual(expect.arrayContaining(['estudio']));
  });

  test('cada proyecto tiene un orden propio', () => {
    const orders = projects.map((p) => p.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  test('cada dirección es https o una ruta local segura', () => {
    for (const p of projects) expect(isSafeProjectUrl(p.url), p.id).toBe(true);
  });

  test('el dominio que se enseña coincide con el de la dirección (salvo rutas locales)', () => {
    for (const p of projects.filter((x) => x.url.startsWith('https://'))) {
      const { host, pathname } = new URL(p.url);
      expect(p.domain, p.id).toBe(pathname === '/' ? host : `${host}${pathname}`);
    }
  });

  test('cada icono propio existe en public/projects', () => {
    for (const p of projects) {
      expect(p.icon, `${p.id}: cada proyecto necesita su icono propio`).toMatch(/^\/projects\/[a-z0-9-]+\.png$/);
      expect(existsSync(join(process.cwd(), 'public', p.icon!)), `${p.id}: ${p.icon}`).toBe(true);
    }
  });

  test('cada proyecto tiene una frase y al menos un párrafo que lo cuente', () => {
    for (const p of projects) {
      expect(p.summary?.trim().length, `${p.id}: summary`).toBeGreaterThan(10);
      expect((p.details ?? []).length, `${p.id}: details`).toBeGreaterThan(0);
      for (const d of p.details ?? []) expect(d.trim().length, `${p.id}: párrafo vacío`).toBeGreaterThan(0);
    }
  });

  test('cada captura existe en public, tiene texto alternativo y no pesa demasiado', () => {
    for (const p of projects) {
      for (const s of p.screenshots ?? []) {
        const file = join(process.cwd(), 'public', s.src);
        expect(existsSync(file), `${p.id}: ${s.src}`).toBe(true);
        expect(s.alt.trim().length, `${p.id}: alt de ${s.src}`).toBeGreaterThan(10);
        expect(statSync(file).size, `${p.id}: ${s.src} pesa demasiado`).toBeLessThan(400 * 1024);
        expect(s.src.startsWith(`/projects/${p.id}/`), `${p.id}: ${s.src} debe estar en su carpeta`).toBe(true);
      }
    }
  });

  test('cada GIF lleva su imagen fija, que existe, para quien tiene movimiento reducido', () => {
    for (const p of projects) {
      for (const s of (p.screenshots ?? []).filter((x) => x.src.endsWith('.gif'))) {
        expect(s.still, `${p.id}: ${s.src} sin still`).toBeTruthy();
        expect(existsSync(join(process.cwd(), 'public', s.still!)), `${p.id}: ${s.still}`).toBe(true);
      }
    }
  });

  test('un proyecto con repositorio tiene su copia de GitHub, y sin repositorio no hay datos de GitHub', () => {
    for (const p of projects) {
      if (p.repo) expect(p.github?.languages.length, `${p.id}: falta ejecutar scripts/actualizar-proyectos.mjs`).toBeGreaterThan(0);
      else expect(p.github, `${p.id}: github sin repo`).toBeUndefined();
    }
  });

  test('GitHub no se deja incrustar: un proyecto en github.com nunca figura como incrustable', () => {
    for (const p of projects.filter((x) => new URL(x.url, 'https://x.test').hostname === 'github.com')) {
      expect(p.embeddable, p.id).toBe(false);
    }
  });
});

describe('accesos directos de src/content/links.ts', () => {
  test('solo publica los perfiles confirmados de Miguel, sin un teléfono o newsletter de ejemplo', () => {
    expect(LINKS.find((l) => l.id === 'whatsapp')).toBeUndefined();
    expect(LINKS.find((l) => l.id === 'newsletter')).toBeUndefined();
    expect(PROFILE_LINKS.map((l) => l.id)).toEqual(['github', 'linkedin', 'instagram', 'youtube', 'spotify']);
    expect(LINKS.find((l) => l.id === 'github')?.url).toBe('https://github.com/miguefomb');
    expect(LINKS.find((l) => l.id === 'linkedin')?.url).toBe('https://www.linkedin.com/in/miguelfombuena/');
  });

  test('cada enlace es https y su icono existe en public/links', () => {
    for (const l of LINKS) {
      expect(l.url.startsWith('https://'), l.id).toBe(true);
      expect(l.icon, l.id).toMatch(/^\/links\/[a-z0-9-]+\.png$/);
      expect(existsSync(join(process.cwd(), 'public', l.icon)), `${l.id}: ${l.icon}`).toBe(true);
    }
  });
});
