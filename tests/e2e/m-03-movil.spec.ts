import { expect, test } from '@playwright/test';
import { enter, inFolder, loadNotes, loadProjects, stubExternalSites } from './helpers';

test.describe('M-03 Modo móvil', () => {
  test.beforeEach(async ({ page }) => enter(page));

  test('muestra la pantalla de inicio con iconos, carpetas y dock', async ({ page }) => {
    await expect(page.getByTestId('mobile-home')).toBeVisible();
    await expect(page.getByTestId('desktop')).toHaveCount(0);
    for (const id of ['folder-projects', 'about', 'folder-notes', 'stack']) {
      await expect(page.getByTestId(`mobile-icon-${id}`)).toBeVisible();
    }
    await expect(page.getByTestId('mobile-dock-mail')).toBeVisible();
  });

  test('un toque abre a pantalla completa e Inicio vuelve', async ({ page }) => {
    await page.getByTestId('mobile-icon-about').tap();
    const sheet = page.getByTestId('mobile-sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText('Mi CV.pdf');
    const b = await sheet.boundingBox();
    expect(b?.width).toBeCloseTo(390, 0);
    expect(b?.height).toBeCloseTo(844, 0);

    await page.getByTestId('mobile-back').tap();
    await expect(sheet).toHaveCount(0);
    await expect(page.getByTestId('mobile-home')).toBeVisible();
  });

  test('Mi pagina web está en el inicio y enlaza con la web real en una pestaña nueva', async ({ page }) => {
    const link = page.getByTestId('mobile-icon-web-madmike');
    await expect(link).toBeVisible();
    const href = new URL((await link.getAttribute('href'))!);
    expect(href.origin + href.pathname).toBe('https://madmikeprods.vercel.app/');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  });

  test('las carpetas muestran sus elementos y abren cada uno', async ({ page, context }) => {
    const project = inFolder(loadProjects())[0];
    await stubExternalSites(context);
    await page.getByTestId('mobile-icon-folder-projects').tap();
    const folder = page.getByTestId('mobile-folder');
    await expect(folder).toBeVisible();
    await expect(folder.getByTestId('mobile-icon-project-' + project.id)).toBeVisible();
    await folder.getByTestId('mobile-icon-project-' + project.id).tap();
    await expect(page.getByTestId('mobile-folder')).toHaveCount(0);
    await expect(page.getByTestId('mobile-sheet')).toContainText(project.name);

    await page.getByTestId('mobile-back').tap();
    await page.getByTestId('mobile-icon-folder-notes').tap();
    await expect(page.getByTestId('mobile-folder').locator('[data-testid^="mobile-icon-note-"]')).toHaveCount(loadNotes().length);
  });

  test('las apps del dock se abren a pantalla completa', async ({ page }) => {
    await page.getByTestId('mobile-dock-mail').tap();
    await expect(page.getByTestId('mobile-sheet')).toContainText('Correo');
  });

  test('al cambiar el ancho no se pierde lo que estaba abierto', async ({ page }) => {
    await page.getByTestId('mobile-icon-about').tap();
    await expect(page.getByTestId('mobile-sheet')).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByTestId('window-about')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('mobile-sheet')).toContainText('Mi CV.pdf');
  });
});
