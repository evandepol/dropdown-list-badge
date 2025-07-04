import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:5000/test/index.html');
  await page.screenshot({ path: 'tests/results/debug-badge.png' });
  // Wait for the dropdown value to appear
  await expect(page.locator('#badge .dropdown-value')).toHaveText('Option 1', { timeout: 10000 });
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
  await expect(page.locator('.dropdown-option').nth(0)).toHaveText('Option 1');
  await expect(page.locator('.dropdown-option').nth(1)).toHaveText('Option 2');
  await expect(page.locator('.dropdown-option').nth(2)).toHaveText('Option 3');
});

test('selecting an option updates the value', async ({ page }) => {
  await page.locator('#badge .dropdown-badge').click();
  await page.locator('.dropdown-option').nth(1).click();
  await expect(page.locator('#badge .dropdown-value')).toHaveText('Option 2');
});

test('keyboard navigation works', async ({ page }) => {
  const badge = page.locator('#badge .dropdown-badge');
  await badge.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.dropdown-list')).toBeVisible();
  // Arrow down to second option and select
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('#badge .dropdown-value')).toHaveText('Option 2');
});

test('dropdown closes on escape', async ({ page }) => {
  await page.locator('#badge .dropdown-badge').click();
  await expect(page.locator('.dropdown-list')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.dropdown-list')).not.toBeVisible();
});

test('badge displays name and icon if provided', async ({ page }) => {
  // Name
  await expect(page.locator('#badge .dropdown-name')).toHaveText('Test Badge');
  // Icon (assumes .dropdown-icon uses aria-label or title for the icon name)
  await expect(page.locator('#badge .dropdown-icon')).toBeVisible();
});

test('visual regression: badge default', async ({ page }) => {
  await page.screenshot({ path: 'tests/results/badge-default.png' });
  expect(await page.screenshot()).toMatchSnapshot('badge-default.png');
});

test('visual regression: dropdown open', async ({ page }) => {
  await page.locator('#badge .dropdown-badge').click();
  await page.screenshot({ path: 'tests/results/badge-dropdown-open.png' });
  expect(await page.screenshot()).toMatchSnapshot('badge-dropdown-open.png');
});

test('double-click selects default option', async ({ page }) => {
  // Set default to "Option 3" via config (simulate editor)
  await page.evaluate(() => {
    const badge = document.getElementById('badge');
    badge.setConfig({
      entity: 'input_select.test',
      options: ['Option 1', 'Option 2', 'Option 3'],
      name: 'Test Badge',
      default: 'Option 3'
    });
    badge.hass = {
      states: {
        'input_select.test': {
          state: 'Option 1',
          attributes: { options: ['Option 1', 'Option 2', 'Option 3'] }
        }
      }
    };
  });
  // Double-click the badge
  await page.dblclick('#badge .dropdown-badge');
  await expect(page.locator('#badge .dropdown-value')).toHaveText('Option 3');
});
