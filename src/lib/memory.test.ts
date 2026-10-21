import { describe, expect, test } from 'vitest';
import stack from '../content/stack.json';
import { PAIRS, deal, flip, hide, isDone, isFaceUp, memoryPool, mustHide, shuffle, type MemoryState, type MemoryTool } from './memory';
import { MEMORY_EXTRAS, MEMORY_LOGOS, MEMORY_NAMES, MEMORY_PROFILE_TOOLS } from './memory-logos';

const tool = (id: string): MemoryTool => ({ id, name: id.toUpperCase(), logo: 'M0 0h24v24H0z' });
const POOL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map(tool);
const zero = () => 0;

/** Una partida con las cartas en un orden conocido: a a b b … */
const ordered = (ids: string[]): MemoryState => ({ cards: ids.flatMap((id) => [tool(id), tool(id)]), open: [], matched: [], moves: 0 });

describe('repartir', () => {
  test(`reparte ${PAIRS * 2} cartas: ${PAIRS} herramientas distintas, dos veces cada una`, () => {
    const s = deal(POOL, Math.random);
    expect(s.cards).toHaveLength(PAIRS * 2);
    const counts = new Map<string, number>();
    for (const c of s.cards) counts.set(c.id, (counts.get(c.id) ?? 0) + 1);
    expect(counts.size).toBe(PAIRS);
    expect([...counts.values()].every((n) => n === 2)).toBe(true);
    expect(s).toMatchObject({ open: [], matched: [], moves: 0 });
  });

  test('con el mismo azar sale la misma partida, y barajar no pierde ni repite elementos', () => {
    expect(deal(POOL, zero)).toEqual(deal(POOL, zero));
    const shuffled = shuffle(POOL, Math.random);
    expect([...shuffled].sort((x, y) => x.id.localeCompare(y.id))).toEqual(POOL);
    expect(shuffle(POOL, () => 0.999999)).toHaveLength(POOL.length);
  });

  test('sin herramientas suficientes no reparte', () => {
    expect(() => deal(POOL.slice(0, PAIRS - 1), zero)).toThrow();
  });
});

describe('jugar', () => {
  test('dos cartas iguales quedan descubiertas y cuentan un movimiento', () => {
    let s = flip(ordered(['a', 'b']), 0);
    expect(s.open).toEqual([0]);
    s = flip(s, 1);
    expect(s).toMatchObject({ open: [], matched: ['a'], moves: 1 });
    expect(isFaceUp(s, 0) && isFaceUp(s, 1)).toBe(true);
  });

  test('dos distintas cuentan un movimiento y se tapan con hide', () => {
    let s = flip(flip(ordered(['a', 'b']), 0), 2);
    expect(s).toMatchObject({ open: [0, 2], matched: [], moves: 1 });
    expect(mustHide(s)).toBe(true);
    s = hide(s);
    expect(s.open).toEqual([]);
    expect(isFaceUp(s, 0)).toBe(false);
  });

  test('al emparejar todas se acaba, con los movimientos justos', () => {
    let s = ordered(['a', 'b', 'c']);
    s = hide(flip(flip(s, 0), 2)); // fallo
    for (let i = 0; i < 6; i += 2) s = flip(flip(s, i), i + 1);
    expect(isDone(s)).toBe(true);
    expect(s.moves).toBe(4);
  });

  test('negativo: una carta descubierta, la misma dos veces, una tercera con dos levantadas o una posición que no existe no hacen nada', () => {
    const matched = flip(flip(ordered(['a', 'b']), 0), 1);
    expect(flip(matched, 0)).toBe(matched);
    const one = flip(ordered(['a', 'b']), 0);
    expect(flip(one, 0)).toBe(one);
    const two = flip(one, 2);
    expect(flip(two, 3)).toBe(two);
    expect(flip(one, -1)).toBe(one);
    expect(flip(one, 99)).toBe(one);
    expect(hide(one)).toBe(one);
  });
});

describe('las cartas salen de las herramientas del perfil y del Stack', () => {
  const tools = [...MEMORY_PROFILE_TOOLS, ...(stack.tools as { id: string; name: string }[]).filter((t) => !MEMORY_PROFILE_TOOLS.some((p) => p.id === t.id)), ...MEMORY_EXTRAS];
  test('las herramientas del perfil tienen un logo válido para el juego', () => {
    for (const tool of MEMORY_PROFILE_TOOLS) expect(MEMORY_LOGOS[tool.id], tool.id).toMatch(/^[Mm]/);
  });

  test(`hay herramientas con logo de sobra para una partida (${PAIRS} parejas) y todas tienen nombre y trazo`, () => {
    const pool = memoryPool(tools, MEMORY_LOGOS);
    expect(pool.length).toBeGreaterThanOrEqual(PAIRS);
    expect(deal(pool, zero).cards).toHaveLength(PAIRS * 2);
    for (const t of pool) {
      expect(t.name.length, t.id).toBeGreaterThan(0);
      expect(t.logo, t.id).toMatch(/^[Mm]/);
    }
  });

  test('las que no tienen logo propio o tienen uno poco conocido no salen; GitHub sí', () => {
    const pool = memoryPool(tools, MEMORY_LOGOS).map((t) => t.id);
    for (const id of ['sql', 'vercel-ai', 'openai', 'liveblocks', 'playwright', 'github-actions', 'mcp', 'tanstack', 'hono', 'zod']) expect(pool).not.toContain(id);
    expect(pool).toContain('github');
  });

  test('los nombres largos se acortan para que quepan en la carta', () => {
    const pool = memoryPool(tools, MEMORY_LOGOS, MEMORY_NAMES);
    expect(memoryPool([{ id: 'anthropic', name: 'SDK de Anthropic' }], MEMORY_LOGOS, MEMORY_NAMES)[0].name).toBe('Anthropic');
    for (const t of pool) expect(t.name.length, t.id).toBeLessThanOrEqual(12);
  });

  test('ningún logo se repite (dos cartas distintas no pueden parecer pareja)', () => {
    const paths = Object.values(MEMORY_LOGOS);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
