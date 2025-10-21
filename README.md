## CertifiedIO Frontend Automation

### Setup

- Install dependencies:
```bash
npm ci
npx playwright install
```

- Environment variables (local or CI):
  - `DEV_URL` (default: https://demo.certified.io)
  - `STAGING_URL` (default: https://demo.certified.io)
  - `PROD_URL` (default: https://demo.certified.io)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO`

### Run tests

- All projects: `npm test`
- Dev only: `npm run test:dev`
- Staging only: `npm run test:staging`
- Prod only: `npm run test:prod`

### Run tests with UI (visual browser)

- All projects with UI: `npm run test:ui`
- Staging with UI: `npm run test:ui:staging`

### Authenticated runs (storageState)

- Set credentials in env:
  - `TEST_FIRST_NAME`, `TEST_LAST_NAME`, `TEST_EMAIL`, `TEST_PHONE`, `TEST_PASSWORD`
  - `TEST_CERTIFICATION`, `TEST_EXPERIENCE`, `TEST_COMPANY`, `TEST_STATE`, `TEST_QUALIFICATIONS`
- First run registers a new account via `setup` project and saves session to `report/storageState.json`.
- Other projects reuse that session automatically.

### Reports

- HTML: `report/html` (open with `npm run report:open`)
- JSON: `report/results.json`

### Email Summary

- Ensure SMTP env vars are set, then:
```bash
npm run report:email
```

### GitHub Actions (Daily at 12:00 UTC)
- **Page Object Model**

  - Pages live under `tests/pages/` and extend `BasePage`.
  - Example:
    ```ts
    import { test } from '@playwright/test';
    import { HomePage } from './tests/pages/HomePage';
    
    test('home', async ({ page }) => {
      const home = new HomePage(page);
      await home.open();
      await home.expectTitleMatches(/.+/);
    });
    ```


- Workflow defined in `.github/workflows/daily-tests.yml`.
- Configure repository Variables for URLs and Secrets for SMTP credentials.


