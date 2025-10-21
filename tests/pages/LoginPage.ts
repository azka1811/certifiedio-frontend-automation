import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegistrationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/new');
  }

  async fillPersonalInfo(firstName: string, lastName: string, email: string, phone: string, password: string) {
    await this.page.fill('input[placeholder="First name"]', firstName);
    await this.page.fill('input[placeholder="Last name"]', lastName);
    await this.page.fill('input[placeholder="Email address"]', email);
    await this.page.fill('input[placeholder="Phone number"]', phone);
    await this.page.fill('input[placeholder="Password"]', password);
  }

  async selectCountry(country: string = 'Australia') {
    await this.page.click('div[class*="absolute left-4 top-1/2"]');
    await this.page.click(`text=${country}`);
  }

  async continueToNextStep() {
    await this.page.click('button:has-text("Continue")');
  }

  async selectCertification(certification: string) {
    // Use the working selector from debug output
    await this.page.click('div[class*="cursor-pointer"]:has-text("Select your Qualification...")');
    await this.page.waitForSelector('div[class*="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-light-grey rounded-2xl shadow-2xl z-10"]');
    await this.page.click(`text=${certification}`);
  }

  async selectExperience(experience: string) {
    await this.page.click(`button:has-text("${experience}")`);
  }

  async fillWorkExperience(company: string) {
    await this.page.fill('input[placeholder="Company name or industry sector"]', company);
  }

  async selectState(state: string) {
    await this.page.click(`button:has-text("${state}")`);
  }

  async selectHasQualifications(hasQuals: boolean) {
    const buttonText = hasQuals ? 'Yes' : 'No';
    await this.page.click(`button:has-text("${buttonText}")`);
  }

  async fillQualificationDetails(qualifications: string) {
    await this.page.fill('textarea[placeholder*="List your relevant qualifications"]', qualifications);
  }

  async submitApplication() {
    await this.page.click('button:has-text("Submit Application")');
  }

  async assertRegistrationComplete() {
    await expect(this.page).toHaveURL(/dashboard|success|complete/i);
  }

  // Complete registration flow
  async completeRegistration(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    certification: string;
    experience: string;
    company: string;
    state: string;
    hasQualifications: boolean;
    qualifications?: string;
  }) {
    await this.open();
    
    // Step 1: Personal Info
    await this.fillPersonalInfo(userData.firstName, userData.lastName, userData.email, userData.phone, userData.password);
    await this.selectCountry();
    await this.continueToNextStep();
    
    // Step 2: Certification
    await this.selectCertification(userData.certification);
    await this.continueToNextStep();
    
    // Step 3: Experience
    await this.selectExperience(userData.experience);
    await this.fillWorkExperience(userData.company);
    await this.selectState(userData.state);
    await this.continueToNextStep();
    
    // Step 4: Qualifications
    await this.selectHasQualifications(userData.hasQualifications);
    if (userData.hasQualifications && userData.qualifications) {
      await this.fillQualificationDetails(userData.qualifications);
    }
    await this.submitApplication();
    
    await this.assertRegistrationComplete();
  }
}


