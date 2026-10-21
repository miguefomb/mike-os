import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { PAIRS, deal, memoryPool } from '../../src/lib/memory';
import { MEMORY_EXTRAS, MEMORY_LOGOS, MEMORY_NAMES, MEMORY_PROFILE_TOOLS } from '../../src/lib/memory-logos';
import { animationsDone, enter, stubExternalSites } from './helpers';

const stack = JSON.parse(readFileSync('src/content/stack.json', 'utf8')) as { tools: { id: string; name: string }[] };
const isMobile = (name: string) => name.endsWith('movil');

/** Con el azar de `crypto` fijado a 0, el reparto es este: el test sabe dónde está cada pareja sin mirar el DOM. */
const LAYOUT = deal(memoryPool([...MEMORY_PROFILE_TOOLS, ...stack.tools.filter((t) => !MEMORY_PROFILE_TOOLS.some((p) => p.id === t.id)), ...MEMORY_EXTRAS], MEMORY_LOGOS, MEMORY_NAMES), () => 0).cards;
const pairsOf = () => {
  const seen = new Map<string, number[]>();
  LAYOUT.forEach((c, i) => seen.set(c.id, [...(seen.get(c.id) ?? []), i]));
  return [...seen.values()];
};
const firstMismatch = () => {
  const b = LAYOUT.findIndex((c) => c.id !== LAYOUT[0].id);
  return [0, b] as const;
};

async function fixRandom(page: Page) {
  await page.addInitScript(() => {
    const original = crypto.getRandomValues.bind(crypto);
    crypto.getRandomValues = (<T extends ArrayBufferView | null>(array: T): T => {
      if (array instanceof Uint32Array && array.length === 1) {
        array[0] = 0;
        return array;
      }
      return original(array as unknown as Uint8Array<ArrayBuffer>) as unknown as T;
    }) as typeof crypto.getRandomValues;
  });
}

async function openMemory(page: Page, projectName: string) {
  if (isMobile(projectName)) await page.getByTestId('mobile-dock-terminal').tap();
  else await page.getByTestId('dock-item-terminal').click();
  const input = page.getByTestId('terminal-input');
  await expect(input).toBeFocused();
  await input.fill('memory');
  await input.press('Enter');
  await expect(page.getByTestId('memory')).toBeVisible();
}

const card = (page: Page, i: number) => page.getByTestId(`memory-card-${i}`);

