import { test, expect } from '../fixtures/test';

test.describe('Primary navigation', () => {
  test.use({ role: 'publisher' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/en-GB');
  });

  test('nav links show inline and the menu toggle is hidden at desktop widths', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  });

  test('collapses into a hamburger menu below 960px and toggles on click', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 800 });

    const toggle = page.getByRole('button', { name: 'Menu' });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const homeLink = page.getByRole('link', { name: 'Home' });
    await expect(homeLink).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(homeLink).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(homeLink).toBeHidden();
  });

  test('first nav link aligns with the header logo at desktop widths (no double indent)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const logoBox = await page.locator('.statsWales-logo').boundingBox();
    const homeLinkBox = await page.getByRole('link', { name: 'Home' }).boundingBox();

    expect(Math.abs((logoBox?.x ?? 0) - (homeLinkBox?.x ?? 0))).toBeLessThanOrEqual(2);
  });
});
