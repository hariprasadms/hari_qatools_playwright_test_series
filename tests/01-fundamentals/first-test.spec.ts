import { test, expect } from '@playwright/test';
import { PlaygroundPage } from '../../src/pages/playground-page';

// Lesson 01 - navigate from the home page to a product and back
test('navigate from the apps menu to a product and back home', { tag: '@navigation' }, async ({ page }) => {
	const playgroundPage = new PlaygroundPage(page);
	const firstProduct = playgroundPage.firstProduct;

	await test.step('Open the home page', async () => {
		await playgroundPage.open();
	});

	await test.step('Open the shop from the apps menu', async () => {
		await playgroundPage.openShop();
		await expect(firstProduct).toBeVisible();
	});

	await test.step('Open a product and return home', async () => {
		await firstProduct.click();
		await expect(playgroundPage.navbarBrand).toBeVisible();
		await playgroundPage.returnHome();
	});
});
