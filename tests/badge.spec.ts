import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5000/test/index.html');
});

test('badge renders and shows value', async ({ page }) => {
  const badge = page.locator('#badge');
  await expect(badge).toBeVisible();
  await expect(badge.locator('.dropdown-value')).toHaveText('Option 1');
});

test('dropdown opens and options are displayed', async ({ page }) => {
  await page.locator('#badge .dropdown-badge').click();
  await expect(page.locator('.dropdown-list')).toBeVisible();
  await expect(page.locator('.dropdown-option')).toHaveCount(3);
});