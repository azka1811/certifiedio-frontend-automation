import { test, expect } from '@playwright/test';

test.describe('authenticated area', () => {
  test('opens dashboard/home after reuse of storageState', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/dashboard|home|app/i);
  });
});


