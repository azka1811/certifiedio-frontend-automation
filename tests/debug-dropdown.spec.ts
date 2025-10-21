import { test, expect } from '@playwright/test';

test.describe('debug dropdown issue', () => {
  test('debug what selectors are available on certification step', async ({ page }) => {
    await page.goto('/new');
    
    // Fill personal info first
    await page.fill('input[placeholder="First name"]', 'Test');
    await page.fill('input[placeholder="Last name"]', 'User');
    await page.fill('input[placeholder="Email address"]', 'test@example.com');
    await page.fill('input[placeholder="Phone number"]', '0412345678');
    await page.fill('input[placeholder="Password"]', 'TestPass123!');
    await page.click('button:has-text("Continue")');
    
    // Wait for step 2 to load
    await page.waitForSelector('h1:has-text("Choose Your Path")');
    
    // Take screenshot of the page
    await page.screenshot({ path: 'debug-step2.png' });
    
    // Print all elements that contain "Select your Qualification"
    const elements = await page.locator('*:has-text("Select your Qualification")').all();
    console.log(`Found ${elements.length} elements with "Select your Qualification"`);
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const tagName = await element.evaluate(el => el.tagName);
      const className = await element.getAttribute('class');
      const text = await element.textContent();
      console.log(`Element ${i}: ${tagName}, class="${className}", text="${text}"`);
    }
    
    // Try to find any clickable elements
    const clickableElements = await page.locator('div[class*="cursor-pointer"], button, [role="button"]').all();
    console.log(`Found ${clickableElements.length} potentially clickable elements`);
    
    for (let i = 0; i < Math.min(clickableElements.length, 10); i++) {
      const element = clickableElements[i];
      const text = await element.textContent();
      const className = await element.getAttribute('class');
      if (text && text.includes('Qualification')) {
        console.log(`Clickable element ${i}: class="${className}", text="${text}"`);
      }
    }
  });
});

