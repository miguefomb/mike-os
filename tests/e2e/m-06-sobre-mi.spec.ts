import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { animationsDone, enter } from './helpers';
import { PERSONA } from '../../src/content/persona';

const markdown = readFileSync(join(process.cwd(), 'src/content/sobre-mi.md'), 'utf8');
const tagline = /^tagline: (.+)$/m.exec(markdown)![1];
const headings = [...markdown.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const cvVersion = readFileSync(join(process.cwd(), 'src/content/sobre-mi.pdf.sha256'), 'utf8').trim();

const isMobile = (name: string) => name.endsWith('movil');

async function openAbout(page: Page, projectName: string) {
  if (isMobile(projectName)) await page.getByTestId('mobile-icon-about').tap();
  else await page.getByTestId('desktop-icon-about').dblclick();
  await expect(page.getByTestId('about')).toBeVisible();
}

test.describe('M-06 Sobre mí como documento', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await enter(page);
  });

  test('abre el documento con la foto, el nombre, la línea de presentación y todas las secciones', async ({ page }, testInfo) => {
    await openAbout(page, testInfo.project.name);
    await expect(page.getByTestId('about-title')).toHaveText(`Hola, soy ${PERSONA.firstName}`);
    await expect(page.getByTestId('about-tagline')).toHaveText(tagline);
    const photo = page.getByTestId('about-photo');
    await expect.poll(() => photo.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByTestId('about-body').locator('h2')).toHaveText(headings);
  });

  test('el botón Descargar PDF apunta al PDF, y el PDF se sirve como PDF', async ({ page }, testInfo) => {
    await openAbout(page, testInfo.project.name);
    const button = page.getByTestId('about-download');
    await expect(button).toHaveAttribute('href', `/cv.pdf?v=${cvVersion}`);
    await expect(button).toHaveAttribute('download', /\.pdf$/);
    const res = await page.request.get('/cv.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
    expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');
    const pendingDownload = page.waitForEvent('download');
    await button.click();
    const download = await pendingDownload;
    expect(download.suggestedFilename()).toBe(PERSONA.cvFileName);
    expect(readFileSync((await download.path())!)).toEqual(readFileSync(join(process.cwd(), 'public/cv.pdf')));
  });

  test('el enlace a Proyectos abre la app Proyectos y el de Correo abre Correo', async ({ page }, testInfo) => {
    await openAbout(page, testInfo.project.name);
    await page.getByTestId('about-body').getByRole('link', { name: 'Proyectos' }).click();
    await expect(page.getByTestId('projects')).toBeVisible();

    // En móvil la app abierta tapa la pantalla de inicio: hay que volver antes de reabrir Sobre mí.
    if (isMobile(testInfo.project.name)) await page.getByTestId('mobile-back').tap();
    await openAbout(page, testInfo.project.name);
    await page.getByTestId('about-body').getByRole('link', { name: 'Correo' }).click();
    await expect(page.getByTestId('mail')).toBeVisible();
  });

  test('los enlaces externos se abren en una pestaña nueva y sin dar acceso a Pol OS', async ({ page }, testInfo) => {
    await openAbout(page, testInfo.project.name);
    const external = page.getByTestId('about-body').locator('a[href^="https://"]');
    expect(await external.count()).toBeGreaterThan(0);
    for (const link of await external.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
    await expect(page.getByTestId('about-body').getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/miguelfombuena/');
  });

  test.describe('casos negativos', () => {
    test('el documento no contiene ninguna dirección de correo ni lo que se acordó no publicar', async ({ page }, testInfo) => {
      await openAbout(page, testInfo.project.name);
      const text = (await page.getByTestId('about').innerText()).replace(/\s+/g, ' ');
      expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
      for (const excluded of ['Lucía Ejemplo', 'Marcos Ejemplo']) {
        expect(text, excluded).not.toContain(excluded);
      }
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    });
  });

  test('el documento no tiene errores de accesibilidad en claro ni en oscuro', async ({ page }, testInfo) => {
    await openAbout(page, testInfo.project.name);
    for (const theme of ['light', 'dark'] as const) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await animationsDone(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, `tema ${theme}`).toEqual([]);
    }
  });
});
