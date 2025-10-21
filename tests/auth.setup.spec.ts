import { test } from '@playwright/test';
import { RegistrationPage } from './pages/LoginPage';
import fs from 'fs';

const STORAGE_PATH = 'report/storageState.json';

test.describe('auth setup', () => {
  test('register new account and save storageState', async ({ page, context }) => {
    const userData = {
      firstName: process.env.TEST_FIRST_NAME || 'Test',
      lastName: process.env.TEST_LAST_NAME || 'User',
      email: process.env.TEST_EMAIL || `test${Date.now()}@example.com`,
      phone: process.env.TEST_PHONE || '0412345678',
      password: process.env.TEST_PASSWORD || 'TestPass123!',
      certification: process.env.TEST_CERTIFICATION || 'CHC52021 - Diploma of Community Services',
      experience: process.env.TEST_EXPERIENCE || '1-2 years',
      company: process.env.TEST_COMPANY || 'Test Company',
      state: process.env.TEST_STATE || 'NSW',
      hasQualifications: true,
      qualifications: process.env.TEST_QUALIFICATIONS || 'Bachelor of Engineering'
    };

    const registration = new RegistrationPage(page);
    await registration.completeRegistration(userData);

    const state = await context.storageState();
    fs.mkdirSync('report', { recursive: true });
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(state, null, 2));
  });
});

export default {};


