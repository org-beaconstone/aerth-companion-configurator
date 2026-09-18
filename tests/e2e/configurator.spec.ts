import { expect, test } from '@playwright/test';

const category = (page: import('@playwright/test').Page, name: string) =>
  page
    .getByRole('navigation', { name: 'Configuration categories' })
    .getByRole('button', { name: new RegExp(name) });

test('renders the 3D SUV without runtime errors and updates every visual option', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const scene = page.getByRole('img', { name: /Original SUV/ });
  await expect(scene).toHaveAttribute('data-ready', 'true');
  const categories = page.getByRole('navigation', { name: 'Configuration categories' });
  await expect(categories.getByRole('button')).toHaveCount(4);
  await expect(categories.getByRole('button', { name: /Design/ })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Ramp design' })).toHaveCount(0);
  await expect(page.getByText('Integrated retractable pet ramp', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Stow retractable ramp')).toBeEnabled();
  await expect(scene).toHaveAttribute('data-vehicle-color', '#DDDEE1');
  await expect(page.getByRole('button', { name: 'Chalk vehicle paint' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(scene.locator('canvas')).toBeVisible();
  // R3F includes HTML fallback children inside <canvas>; only an outer fallback means failure.
  await expect(scene.locator(':scope > [data-renderer="fallback"]')).toHaveCount(0);
  await page
    .getByRole('group', { name: 'Ramp size' })
    .getByRole('button', { name: /^Large/ })
    .click();
  await expect(scene).toHaveAttribute('data-size', 'large');
  // Stow toggle is always available for retractable-only product
  await expect(scene).toHaveAttribute('data-type', 'retractable');
  // ADS Toggle's documented testId targets its visible clickable label.
  await page.getByTestId('stow-control').click();
  await expect(page.getByLabel('Stow retractable ramp')).toBeChecked();
  await expect(scene).toHaveAttribute('data-stowed', 'true');
  await expect(scene).toHaveAttribute('data-view', 'cargo');
  await page.getByLabel('Stow retractable ramp').focus();
  await page.keyboard.press('Space');
  await expect(page.getByLabel('Stow retractable ramp')).not.toBeChecked();
  await expect(scene).toHaveAttribute('data-stowed', 'false');
  await category(page, 'Surface').click();
  for (const [label, value] of [
    ['Cushioned tread', 'cushioned'],
    ['Cork touch', 'cork'],
    ['Ribbed grip', 'ribbed'],
  ]) {
    await page
      .getByRole('group', { name: 'Ramp surface' })
      .getByRole('button', { name: new RegExp(label) })
      .click();
    await expect(scene).toHaveAttribute('data-coating', value);
  }
  await category(page, 'Color').click();
  await page.getByRole('button', { name: /Canyon red Included/ }).click();
  await expect(scene).toHaveAttribute('data-color', '#C9372C');
  await page.getByRole('button', { name: 'Chalk vehicle paint' }).click();
  for (const [label, value] of [
    ['Rear view', 'rear'],
    ['Side profile view', 'side'],
    ['Front three-quarter view', 'front'],
    ['Rear three-quarter view', 'three-quarter'],
  ]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(scene).toHaveAttribute('data-view', value);
  }
  await page.getByRole('button', { name: 'Expand vehicle view' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Expand vehicle view' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('persists selections, exports exact build, and resets', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('group', { name: 'Ramp size' })
    .getByRole('button', { name: /^Small/ })
    .click();
  await category(page, 'Materials').click();
  await page
    .getByRole('group', { name: 'Material direction' })
    .getByRole('button', { name: /^Cork composite/ })
    .click();
  await page.reload();
  await expect(
    page.getByRole('group', { name: 'Ramp size' }).getByRole('button', { name: /^Small/ })
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('contentinfo').getByRole('button', { name: 'Your build' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Cork composite');
  await expect(dialog).toContainText('40 × 180 cm');
  const downloadPromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download build' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('aerth-companion-build.json');
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const data = JSON.parse(Buffer.concat(chunks).toString());
  expect(data.configuration.size).toBe('small');
  expect(data.configuration.material).toBe('cork');
  expect(data.designSystem.system).toBe('Atlassian Design System');
  expect(data.finishes.ramp).toEqual({ hex: '#1868DB', palette: 'Blue700' });
  expect(data.notice).toContain('conceptual');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'Reset build' }).click();
  await expect(
    page.getByRole('group', { name: 'Ramp size' }).getByRole('button', { name: /^Medium/ })
  ).toHaveAttribute('aria-pressed', 'true');
});

test('shared configuration loads and edits survive reload', async ({ page }) => {
  // Legacy config with type 'steps' should migrate to 'retractable'
  const legacyConfig = {
    size: 'large',
    type: 'steps',
    coating: 'cork',
    color: 'yellow',
    material: 'polypropylene',
    vehicleColor: 'graphite',
  };
  const encoded = Buffer.from(JSON.stringify({ version: 1, configuration: legacyConfig })).toString(
    'base64'
  );
  await page.goto(`/?build=${encodeURIComponent(encoded)}`);
  const scene = page.getByRole('img', { name: /Original SUV/ });
  // Legacy type='steps' migrates to retractable
  await expect(scene).toHaveAttribute('data-type', 'retractable');
  await expect(scene).toHaveAttribute('data-size', 'large');
  await page
    .getByRole('group', { name: 'Ramp size' })
    .getByRole('button', { name: /^Small/ })
    .click();
  expect(new URL(page.url()).searchParams.has('build')).toBe(false);
  await page.reload();
  await expect(scene).toHaveAttribute('data-size', 'small');
});

test('corrupted local state and malformed shared data fall back safely', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aerth_configuration', '{broken'));
  await page.goto('/?build=invalid');
  await expect(page.getByRole('img', { name: /Original SUV/ })).toHaveAttribute(
    'data-size',
    'medium'
  );
});

test('blocked localStorage still permits session changes', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    })
  );
  await page.goto('/');
  await expect(page.getByText('STORAGE UNAVAILABLE: SESSION ONLY')).toBeVisible();
  await page
    .getByRole('group', { name: 'Ramp size' })
    .getByRole('button', { name: /^Large/ })
    .click();
  await expect(page.getByRole('img', { name: /Original SUV/ })).toHaveAttribute(
    'data-size',
    'large'
  );
});

test('mobile configuration is usable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await category(page, 'Color').click();
  await page.getByRole('button', { name: /Solar yellow Included/ }).click();
  await expect(page.getByRole('img', { name: /Original SUV/ })).toHaveAttribute(
    'data-color',
    '#EED12B'
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await page.getByRole('contentinfo').getByRole('button', { name: 'Your build' }).click();
  await expect(page.getByRole('dialog')).toContainText('Solar yellow');
  await page.getByRole('button', { name: 'Close dialog' }).click();
});
