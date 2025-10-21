import { test, expect } from '@playwright/test';

test.describe('certification dropdown validation', () => {
  test('verify certification dropdown shows all expected values', async ({ page }) => {
    await page.goto('/new');
    
    // Fill personal info to get to step 2
    await page.fill('input[placeholder="First name"]', 'Test');
    await page.fill('input[placeholder="Last name"]', 'User');
    await page.fill('input[placeholder="Email address"]', 'test@example.com');
    await page.fill('input[placeholder="Phone number"]', '0412345678');
    await page.fill('input[placeholder="Password"]', 'TestPass123!');
    await page.click('button:has-text("Continue")');
    
    // Wait for step 2 to load
    await page.waitForSelector('h1:has-text("Choose Your Path")');
    
    // Open certification dropdown
    await page.click('div[class*="cursor-pointer"]:has-text("Select your Qualification...")');
    await page.waitForSelector('div[class*="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-light-grey rounded-2xl shadow-2xl z-10"]');
    
    // Expected certification values
    const expectedCertifications = [
      'CHC52021 - Diploma of Community Services',
      'CHC43015 - Certificate IV in Ageing Support',
      'CPP20218 - Certificate II in Security Operations',
      'CPC30220 Certificate III in Carpentry'
    ];
    
    console.log('Verifying certification dropdown values...');
    
    // Verify each certification is visible in the dropdown
    for (const cert of expectedCertifications) {
      const certElement = page.locator(`text=${cert}`);
      await expect(certElement).toBeVisible();
      console.log(`✅ Found: ${cert}`);
    }
    
    // Test selecting ONE certification only (don't loop through all)
    console.log(`Testing selection of: ${expectedCertifications[0]}`);
    
    // Click the first certification
    await page.click(`text=${expectedCertifications[0]}`);
    
    // Verify it's selected (should appear in the dropdown trigger)
    await expect(page.locator('div[class*="cursor-pointer"]:has-text("Select your Qualification...")')).toContainText(expectedCertifications[0]);
    console.log(`✅ Selected: ${expectedCertifications[0]}`);
    
    // STOP HERE - Don't continue to next step
    console.log('✅ Certification dropdown validation complete - stopping here');
    
    // PAUSE HERE TO DEBUG - This will stop the test
    await page.pause();
    
    // Take a screenshot to show the final state
    await page.screenshot({ path: 'certification-dropdown-validated.png' });
  });
});
