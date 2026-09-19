import { expect, Locator, Page } from '@playwright/test';

export const FIRST_PRODUCT_TEST_ID = 'product-details-1';

export class PlaygroundPage {
  readonly skipTourButton: Locator;
  readonly appsMenuButton: Locator;
  readonly shopLink: Locator;
  readonly firstProduct: Locator;
  readonly navbarBrand: Locator;

  constructor(private readonly page: Page) {
    this.skipTourButton = page.getByTestId('tour-skip');
    this.appsMenuButton = page.getByTestId('nav-apps-menu-button');
    this.shopLink = page.getByTestId('nav-app-shop');
    this.firstProduct = page.getByTestId(FIRST_PRODUCT_TEST_ID);
    this.navbarBrand = page.getByTestId('navbar-brand');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page).toHaveTitle(/QATools Playground/);
  }

  async skipTourIfVisible(): Promise<void> {
    if (await this.skipTourButton.isVisible()) {
      await this.skipTourButton.click();
    }
  }

  async openShop(): Promise<void> {
    await this.skipTourIfVisible();
    await this.appsMenuButton.click();
    await expect(this.shopLink).toBeVisible();
    await this.shopLink.click();
    await expect(this.firstProduct).toBeVisible();
  }

  async returnHome(): Promise<void> {
    await this.navbarBrand.click();
    await expect(this.page).toHaveURL(/playground\.qatools\.dev\/?$/);
  }
}
