import { defineConfig, devices } from '@playwright/test';
// Load .env if present without making it a hard dependency
try { require('dotenv').config(); } catch {}

const DEV_URL = process.env.DEV_URL || 'https://demo.certified.io';
const STAGING_URL = process.env.STAGING_URL || 'https://demo.certified.io';
const PROD_URL = process.env.PROD_URL || 'https://demo.certified.io';

export default defineConfig({
  testDir: './tests',
  outputDir: 'report/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'report/html', open: 'never' }],
    ['json', { outputFile: 'report/results.json' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: DEV_URL,
    testIdAttribute: 'data-testid',
  },
  projects: [
    // Run first to create storage state
    {
      name: 'setup',
      testMatch: /auth\.setup\.spec\.ts/,
    },
    {
      name: 'dev',
      use: { ...devices['Desktop Chrome'], baseURL: DEV_URL, storageState: 'report/storageState.json' },
      dependencies: ['setup'],
    },
    {
      name: 'staging',
      use: { ...devices['Desktop Chrome'], baseURL: STAGING_URL, storageState: 'report/storageState.json' },
      dependencies: ['setup'],
    },
    {
      name: 'prod',
      use: { ...devices['Desktop Chrome'], baseURL: PROD_URL, storageState: 'report/storageState.json' },
      dependencies: ['setup'],
    },
  ],
});



