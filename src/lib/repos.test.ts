import { describe, expect, test } from 'vitest';
import file from '../content/repos.json';
import { OWNER, PROFILE_URL, languageColor, sameRepos, toPublicRepos, updatedAgo, type ApiRepo } from './repos';

const api = (over: Partial<ApiRepo> & { name: string }): ApiRepo => ({
  html_url: `https://github.com/${OWNER}/${over.name}`,
  description: 'Un repositorio.',
  homepage: null,
  language: 'TypeScript',
  stargazers_count: 1,
  forks_count: 0,
  pushed_at: '2026-10-01T10:00:00Z',
  archived: false,
  fork: false,
  private: false,
  topics: [],
  ...over,
});

describe('qué repositorios salen', () => {
  test('incluye todos los públicos, con cualquier topic o sin topics, y también forks y archivados', () => {
    const repos = toPublicRepos([
      api({ name: 'sale', topics: ['showcase'] }),
      api({ name: 'sin-etiqueta', topics: ['cli'] }),
      api({ name: 'sin-topics', topics: undefined }),
      api({ name: 'privado', private: true }),
      api({ name: 'fork', fork: true }),
      api({ name: 'archivado', archived: true }),
    ]);
    expect(repos.map((r) => r.name)).toEqual(['sale', 'sin-etiqueta', 'sin-topics', 'fork', 'archivado']);
    expect(repos.find((r) => r.name === 'archivado')?.archived).toBe(true);
  });

  test('no incluye repositorios de otra cuenta', () => {
    expect(toPublicRepos([api({ name: 'ajeno', html_url: 'https://github.com/otra/ajeno' })])).toEqual([]);
  });

  test('ordenados por el último cambio, el más reciente primero', () => {
    const repos = toPublicRepos([api({ name: 'viejo', pushed_at: '2025-01-01T00:00:00Z' }), api({ name: 'nuevo', pushed_at: '2026-10-15T00:00:00Z' })]);
    expect(repos.map((r) => r.name)).toEqual(['nuevo', 'viejo']);
  });

  test('negativo: una web que no es https:// se descarta (el repositorio sale sin web) y una descripción vacía queda en null', () => {
    const [a, b, c] = toPublicRepos([
      api({ name: 'a', homepage: 'http://inseguro.com', pushed_at: '2026-10-03T00:00:00Z' }),
      api({ name: 'b', homepage: 'javascript:alert(1)', pushed_at: '2026-10-02T00:00:00Z' }),
      api({ name: 'c', homepage: 'https://c.dev', description: '   ', pushed_at: '2026-10-01T00:00:00Z' }),
    ]);
    expect(a.homepage).toBeNull();
    expect(b.homepage).toBeNull();
    expect(c.homepage).toBe('https://c.dev');
    expect(c.description).toBeNull();
  });

  test('la fecha de generación no cuenta como cambio (si no, habría un commit cada día)', () => {
    const repos = toPublicRepos([api({ name: 'x' })]);
    expect(sameRepos({ repos }, { repos })).toBe(true);
    expect(sameRepos({ repos }, { repos: [] })).toBe(false);
  });
});

describe('cómo se enseñan', () => {
  const now = new Date('2026-10-16T12:00:00Z');
  test('«hace 3 días», «hace 2 meses»…', () => {
    expect(updatedAgo('2026-10-13T12:00:00Z', now)).toBe('hace 3 días');
    expect(updatedAgo('2026-10-15T12:00:00Z', now)).toBe('ayer');
    expect(updatedAgo('2026-08-10T12:00:00Z', now)).toBe('hace 2 meses');
    expect(updatedAgo('2026-10-16T11:59:50Z', now)).toBe('ahora mismo');
  });

  test('cada lenguaje con su color, y gris para el resto', () => {
    expect(languageColor('TypeScript')).toBe('#3178c6');
    expect(languageColor('Cobol')).toBe('#8b949e');
    expect(languageColor(null)).toBe('#8b949e');
  });
});

describe('el archivo real', () => {
  test('solo enlaces seguros a repositorios de Pol, y webs https://', () => {
    for (const r of file.repos as { url: string; homepage: string | null }[]) {
      expect(r.url.startsWith(`${PROFILE_URL}/`), r.url).toBe(true);
      if (r.homepage) expect(r.homepage.startsWith('https://'), r.homepage).toBe(true);
    }
    expect(file.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
