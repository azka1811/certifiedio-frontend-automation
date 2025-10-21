import { test, expect } from '@playwright/test';

test.describe('DEMO Environment - Certification Dropdown Validation', () => {
  test('verify DEMO certification dropdown shows all expected values', async ({ page }) => {
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
    
    // DEMO Environment - Expected certification values
    const expectedCertifications = [
      'CHC52021 - Diploma of Community Services',
      'CHC43015 - Certificate IV in Ageing Support',
      'CPP20218 - Certificate II in Security Operations',
      'CPC30220 Certificate III in Carpentry'
    ];
    
    console.log('DEMO Environment - Verifying certification dropdown values...');
    
    // Verify each certification is visible in the dropdown
    for (const cert of expectedCertifications) {
      const certElement = page.locator(`text=${cert}`).first();
      await expect(certElement).toBeVisible();
      console.log(`✅ DEMO Found: ${cert}`);
    }
    
    // Test selecting ONE certification only
    console.log(`DEMO Testing selection of: ${expectedCertifications[0]}`);
    await page.click(`text=${expectedCertifications[0]}`);
    
    // Just verify the dropdown closed
    await page.waitForSelector('div[class*="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-light-grey rounded-2xl shadow-2xl z-10"]', { state: 'hidden' });
    console.log(`✅ DEMO Selected: ${expectedCertifications[0]}`);
    
    // STOP HERE - NO MORE STEPS
    console.log('✅ DEMO Certification dropdown validation complete - STOPPING HERE');
    
    // Take screenshot
    await page.screenshot({ path: 'report/demo-certification-dropdown-validated.png' });
    
    console.log('DEMO Test completed - no registration attempted');
  });
});
