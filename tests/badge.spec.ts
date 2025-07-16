import { test, expect } from '@playwright/test';
import { DropdownListBadge, DropdownListBadgeEditor } from '../dropdown-list-badge';

interface CallServiceData {
  entity_id: string;
  option: string;
}

declare global {
  interface Window {
    hassStub: any; // Replace 'any' with a more specific type if you have one
  }
}

test.beforeEach(async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  // load page and badge
  await page.goto('http://localhost:5000/test/index.html');
  // attach hass stub
  await page.evaluate(() => {
    window.hassStub = {
      states: {
        "input_select.test": {
          state: "Option 1",
          attributes: {
            options: ["Option 1", "Option 2", "Option 3"]
          }
        }
      },
      callService(domain: string, service: string, data: CallServiceData): void {
        if (domain === "input_select" && service === "select_option") {
          this.states[data.entity_id].state = data.option;
          document.querySelectorAll('dropdown-list-badge').forEach(badge => {
        (badge as DropdownListBadge).hass = this;  // triggers the setter and re-renders
          });
        }
      }
    };
    const badge = document.querySelector('dropdown-list-badge') as DropdownListBadge;
    badge.hass = window.hassStub;
    badge.setConfig({
      entity: "input_select.test",
      options: ["Option 1", "Option 2", "Option 3"],
      name: 'Test Badge',
      icon: "mdi:star"
    });
  });
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

test('keyboard  works', async ({ page }) => {
  const badge = page.locator('#badge .dropdown-badge');

  await test.step('Select down to Option 2', async () => {
    await badge.click();
    await expect(page.locator('.dropdown-list')).toBeVisible();
    // Arrow down to second option and select
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('#badge .dropdown-value')).toHaveText('Option 2');
  });

  await test.step('Select down to Option 3', async () => {
    await badge.click();
    await expect(page.locator('.dropdown-list')).toBeVisible();
    // Arrow down to third option and select
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('#badge .dropdown-value')).toHaveText('Option 3');
  });

  await test.step('keyboard wrap around works', async () => {
    await badge.click();
    await expect(page.locator('.dropdown-list')).toBeVisible();
    // Arrow down to first option and select
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('#badge .dropdown-value')).toHaveText('Option 1');
  });

  await test.step ('keyboard up works', async () => {
    await badge.click();
    await expect(page.locator('.dropdown-list')).toBeVisible();
    // Arrow up to second option and select
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(page.locator('#badge .dropdown-value')).toHaveText('Option 2');
  });
});

test('dropdown closes on escape', async ({ page }) => {
  await page.locator('#badge .dropdown-badge').click();
  await expect(page.locator('.dropdown-list')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.dropdown-list')).not.toBeVisible();
});

test('badge displays name and icon if provided', async ({ page }) => {
  // Name
  await expect(page.locator('#badge .badge-name-inside')).toHaveText('Test Badge');
  // Icon (assumes .dropdown-icon uses aria-label or title for the icon name)
  await expect(page.locator('#badge .badge-icon[icon="mdi:star"]')).toBeVisible();
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

test('badge editor displays version', async ({ page }) => {
  await page.evaluate(() => {
    const editor = document.createElement('dropdown-list-badge-editor') as DropdownListBadgeEditor;
    document.body.appendChild(editor);
    editor.setConfig({
      entity: "input_select.test",
      options: ["Option 1", "Option 2", "Option 3"],
      name: 'Test Badge',
      icon: "mdi:star"
    });
    editor.hass = window.hassStub;
  });

  // Print the shadow DOM for debugging
  const html = await page.locator('dropdown-list-badge-editor').evaluate(
    el => (el.shadowRoot ? el.shadowRoot.innerHTML : 'NO SHADOW ROOT')
  );

  // Now try to get the version text
  const versionText = await page.locator('dropdown-list-badge-editor').evaluate((el) => {
    const versionEl = el.shadowRoot?.getElementById('badge-version');
    return versionEl ? versionEl.textContent : null;
  });
  expect(versionText).not.toContain('__VERSION__');
});
