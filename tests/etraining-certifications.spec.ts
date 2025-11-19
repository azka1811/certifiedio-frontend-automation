import { test, expect } from '@playwright/test';

test.describe('ETRAINING Environment - Certification Dropdown Validation', () => {
  test('verify ETRAINING certification dropdown shows all expected values', async ({ page }) => {
    await page.goto('/new');
    
    // Fill personal info to get to step 2
    await page.fill('input[placeholder="First name"]', 'Test');
    await page.fill('input[placeholder="Last name"]', 'User');
    await page.fill('input[placeholder="Email address"]', 'test@example.com');
    await page.fill('input[placeholder="Phone number"]', '0412345678');
    await page.fill('input[type="password"]', 'TestPass123!'); // ETRAINING uses type="password" not placeholder
    await page.click('button:has-text("Continue")');
    
    // Wait for step 2 to load
    await page.waitForSelector('h1:has-text("Choose Your Path")');
    
    // Open certification dropdown
    await page.click('div[class*="cursor-pointer"]:has-text("Select your Qualification...")');
    await page.waitForSelector('div[class*="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-light-grey rounded-2xl shadow-2xl z-10"]');
    
    // Log all option text currently shown in dropdown for debugging
    const dropdownLocator = page.locator('div[class*="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-light-grey rounded-2xl shadow-2xl z-10"]');
    await dropdownLocator.waitFor({ state: 'visible', timeout: 15000 });
    const dropdownText = await dropdownLocator.innerText();
    console.log('ETRAINING dropdown raw text:\n', dropdownText);
    const optionTexts = await dropdownLocator.locator('[role="option"], div, span, li').allInnerTexts();
    console.log('ETRAINING parsed option texts:', optionTexts);

    // ETRAINING Environment - Expected certification values
    const expectedCertifications = [
      'Certificate IV in Building and Construction',
      'CPC30220- Certificate III in Carpentry'
    ];
    
    console.log('ETRAINING Environment - Verifying certification dropdown values...');
    
    // Verify each certification is visible in the dropdown
    for (const cert of expectedCertifications) {
      const certElement = page.locator(`text=${cert}`).first();
      await expect(certElement).toBeVisible({ timeout: 15000 });
      console.log(`✅ ETRAINING Found: ${cert}`);
    }
    
    // Test selecting ONE certification only
    console.log(`ETRAINING Testing selection of: ${expectedCertifications[0]}`);
    await page.click(`text=${expectedCertifications[0]}`);
    
    // Just verify the dropdown closed
    await page.waitForSelector('div[class*="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-light-grey rounded-2xl shadow-2xl z-10"]', { state: 'hidden' });
    console.log(`✅ ETRAINING Selected: ${expectedCertifications[0]}`);
    
    // STOP HERE - NO MORE STEPS
    console.log('✅ ETRAINING Certification dropdown validation complete - STOPPING HERE');
    
    // Take screenshot
    await page.screenshot({ path: 'report/etraining-certification-dropdown-validated.png' });
    
    console.log('ETRAINING Test completed - no registration attempted');
  });
});
