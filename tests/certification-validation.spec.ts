import { test, expect } from '@playwright/test';

test.describe('certification dropdown validation', () => {
  test('verify certification dropdown has expected values', async ({ page }) => {
    await page.goto('/new');
    
    // Fill personal info first
    await page.fill('input[placeholder="First name"]', 'Test');
    await page.fill('input[placeholder="Last name"]', 'User');
    await page.fill('input[placeholder="Email address"]', 'test@example.com');
    await page.fill('input[placeholder="Phone number"]', '0412345678');
    await page.fill('input[placeholder="Password"]', 'TestPass123!');
    await page.click('button:has-text("Continue")');
    
    // Open certification dropdown
    await page.click('div:has-text("Select your Qualification...")');
    await page.waitForSelector('div[class*="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-light-grey rounded-2xl shadow-2xl z-10"]');
    
    // Verify expected certification options are present
    const expectedCerts = [
      'CHC52021 - Diploma of Community Services',
      'CHC43015 - Certificate IV in Ageing Support',
      'CPP20218 - Certificate II in Security Operations',
      'CPC30220 Certificate III in Carpentry'
    ];
    
    for (const cert of expectedCerts) {
      await expect(page.locator(`text=${cert}`)).toBeVisible();
    }
  });
});
