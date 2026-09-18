import { expect, test } from '@playwright/test';

test('tread textures render distinctly and survive size changes and stowing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  const scene = page.getByRole('img', { name: /Original SUV/ });
  await expect(scene).toHaveAttribute('data-ready', 'true');
  // Enable ramp preview so the ramp appears in the 3D view.
  await page.getByTestId('show-ramp-control').click();
  await expect(scene).toHaveAttribute('data-show-ramp', 'true');
  await page.getByRole('button', { name: 'Cargo detail view', exact: true }).click();
  const category = page.getByRole('navigation', { name: 'Configuration categories' });
  await category.getByRole('button', { name: /Surface/ }).click();
  const settle = () =>
    page.evaluate(
      () =>
        new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    );
  const frames: Buffer[] = [];
  for (const label of ['Ribbed grip', 'Cushioned tread', 'Cork touch']) {
    await page
      .getByRole('group', { name: 'Ramp surface' })
      .getByRole('button', { name: new RegExp(label) })
      .click();
    await settle();
    frames.push(await scene.locator('canvas').screenshot());
  }
  expect(frames[0].equals(frames[1])).toBe(false);
  expect(frames[1].equals(frames[2])).toBe(false);
  // Resize while the textured coating is mounted, rather than selecting another surface first.
  await category.getByRole('button', { name: /Size/ }).click();
  await page
    .getByRole('group', { name: 'Ramp size' })
    .getByRole('button', { name: /^Large/ })
    .click();
  await expect(scene).toHaveAttribute('data-coating', 'cork');
  await expect(scene).toHaveAttribute('data-size', 'large');
  await settle();
  expect((await scene.locator('canvas').screenshot()).equals(frames[2])).toBe(false);
  await page.getByTestId('stow-control').click();
  await expect(scene).toHaveAttribute('data-stowed', 'true');
  await page.getByTestId('stow-control').click();
  await expect(scene).toHaveAttribute('data-stowed', 'false');
  await page.reload();
  await expect(scene).toHaveAttribute('data-ready', 'true');
  await expect(scene).toHaveAttribute('data-coating', 'cork');
  await expect(scene.locator(':scope > [data-renderer="fallback"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});
