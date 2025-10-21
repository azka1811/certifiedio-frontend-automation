import { test } from '@playwright/test';
import { suggestLocators } from './utils/locatorSuggester';

test.describe.skip('locator suggestions (exploratory)', () => {
  test('scan homepage for suggested locators', async ({ page, baseURL }) => {
    await page.goto(baseURL || 'https://demo.certified.io');
    const suggestions = await suggestLocators(page);
    console.log(JSON.stringify(suggestions.slice(0, 50), null, 2));
  });
});


