import { defineConfig, devices } from '@playwright/test';
// Load .env if present without making it a hard dependency
try { require('dotenv').config(); } catch {}

const DEMO_URL = process.env.DEMO_URL || 'https://demo.certified.io';
const EBC_URL = process.env.EBC_URL || 'https://ebc.certified.io';
const ETRAINING_URL = process.env.ETRAINING_URL || 'https://etraining.certified.io';

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
    baseURL: DEMO_URL,
    testIdAttribute: 'data-testid',
  },
  projects: [
    {
      name: 'demo',
      use: { ...devices['Desktop Chrome'], baseURL: DEMO_URL },
    },
    {
      name: 'ebc',
      use: { ...devices['Desktop Chrome'], baseURL: EBC_URL },
    },
    {
      name: 'etraining',
      use: { ...devices['Desktop Chrome'], baseURL: ETRAINING_URL },
    },
  ],
});




