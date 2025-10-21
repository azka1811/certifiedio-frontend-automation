import { test } from '@playwright/test';

test.describe('debug URLs', () => {
  test('print what URLs are being used', async ({ page, baseURL }) => {
    console.log('baseURL from config:', baseURL);
    console.log('DEV_URL env:', process.env.DEV_URL);
    console.log('STAGING_URL env:', process.env.STAGING_URL);
    console.log('PROD_URL env:', process.env.PROD_URL);
  });
});
