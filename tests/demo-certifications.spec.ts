import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('DEMO Environment - Certification Dropdown Validation', () => {
  test('verify DEMO certification dropdown shows all expected values', async ({ page }) => {
    const summary = {
      environment: 'DEMO',
      status: 'pending',
      expectedCertifications: [
        'CHC52021 - Diploma of Community Services',
        'CHC43015 - Certificate IV in Ageing Support',
        'CPP20218 - Certificate II in Security Operations',
        'CPC30220 Certificate III in Carpentry',
      ],
      actualCertifications: [],
      missingCertifications: [],
      extraCertifications: [],
    };

    const summaryPath = path.resolve('report', 'demo-summary.json');

    await page.goto('/new');
    
    // Fill personal info to get to step 2
    await page.fill('input[placeholder="First name"]', 'Test');
    await page.fill('input[placeholder="Last name"]', 'User');
    await page.fill('input[placeholder="Email address"]', 'test@example.com');
    await page.fill('input[placeholder="Phone number"]', '0412345678');
    await page.fill('input[placeholder="Password"]', 'TestPass123!');
    await page.click('button:has-text("Continue")');
    
    try {
      // Wait for step 2 to load
      await page.waitForSelector('h1:has-text("Choose Your Path")');

      // Open certification dropdown
      await page.click('div[class*="cursor-pointer"]:has-text("Select your Qualification...")');
      const dropdown = page.locator(
        'div[class*="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-light-grey rounded-2xl shadow-2xl z-10"]'
      );
      await dropdown.waitFor();

      console.log('DEMO Environment - Verifying certification dropdown values...');

      // Capture actual certifications from dropdown headings
      const seen = new Set<string>();
      const collectOptions = async () => {
        const texts = await dropdown.locator('h3').allTextContents();
        texts.map((text) => text.trim()).filter(Boolean).forEach((text) => seen.add(text));
      };

      await collectOptions();
      summary.actualCertifications = Array.from(seen);
      summary.extraCertifications = summary.actualCertifications.filter(
        (actual) => !summary.expectedCertifications.some((expected) => actual.includes(expected))
      );

      // Verify each certification
      for (const cert of summary.expectedCertifications) {
        const certElement = page.locator(`text=${cert}`).first();
        const isVisible = await certElement.isVisible();
        if (!isVisible) {
          summary.missingCertifications.push(cert);
        }
        await expect(isVisible, `DEMO certification missing: ${cert}\nActual options: ${summary.actualCertifications.join(', ')}`).toBeTruthy();
        console.log(`✅ DEMO Found: ${cert}`);
      }

      // Test selecting ONE certification only
      console.log(`DEMO Testing selection of: ${summary.expectedCertifications[0]}`);
      await page.click(`text=${summary.expectedCertifications[0]}`);

      // Just verify the dropdown closed
      await dropdown.waitFor({ state: 'hidden' });
      console.log(`✅ DEMO Selected: ${summary.expectedCertifications[0]}`);

      // STOP HERE - NO MORE STEPS
      console.log('✅ DEMO Certification dropdown validation complete - STOPPING HERE');

      // Take screenshot
      await page.screenshot({ path: 'report/demo-certification-dropdown-validated.png' });

      console.log('DEMO Test completed - no registration attempted');
      summary.status = 'passed';
    } catch (error) {
      summary.status = 'failed';
      throw error;
    } finally {
      fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    }
  });
});