test.describe('C-05 Memory', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await stubExternalSites(context);
    await fixRandom(page);
    await enter(page);
  });

  test('minigames lo lista, y memory abre la ventana con 16 cartas boca abajo; antes no se descarga', async ({ page }, testInfo) => {
    const requested: string[] = [];
    page.on('request', (r) => r.url().includes('/apps/memory/') && requested.push(r.url()));
    if (isMobile(testInfo.project.name)) await page.getByTestId('mobile-dock-terminal').tap();
    else await page.getByTestId('dock-item-terminal').click();
    const input = page.getByTestId('terminal-input');
    await input.fill('minigames');
    await input.press('Enter');
    await expect(page.getByTestId('terminal-log')).toContainText('memory');
    expect(requested).toEqual([]);
    await input.fill('memory');
    await input.press('Enter');
    await expect(page.getByTestId('memory')).toBeVisible();
    expect(requested.length).toBeGreaterThan(0);
    await expect(page.locator('[data-testid^="memory-card-"]')).toHaveCount(PAIRS * 2);
    await expect(page.locator('[data-state="down"]')).toHaveCount(PAIRS * 2);
    await expect(page.getByTestId('memory-moves')).toHaveText('Movimientos: 0');
    await expect(card(page, 0)).toHaveAccessibleName('Carta 1, boca abajo');
  });

  test('una pareja queda a la vista con su nombre', async ({ page }, testInfo) => {
    await openMemory(page, testInfo.project.name);
    const [a, b] = pairsOf()[0];
    await card(page, a).click();
    await card(page, b).click();
    await expect(card(page, a)).toHaveAttribute('data-state', 'matched');
    await expect(card(page, b)).toHaveAttribute('data-state', 'matched');
    await expect(card(page, b)).toContainText(LAYOUT[b].name);
    await expect(card(page, b)).toHaveAccessibleName(`Carta ${b + 1}: ${LAYOUT[b].name}, pareja encontrada`);
    await expect(page.getByTestId('memory-status')).toHaveText(`Pareja: ${LAYOUT[b].name}.`);
    await expect(page.getByTestId('memory-note')).toHaveText(`Pareja: ${LAYOUT[b].name}.`);
    await expect(page.getByTestId('memory-pairs')).toHaveText(`Parejas: 1 de ${PAIRS}`);
    await expect(page.getByTestId('memory-moves')).toHaveText('Movimientos: 1');
  });

  test('negativo: dos que no son pareja se tapan solas, y una tercera no se levanta mientras tanto', async ({ page }, testInfo) => {
    await openMemory(page, testInfo.project.name);
    const [a, b] = firstMismatch();
    const third = LAYOUT.findIndex((_, i) => i !== a && i !== b);
    await card(page, a).click();
    await card(page, b).click();
    await expect(card(page, a)).toHaveAttribute('data-state', 'up');
    await expect(page.getByTestId('memory-status')).toHaveText(`${LAYOUT[b].name}. No son pareja.`);
    // Lo que se ve no dice el nombre de una carta sin pareja: eso sería una pista.
    await expect(page.getByTestId('memory-note')).toHaveText('No son pareja.');
    await card(page, third).click({ force: true });
    await expect(card(page, third)).toHaveAttribute('data-state', 'down');
    await expect(card(page, a)).toHaveAttribute('data-state', 'down');
    await expect(card(page, b)).toHaveAttribute('data-state', 'down');
    await expect(page.getByTestId('memory-moves')).toHaveText('Movimientos: 1');
  });

  test('una partida completa: mensaje final con los movimientos y «Jugar otra» reparte de nuevo', async ({ page }, testInfo) => {
    await openMemory(page, testInfo.project.name);
    for (const [a, b] of pairsOf()) {
      await card(page, a).click();
      await card(page, b).click();
    }
    await expect(page.getByTestId('memory-done')).toContainText(`¡Completado en ${PAIRS} movimientos!`);
    // El resultado sale una sola vez a la vista: la línea de estado desaparece (el lector de pantalla lo oye por su lado).
    await expect(page.getByTestId('memory-note')).toHaveCount(0);
    await expect(page.locator('[data-state="matched"]')).toHaveCount(PAIRS * 2);
    await page.getByTestId('memory-again').click();
    await expect(page.getByTestId('memory-done')).toHaveCount(0);
    await expect(page.locator('[data-state="down"]')).toHaveCount(PAIRS * 2);
    await expect(page.getByTestId('memory-moves')).toHaveText('Movimientos: 0');
    await expect(card(page, 0)).toBeFocused();
  });

  test('con el teclado: las flechas recorren la cuadrícula y Enter levanta la carta', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.name), 'En móvil no hay teclado.');
    await openMemory(page, testInfo.project.name);
    await card(page, 0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(card(page, 1)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(card(page, 5)).toBeFocused();
    await page.keyboard.press('End');
    await expect(card(page, PAIRS * 2 - 1)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(card(page, 0)).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(card(page, 0)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(card(page, 0)).toHaveAttribute('data-state', 'up');
    await expect(card(page, 0)).toHaveAccessibleName(`Carta 1: ${LAYOUT[0].name}`);
    await expect(page.getByTestId('memory-status')).toHaveText(LAYOUT[0].name);
    await expect(page.getByTestId('memory-note')).toHaveText('');
  });

  test('cabe en la pantalla sin desbordar y cada carta mide al menos 44 px', async ({ page }, testInfo) => {
    await openMemory(page, testInfo.project.name);
    for (let i = 0; i < PAIRS * 2; i++) {
      const box = (await card(page, i).boundingBox())!;
      expect(box.width, `carta ${i}`).toBeGreaterThanOrEqual(44);
      expect(box.height, `carta ${i}`).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const grid = (await page.getByTestId('memory').boundingBox())!;
    expect(grid.x).toBeGreaterThanOrEqual(0);
    expect(grid.x + grid.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  });

  for (const scheme of ['light', 'dark'] as const) {
    test(`no tiene problemas de accesibilidad, con cartas levantadas y emparejadas (${scheme})`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: scheme });
      await openMemory(page, testInfo.project.name);
      const [a, b] = pairsOf()[0];
      await card(page, a).click();
      await card(page, b).click();
      const other = pairsOf()[1][0];
      await card(page, other).click();
      await animationsDone(page);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    });
  }
});
