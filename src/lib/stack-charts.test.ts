import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import type { StackTool } from './stack';
import { CATEGORIES } from './stack-catalog';
import { cumulativeByYear, donutArcs, linePoints, ringPath } from './stack-charts';

// La geometría se prueba con datos controlados, aunque el perfil no publique estadísticas de GitHub.
const stack: { tools: StackTool[] } = {
  tools: [
    { id: 'typescript', name: 'TypeScript', category: 'lenguajes', repos: 4, since: 2023 },
    { id: 'python', name: 'Python', category: 'lenguajes', repos: 2, since: 2025 },
    { id: 'svelte', name: 'Svelte', category: 'interfaz', repos: 3, since: 2024 },
    { id: 'cloudflare', name: 'Cloudflare Workers', category: 'datos', repos: 1, since: 2026 },
  ],
};

describe('donutArcs', () => {
  const geometry = { cx: 60, cy: 60, outer: 56, inner: 36, gap: 1.5 };
  const perCategory = CATEGORIES.map((c) => ({ id: c.id, value: stack.tools.filter((t) => t.category === c.id).length })).filter((c) => c.value > 0);
  const arcs = donutArcs(perCategory, geometry);

  test('una porción por categoría con herramientas, cada una proporcional a su número', () => {
    expect(arcs.map((a) => a.id)).toEqual(perCategory.map((c) => c.id));
    const total = perCategory.reduce((s, c) => s + c.value, 0);
    for (const arc of arcs) expect(arc.share).toBeCloseTo(perCategory.find((c) => c.id === arc.id)!.value / total, 9);
    expect(arcs.reduce((s, a) => s + a.share, 0)).toBeCloseTo(1, 9);
  });

  test('las porciones más los huecos dan la vuelta completa y no se pisan', () => {
    const swept = arcs.reduce((s, a) => s + (a.end - a.start), 0);
    expect(swept + geometry.gap * arcs.length).toBeCloseTo(360, 6);
    for (const [i, a] of arcs.entries()) {
      expect(a.end).toBeGreaterThan(a.start);
      if (i > 0) expect(a.start).toBeGreaterThanOrEqual(arcs[i - 1].end - 1e-9);
    }
  });

  test('el trazo es un camino SVG cerrado con dos arcos, sin números raros', () => {
    for (const arc of arcs) {
      expect(arc.d).toMatch(/^M[-\d. ]+A[-\d. ]+L[-\d. ]+A[-\d. ]+Z$/);
      expect(arc.d).not.toMatch(/NaN|Infinity/);
    }
  });

  test('con una sola categoría da la vuelta entera, sin hueco', () => {
    const [only] = donutArcs([{ id: 'a', value: 7 }], geometry);
    expect(only.end - only.start).toBeCloseTo(359.99, 2);
    expect(only.share).toBe(1);
  });

  test('sin valores no hay porciones, y una porción de más de media vuelta usa el arco grande', () => {
    expect(donutArcs([], geometry)).toEqual([]);
    expect(donutArcs([{ id: 'a', value: 0 }], geometry)).toEqual([]);
    expect(ringPath(60, 60, 56, 36, 0, 200)).toContain('0 1 1');
    expect(ringPath(60, 60, 56, 36, 0, 90)).toContain('0 0 1');
  });
});

describe('cumulativeByYear', () => {
  const steps = cumulativeByYear(stack.tools);

  test('no se salta ningún año, del primero al último, y el total no baja nunca', () => {
    const years = steps.map((s) => s.year);
    expect(years).toEqual(Array.from({ length: years.length }, (_, i) => years[0] + i));
    expect(years[0]).toBe(Math.min(...stack.tools.map((t) => t.since)));
    expect(years.at(-1)).toBe(Math.max(...stack.tools.map((t) => t.since)));
    expect(steps.every((s, i) => i === 0 || s.total >= steps[i - 1].total)).toBe(true);
  });

  test('termina en el total de herramientas y cada una aparece exactamente una vez', () => {
    expect(steps.at(-1)!.total).toBe(stack.tools.length);
    expect(steps.flatMap((s) => s.added).sort()).toEqual(stack.tools.map((t) => t.name).sort());
  });

  test('un año sin altas repite el total anterior, y las altas van de más a menos usadas', () => {
    const out = cumulativeByYear([
      { name: 'B', repos: 5, since: 2023 },
      { name: 'A', repos: 9, since: 2023 },
      { name: 'C', repos: 1, since: 2025 },
    ]);
    expect(out).toEqual([
      { year: 2023, added: ['A', 'B'], total: 2 },
      { year: 2024, added: [], total: 2 },
      { year: 2025, added: ['C'], total: 3 },
    ]);
    expect(cumulativeByYear([])).toEqual([]);
  });
});

describe('linePoints', () => {
  test('un punto por columna, centrado en ella, y el mayor total arriba del todo', () => {
    const p = linePoints([10, 20, 40], 8);
    expect(p.map((x) => x.x)).toEqual([(0.5 / 3) * 100, (1.5 / 3) * 100, (2.5 / 3) * 100]);
    expect(p[2].y).toBeCloseTo(92, 9);
    expect(p[0].y).toBeCloseTo(8 + (10 / 40) * 84, 9);
    expect(p.every((x) => x.y >= 0 && x.y <= 100)).toBe(true);
  });

  test('con todo a cero o sin datos no rompe', () => {
    expect(linePoints([0, 0]).every((p) => p.y === 0)).toBe(true);
    expect(linePoints([])).toEqual([]);
  });
});

// ─── Colores de categoría ──────────────────────────────────────────────────────────────────────────────────────
const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8').replace(/\r\n/g, '\n');

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** El bloque de tokens de un tema: el de :root (claro) o los dos del oscuro (media query y data-theme). */
const blocks = {
  claro: css.match(/:root \{[\s\S]*?\n\}/)![0],
  'oscuro (según el sistema)': css.match(/@media \(prefers-color-scheme: dark\) \{[\s\S]*?\n\}\n/)![0],
  'oscuro (elegido)': css.match(/:root\[data-theme="dark"\] \{[\s\S]*?\n\}/)![0],
};

describe('colores de categoría', () => {
  for (const [theme, block] of Object.entries(blocks)) {
    test(`${theme}: hay un color por categoría y su texto se lee (contraste de al menos 4,5:1)`, () => {
      const fg = /--cat-fg: (#[0-9a-f]{6});/i.exec(block)?.[1];
      expect(fg, 'falta --cat-fg').toBeTruthy();
      for (let i = 1; i <= CATEGORIES.length; i++) {
        const fill = new RegExp(`--cat-${i}: (#[0-9a-f]{6});`, 'i').exec(block)?.[1];
        expect(fill, `falta --cat-${i}`).toBeTruthy();
        expect(contrast(fill!, fg!), `--cat-${i} ${fill} con ${fg}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test('los colores de una paleta son todos distintos', () => {
    for (const block of Object.values(blocks)) {
      const fills = [...block.matchAll(/--cat-\d: (#[0-9a-f]{6});/gi)].map((m) => m[1].toLowerCase());
      expect(new Set(fills).size).toBe(fills.length);
    }
  });
});
