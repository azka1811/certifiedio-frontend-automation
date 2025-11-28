import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ETRAINING_EXPECTED_CERTIFICATIONS = [
  {
    title: 'CPC30220 Certificate III in Carpentry',
    subtitle: 'Certificate III in Carpentry',
  },
  {
    title: 'CPC32120 Certificate III in Wall and Floor Tiling',
    subtitle: 'Certificate III in Wall and Floor Tiling',
  },
  {
    title: 'CPC31220 Certificate III in Wall and Ceiling Lining',
    subtitle: 'Certificate III in Wall and Ceiling Lining',
  },
] as const;

const DROPDOWN_SELECTOR =
  'div[class*="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-light-grey rounded-2xl shadow-2xl z-10"]';

test.describe('ETRAINING Environment - Certification Dropdown Validation', () => {
  test('verify ETRAINING certification dropdown shows all expected values', async ({ page }) => {
    const summary = {
      environment: 'ETRAINING',
      status: 'pending',
      expectedCertifications: ETRAINING_EXPECTED_CERTIFICATIONS.map((cert) => cert.title),
      expectedSubtitles: ETRAINING_EXPECTED_CERTIFICATIONS.map((cert) => cert.subtitle),
      actualCertifications: [] as string[],
      actualSubtitles: [] as string[],
      missingCertifications: [] as string[],
      missingSubtitles: [] as string[],
      extraCertifications: [] as string[],
    };
    const summaryPath = path.resolve('report', 'etraining-summary.json');

    // Allow for slow env; give navigation up to 120s
    page.setDefaultNavigationTimeout(120000);
    await page.goto('/new', { waitUntil: 'domcontentloaded', timeout: 120000 });

    try {
      // Fill personal info to get to step 2
      await page.fill('input[placeholder="First name"]', 'Test');
      await page.fill('input[placeholder="Last name"]', 'User');
      await page.fill('input[placeholder="Email address"]', 'test@example.com');
      await page.fill('input[placeholder="Phone number"]', '0412345678');
      await page.fill('input[type="password"]', 'TestPass123!');
      await page.click('button:has-text("Continue")');

      // Wait for step 2 to load
      await page.waitForSelector('h1:has-text("Choose Your Path")');

      // Open certification dropdown
      await page.click('div[class*="cursor-pointer"]:has-text("Select your Qualification...")');
      const dropdown = page.locator(DROPDOWN_SELECTOR);
      await dropdown.waitFor();

      console.log('ETRAINING Environment - Verifying certification dropdown values...');

      // Wait for at least one certification card to appear in dropdown
      const titleLocator = dropdown.locator('h3').first();
      await titleLocator
        .waitFor({ timeout: 30000 })
        .catch(() => {
          throw new Error(
            'ETRAINING certifications did not load: no <h3> titles found in dropdown within 30s. ' +
            'Check backend/API or UI for errors.'
          );
        });

      // Capture actual certification titles (h3)
      const titleTexts = await dropdown.locator('h3').allTextContents();
      const IGNORE_TEXTS = new Set(['Cancel', 'Back', 'Continue']);
      summary.actualCertifications = titleTexts
        .map((text) => text.trim())
        .filter(Boolean)
        .filter((text) => !IGNORE_TEXTS.has(text));

      // Capture secondary/subtitle texts (commonly <p> tags)
      const subtitleCandidates = await dropdown.locator('p').allTextContents();
      summary.actualSubtitles = subtitleCandidates.map((text) => text.trim()).filter(Boolean);

      console.log(`📋 ETRAINING - Found ${summary.actualCertifications.length} certification titles in dropdown`);
      console.log(`📋 ETRAINING - Titles: ${summary.actualCertifications.join(', ')}`);
      console.log(`📋 ETRAINING - Subtitles: ${summary.actualSubtitles.join(', ')}`);

      summary.extraCertifications = summary.actualCertifications.filter(
        (actual) =>
          !summary.expectedCertifications.some(
            (expected) =>
              actual.includes(expected) ||
              expected.includes(actual) ||
              actual.toLowerCase() === expected.toLowerCase()
          )
      );

      // Verify each certification title/subtitle pair is visible in the dropdown
      for (const cert of ETRAINING_EXPECTED_CERTIFICATIONS) {
        const titleLocator = dropdown.locator('h3', { hasText: cert.title }).first();
        const titleCount = await titleLocator.count();
        if (titleCount === 0) {
          summary.missingCertifications.push(cert.title);
          await expect(
            titleLocator,
            `ETRAINING certification missing: ${cert.title}\nTitles found: ${
              summary.actualCertifications.length > 0 ? summary.actualCertifications.join(', ') : 'none'
            }`
          ).toHaveCount(1);
        } else {
          await expect(titleLocator).toBeVisible();
          console.log(`✅ ETRAINING Found: ${cert.title}`);
        }

        const subtitleLocator = dropdown.locator(`text=${cert.subtitle}`).first();
        const subtitleVisible = await subtitleLocator.isVisible().catch(() => false);
        if (!subtitleVisible) {
          summary.missingSubtitles.push(cert.subtitle);
          await expect(
            subtitleVisible,
            `ETRAINING subtitle missing: ${cert.subtitle}\nSubtitles found: ${
              summary.actualSubtitles.length > 0 ? summary.actualSubtitles.join(', ') : 'none'
            }`
          ).toBeTruthy();
        } else {
          console.log(`✅ ETRAINING Subtitle Found: ${cert.subtitle}`);
        }
      }

      // Test selecting ONE certification only
      console.log(`ETRAINING Testing selection of: ${summary.expectedCertifications[0]}`);
      await page.click(`text=${summary.expectedCertifications[0]}`);

      // Just verify the dropdown closed
      await dropdown.waitFor({ state: 'hidden' });
      console.log(`✅ ETRAINING Selected: ${summary.expectedCertifications[0]}`);

      // STOP HERE - NO MORE STEPS
      console.log('✅ ETRAINING Certification dropdown validation complete - STOPPING HERE');

      // Take screenshot
      await page.screenshot({ path: 'report/etraining-certification-dropdown-validated.png' });

      console.log('ETRAINING Test completed - no registration attempted');
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
