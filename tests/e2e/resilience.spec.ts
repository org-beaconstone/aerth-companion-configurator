import { expect, test } from '@playwright/test';

test('clipboard refusal offers a valid selectable URL', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('Clipboard blocked')) },
    })
  );
  await page.goto('/');
  await page.getByRole('contentinfo').getByRole('button', { name: 'Your build' }).click();
  await page.getByRole('button', { name: 'Copy build link' }).click();
  const input = page.getByRole('textbox', { name: 'Shareable build URL' });
  await expect(input).toBeVisible();
  const url = new URL(await input.inputValue());
  expect(url.origin).toBe('http://127.0.0.1:4174');
  expect(JSON.parse(Buffer.from(url.searchParams.get('build')!, 'base64').toString()).version).toBe(
    2
  );
  await page.getByRole('button', { name: 'Select link' }).click();
  expect(
    await input.evaluate(
      (element: HTMLInputElement) => element.selectionEnd! - element.selectionStart!
    )
  ).toBe((await input.inputValue()).length);
});

test('lost WebGL context shows an honest, configurable fallback', async ({ page }) => {
  await page.goto('/');
  const scene = page.getByRole('img', { name: /Original SUV/ });
  await expect(scene).toHaveAttribute('data-ready', 'true');
  await scene
    .locator('canvas')
    .evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(
    page.getByText('3D is unavailable. Showing a simplified rear preview.')
  ).toBeVisible();
  await page
    .getByRole('group', { name: 'Ramp size' })
    .getByRole('button', { name: /^Large/ })
    .click();
  await expect(scene).toHaveAttribute('data-size', 'large');
});
