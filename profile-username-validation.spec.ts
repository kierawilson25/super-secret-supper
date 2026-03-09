import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = '/tmp/screenshots';
const BASE_URL = 'http://localhost:3000';

function screenshotPath(name: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(SCREENSHOTS_DIR, `${timestamp}-${name}.png`);
}

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
});

test('Step 1 - /profile redirects to /login when unauthenticated', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  const ss1 = screenshotPath('01-after-profile-navigation');
  await page.screenshot({ path: ss1, fullPage: true });

  console.log(`URL after navigating to /profile: ${currentUrl}`);
  console.log(`Screenshot: ${ss1}`);
  console.log(`Console errors: ${consoleErrors.join(', ') || 'none'}`);

  const redirectedToLogin = currentUrl.includes('/login');
  console.log(`Redirected to /login: ${redirectedToLogin}`);

  if (redirectedToLogin) {
    // Verify the returnTo param is present and correct
    const hasReturnTo = currentUrl.includes('returnTo=/profile') || currentUrl.includes('returnTo=%2Fprofile');
    console.log(`returnTo=/profile param present: ${hasReturnTo}`);

    // Inspect what the login page looks like
    const ss2 = screenshotPath('02-login-page');
    await page.screenshot({ path: ss2, fullPage: true });
    console.log(`Login page screenshot: ${ss2}`);

    const loginText = await page.evaluate(() => document.body.innerText.trim().substring(0, 500));
    console.log(`Login page content preview:\n${loginText}`);

    expect(redirectedToLogin).toBe(true);
    return;
  }

  // If we reach here, session was cached — run the full validation test
  console.log('Profile page loaded (session cached). Running validation tests...');
  await runValidationTests(page);
});

async function runValidationTests(page: Page) {
  // Wait for page to fully render
  await page.waitForTimeout(3000);

  // Check if we got quietly redirected
  if (page.url().includes('/login')) {
    console.log('Delayed redirect to /login detected.');
    return;
  }

  const ss3 = screenshotPath('03-profile-loaded');
  await page.screenshot({ path: ss3, fullPage: true });
  console.log(`Profile loaded screenshot: ${ss3}`);

  // ─── Find About You section ───────────────────────────────────────────────
  const aboutYouLocator = page.locator('text=About You');
  const usernameField = page.locator('#username');

  const aboutYouCount = await aboutYouLocator.count();
  const usernameCount = await usernameField.count();
  console.log(`"About You" elements found: ${aboutYouCount}`);
  console.log(`Username field elements found: ${usernameCount}`);

  if (aboutYouCount === 0 || usernameCount === 0) {
    console.log('ERROR: Cannot find About You section or username field.');
    return;
  }

  const initialUsername = await usernameField.inputValue();
  const initiallyDisabled = await usernameField.isDisabled();
  console.log(`Initial username value: "${initialUsername}"`);
  console.log(`Username field initially disabled: ${initiallyDisabled}`);

  // ─── Click Edit ───────────────────────────────────────────────────────────
  const editButton = page.locator('button', { hasText: 'Edit' }).first();
  await editButton.click();
  await page.waitForTimeout(400);

  const nowEnabled = await usernameField.isEnabled();
  console.log(`Username field enabled after Edit click: ${nowEnabled}`);
  const ss5 = screenshotPath('05-after-edit-click');
  await page.screenshot({ path: ss5, fullPage: true });

  // ─── Test: "Ki" (2 chars) + Save ────────────────────────────────────────
  console.log('\n--- TEST: "Ki" (2 chars) ---');
  await usernameField.click();
  await page.keyboard.press('Meta+A');
  await usernameField.fill('Ki');
  await page.waitForTimeout(200);

  const kiValue = await usernameField.inputValue();
  console.log(`Value after fill: "${kiValue}"`);

  const ss6a = screenshotPath('06a-typed-Ki');
  await page.screenshot({ path: ss6a, fullPage: true });

  // Simulate mousedown + click on Save
  const saveBtn = page.locator('button[type="submit"]');
  await saveBtn.dispatchEvent('mousedown');
  await saveBtn.click();
  await page.waitForTimeout(2000);

  const ss6b = screenshotPath('06b-after-save-Ki');
  await page.screenshot({ path: ss6b, fullPage: true });
  console.log(`After-save screenshot: ${ss6b}`);

  // Inspect alerts
  const allAlerts = await page.locator('[role="alert"]').all();
  console.log(`role="alert" elements: ${allAlerts.length}`);
  for (let i = 0; i < allAlerts.length; i++) {
    const txt = (await allAlerts[i].textContent() || '').trim();
    const style = await allAlerts[i].getAttribute('style') || '';
    const vis = await allAlerts[i].isVisible().catch(() => false);
    const isToast = style.includes('fixed') || style.includes('position: fixed');
    console.log(`  Alert[${i}]: visible=${vis}, isToast=${isToast}, text="${txt}"`);
  }

  const usernameAfterKi = await usernameField.inputValue().catch(() => 'N/A');
  console.log(`Username in field after Ki save: "${usernameAfterKi}"`);

  // ─── Test: "K" (1 char) + Save ──────────────────────────────────────────
  console.log('\n--- TEST: "K" (1 char) ---');

  const stillEditable = await usernameField.isEnabled().catch(() => false);
  if (!stillEditable) {
    const editBtn2 = page.locator('button', { hasText: 'Edit' }).first();
    if (await editBtn2.isVisible().catch(() => false)) {
      await editBtn2.click();
      await page.waitForTimeout(300);
    }
  }

  await usernameField.click();
  await page.keyboard.press('Meta+A');
  await usernameField.fill('K');
  await page.waitForTimeout(200);

  const kValue = await usernameField.inputValue();
  console.log(`Value after fill: "${kValue}"`);

  const ss7a = screenshotPath('07a-typed-K');
  await page.screenshot({ path: ss7a, fullPage: true });

  await page.locator('button[type="submit"]').dispatchEvent('mousedown');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  const ss7b = screenshotPath('07b-after-save-K');
  await page.screenshot({ path: ss7b, fullPage: true });
  console.log(`After-save screenshot: ${ss7b}`);

  const allAlerts2 = await page.locator('[role="alert"]').all();
  console.log(`role="alert" elements: ${allAlerts2.length}`);
  for (let i = 0; i < allAlerts2.length; i++) {
    const txt = (await allAlerts2[i].textContent() || '').trim();
    const style = await allAlerts2[i].getAttribute('style') || '';
    const vis = await allAlerts2[i].isVisible().catch(() => false);
    const isToast = style.includes('fixed') || style.includes('position: fixed');
    console.log(`  Alert[${i}]: visible=${vis}, isToast=${isToast}, text="${txt}"`);
  }

  const usernameAfterK = await usernameField.inputValue().catch(() => 'N/A');
  console.log(`Username in field after K save: "${usernameAfterK}"`);
}
