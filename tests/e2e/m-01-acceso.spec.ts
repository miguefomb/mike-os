import { expect, test } from '@playwright/test';
import { gotoLock, homeTestId } from './helpers';
import { PERSONA } from '../../src/content/persona';

test.describe('M-01 Pantalla de acceso', () => {
  test('muestra el nombre de Pol y la contraseña rellena con ocho puntos', async ({ page }) => {
    await gotoLock(page);
    await expect(page.getByTestId('lock-name')).toHaveText(PERSONA.name);
    await expect(page.getByTestId('lock-dots').locator('i')).toHaveCount(8);
  });

  test('el avatar muestra la foto de Pol, ya cargada y servida desde el propio sitio', async ({ page }) => {
    await gotoLock(page);
    const photo = page.getByTestId('lock-photo');
    await expect(photo).toBeVisible();
    await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await photo.evaluate((img: HTMLImageElement) => new URL(img.src).origin === location.origin)).toBe(true);
    await expect(page.getByTestId('lock-initials')).toHaveCount(0);
    // Decorativa: el nombre ya está escrito justo debajo.
    await expect(photo).toHaveAttribute('alt', '');
  });

  test('si la foto no carga, quedan las iniciales', async ({ page }) => {
    await page.route('**/*', (route) => (route.request().resourceType() === 'image' ? route.abort() : route.continue()));
    await gotoLock(page);
    await expect(page.getByTestId('lock-initials')).toHaveText(PERSONA.initials);
    await expect(page.getByTestId('lock-photo')).toHaveCount(0);
    await expect(page.getByTestId('lock-name')).toHaveText(PERSONA.name);
  });

  test('el bloque de acceso queda bajo el reloj y con aire por debajo, no pegado al borde', async ({ page }) => {
    await gotoLock(page);
    const box = async (id: string) => (await page.getByTestId(id).boundingBox())!;
    const clock = await box('lock-time');
    const avatar = await box('lock-avatar');
    const field = await box('lock-enter');
    const height = page.viewportSize()!.height;
    expect(avatar.y).toBeGreaterThan(clock.y + clock.height + 24);
    // Con la pista que hay debajo del campo, lo último del bloque no puede quedar en el 10 % inferior.
    expect(field.y + field.height + 40).toBeLessThan(height * 0.9);
  });

  test('un clic en el campo entra al sistema', async ({ page }, testInfo) => {
    await gotoLock(page);
    await page.getByTestId('lock-enter').click();
    await expect(page.getByTestId(homeTestId(testInfo.project.name))).toBeVisible();
    await expect(page.getByTestId('lock-screen')).toHaveCount(0);
  });

  test('pulsar Enter entra al sistema', async ({ page }, testInfo) => {
    await gotoLock(page);
    await page.keyboard.press('Enter');
    await expect(page.getByTestId(homeTestId(testInfo.project.name))).toBeVisible();
  });

  test('escribir en el campo no cambia nada ni muestra errores', async ({ page }, testInfo) => {
    await gotoLock(page);
    await page.keyboard.type('una-contraseña');
    await page.waitForTimeout(600);
    await expect(page.getByTestId('lock-screen')).toBeVisible();
    await expect(page.getByTestId('lock-dots').locator('i')).toHaveCount(8);
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByTestId(homeTestId(testInfo.project.name))).toHaveCount(0);
  });
});
