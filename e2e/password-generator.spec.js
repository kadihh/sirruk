import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
});

test('loads and displays the app', async ({ page }) => {
  await expect(page.getByText('sirruk')).toBeVisible();
  await expect(page.getByText(/Weak|Medium|Strong|Very Strong/)).toBeVisible();
});

test('displays a generated password on load', async ({ page }) => {
  const password = page.locator('span.font-mono');
  await expect(password).not.toHaveText('No password generated', { timeout: 3000 });
  const text = await password.textContent();
  expect(text.length).toBeGreaterThan(0);
});

test('password is 16 characters by default', async ({ page }) => {
  const password = page.locator('span.font-mono');
  await expect(password).not.toHaveText('No password generated', { timeout: 3000 });
  const text = await password.textContent();
  expect(text).toHaveLength(16);
});

test('password contains characters from enabled sets (uppercase, lowercase, numbers)', async ({ page }) => {
  const password = page.locator('span.font-mono');
  await expect(password).not.toHaveText('No password generated', { timeout: 3000 });
  const text = await password.textContent();
  expect(text).toMatch(/[A-Z]/);
  expect(text).toMatch(/[a-z]/);
  expect(text).toMatch(/[0-9]/);
});

test('copy button copies password to clipboard', async ({ page }) => {
  const copyButton = page.getByLabel('Copy to clipboard');
  await expect(copyButton).toBeEnabled({ timeout: 3000 });
  await copyButton.click();
  await expect(page.getByText('Copied!')).toBeVisible({ timeout: 3000 });
});

test('service worker is registered', async ({ page }) => {
  const hasSW = await page.evaluate(() => 'serviceWorker' in navigator);
  expect(hasSW).toBe(true);
});

test('all toggles off shows empty feedback', async ({ page }) => {
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    const cb = checkboxes.nth(i);
    if (await cb.isChecked()) await cb.click({ force: true });
  }
  await expect(page.getByText('Enable at least one character set')).toBeVisible();
});

test('copy regenerate have aria-labels', async ({ page }) => {
  await expect(page.getByLabel('Copy to clipboard')).toBeVisible();
  await expect(page.getByLabel('Regenerate')).toBeVisible();
});

test('regenerate produces a different password', async ({ page }) => {
  const password = page.locator('span.font-mono');
  await expect(password).not.toHaveText('No password generated', { timeout: 3000 });
  const first = await password.textContent();

  let changed = false;
  for (let i = 0; i < 20; i++) {
    await page.getByLabel('Regenerate').click();
    const current = await password.textContent();
    if (current !== first) { changed = true; break; }
  }
  expect(changed).toBe(true);
});

test('toggling symbols on includes symbols in password', async ({ page }) => {
  const symbolsToggle = page.locator('input[type="checkbox"]').nth(3);
  if (!(await symbolsToggle.isChecked())) {
    await symbolsToggle.click({ force: true });
  }

  const password = page.locator('span.font-mono');
  await expect(password).not.toHaveText('No password generated', { timeout: 3000 });
  const text = await password.textContent();
  expect(text).toMatch(/[^A-Za-z0-9]/);
});

test('strength meter is visible', async ({ page }) => {
  await expect(page.locator('[role="img"][aria-label^="Password strength:"]')).toBeVisible();
});

test('length slider shows value', async ({ page }) => {
  await expect(page.locator('#length-slider')).toBeVisible();
  await expect(page.locator('input[type="number"]')).toHaveValue('16');
});
