import { chromium } from '@playwright/test';

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to dev server without waiting for load events
    await page.goto('http://localhost:3001', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Wait for content to render
    await page.waitForTimeout(3000);

    // Take desktop screenshot
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'screenshots/screenshot-desktop.png', fullPage: true });
    console.log('✓ Desktop screenshot saved: screenshots/screenshot-desktop.png');

    // Take tablet screenshot
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'screenshots/screenshot-tablet.png', fullPage: true });
    console.log('✓ Tablet screenshot saved: screenshots/screenshot-tablet.png');

    // Take mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'screenshots/screenshot-mobile.png', fullPage: true });
    console.log('✓ Mobile screenshot saved: screenshots/screenshot-mobile.png');

  } catch (error) {
    console.error('Error taking screenshots:', error.message);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
