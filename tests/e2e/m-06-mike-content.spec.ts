import { expect, test } from '@playwright/test';
import { animationsDone, enter, loadProjects, openProjectDetail } from './helpers';
import { LINKS } from '../../src/content/links';

const projects = loadProjects();

test('Mike OS muestra los enlaces reales y las herramientas, sin estadísticas de ejemplo', async ({ page }, testInfo) => {
  await enter(page);
  const mobile = testInfo.project.name.endsWith('movil');
  const prefix = mobile ? 'mobile-icon-' : 'desktop-icon-';
  for (const link of LINKS.filter((l) => l.id !== 'github')) {
    await expect(page.getByTestId(prefix + link.id)).toHaveAttribute('href', link.url);
    await expect(page.getByTestId(prefix + link.id)).toHaveAttribute('target', '_blank');
  }
  await expect(page.getByTestId(prefix + 'web-madmike')).toContainText('Mi pagina web');
  await expect(page.getByTestId(prefix + 'whatsapp')).toHaveCount(0);
  await expect(page.getByTestId(prefix + 'newsletter')).toHaveCount(0);
  if (mobile) await page.getByTestId(prefix + 'stack').tap();
  else await page.getByTestId(prefix + 'stack').dblclick();
  const skills = page.getByTestId('stack-skills');
  await expect(skills).toContainText('Power Automate');
  await expect(skills).toContainText('DaVinci Resolve');
  await expect(skills).toContainText('Pro Tools');
  await expect(page.getByTestId('stack-stats')).toHaveCount(0);
  await expect(page.getByTestId('stack')).not.toContainText('Infinity');
  await animationsDone(page);
  expect(await skills.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
});

test('Favoritos muestra la selección completa, ordenada y con imágenes; Libro de visitas sigue vacío', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await enter(page);
  const mobile = testInfo.project.name.endsWith('movil');
  const prefix = mobile ? 'mobile-icon-' : 'desktop-icon-';
  if (mobile) await page.getByTestId(prefix + 'favorites').tap();
  else await page.getByTestId(prefix + 'favorites').dblclick();
  const favorites = await page.request.get('/favoritos.json');
  const sections = await favorites.json() as { kind: string; items: { id: string; title: string; cover: string }[] }[];
  expect(sections).toHaveLength(4);
  const counts: Record<string, number> = { movies: 45, music: 22, books: 7, games: 8 };
  const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });
  for (const section of sections) {
    await expect(page.getByTestId('favorites-card-' + section.kind)).toContainText(`${counts[section.kind]} favoritos`);
    await page.getByTestId('favorites-card-' + section.kind).click();
    const items = page.getByTestId('favorites').locator('[data-testid^="favorites-item-"]');
    await expect(items).toHaveCount(counts[section.kind]);
    expect(section.items.map((i) => i.title)).toEqual(section.items.map((i) => i.title).sort(collator.compare));
    for (const item of section.items) {
      const image = page.getByTestId('favorites-item-' + item.id).locator('img');
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    }
    expect(await page.getByTestId('favorites').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.getByTestId('favorites-back').click();
  }
  expect(await (await page.request.get('/libro-de-visitas.json')).json()).toEqual([]);
});

for (const project of projects) {
  test(`el proyecto ${project.name} presenta contenido e imágenes reales`, async ({ page }, testInfo) => {
    await enter(page);
    await openProjectDetail(page, testInfo.project.name, project);
    await expect(page.getByTestId('project-name')).toHaveText(project.name);
    await expect(page.getByTestId('project-detail')).toContainText(project.details[0]);
    await expect(page.getByTestId('project-detail')).not.toContainText('Proyecto de ejemplo');
    const icon = page.getByTestId('project-detail').locator('header img');
    await expect(icon).toHaveAttribute('src', project.icon!);
    await expect.poll(() => icon.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(page.getByTestId('project-visit')).toHaveAttribute('href', project.url);
    for (const [i, shot] of project.screenshots.entries()) {
      const image = page.getByTestId(`project-shot-${i}`).locator('img');
      await image.scrollIntoViewIfNeeded();
      await expect(page.getByTestId(`project-shot-${i}`)).toHaveAccessibleName(`Ampliar: ${shot.alt}`);
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
  });
}
