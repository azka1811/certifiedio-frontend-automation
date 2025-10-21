import { Page, Expect, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(pathname: string = '/') {
    await this.page.goto(pathname);
  }

  async expectTitleMatches(pattern: RegExp) {
    await expect(this.page).toHaveTitle(pattern);
  }
}



