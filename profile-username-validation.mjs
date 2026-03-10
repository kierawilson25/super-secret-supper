// Playwright test: profile page username validation
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/tmp/screenshots';
const BASE_URL = 'http://localhost:3000';

function screenshotPath(name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(SCREENSHOTS_DIR, `${timestamp}-${name}.png`);
}

async function run() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[console error] ${msg.text()}`);
    }
  });

  // ─── Step 1: Navigate to /profile ─────────────────────────────────────────
  console.log('\n=== STEP 1: Navigate to /profile ===');
  let profileResponse;
  try {
    profileResponse = await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    profileResponse = null;
    console.log(`  Navigation error: ${e.message}`);
  }
  await page.waitForTimeout(2000);

  const afterProfileUrl = page.url();
  const afterProfileTitle = await page.title();
  const ss1 = screenshotPath('01-initial-navigation');
  await page.screenshot({ path: ss1, fullPage: true });

  console.log(`  URL after navigation: ${afterProfileUrl}`);
  console.log(`  Page title: ${afterProfileTitle}`);
  console.log(`  HTTP status: ${profileResponse ? profileResponse.status() : 'N/A'}`);
  console.log(`  Screenshot saved: ${ss1}`);

  const wasRedirected = afterProfileUrl.includes('/login');

  if (wasRedirected) {
    console.log('\n  RESULT: Redirected to /login (authentication guard is working)');
    console.log(`  Redirect URL: ${afterProfileUrl}`);

    // ─── Step 2: Inspect /login page ──────────────────────────────────────
    console.log('\n=== STEP 2: Inspect /login page content ===');
    await page.waitForTimeout(500);
    const ss2 = screenshotPath('02-login-page');
    await page.screenshot({ path: ss2, fullPage: true });
    console.log(`  Login page URL: ${page.url()}`);
    console.log(`  Screenshot saved: ${ss2}`);

    const loginPageText = await page.evaluate(() => document.body.innerText.substring(0, 800));
    console.log(`  Login page text preview:\n${loginPageText}`);

    const inputs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input')).map(el => ({
        type: el.type, name: el.name, placeholder: el.placeholder, id: el.id,
      }))
    );
    const buttons = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).map(el => ({
        text: el.textContent?.trim(), type: el.type,
      }))
    );
    console.log('  Inputs found:', JSON.stringify(inputs));
    console.log('  Buttons found:', JSON.stringify(buttons));

    // Check returnTo param in URL
    const hasReturnTo = afterProfileUrl.includes('returnTo');
    console.log(`  returnTo param in redirect URL: ${hasReturnTo}`);
    console.log(`  returnTo value: ${afterProfileUrl.includes('returnTo=/profile') ? '/profile' : 'not /profile or missing'}`);

    await browser.close();

    console.log('\n=== FINAL SUMMARY ===');
    console.log('Redirect test: PASS');
    console.log(`  /profile redirected to: ${afterProfileUrl}`);
    console.log(`  returnTo param present: ${hasReturnTo}`);
    console.log(`  Screenshots: ${ss1}, ${ss2}`);
    console.log(`  Console errors: ${consoleErrors.length}`);
    return;
  }

  // ─── Profile page loaded (session cached) ─────────────────────────────────
  console.log('\n  RESULT: Profile page loaded (session cached or no auth required)');

  await page.waitForTimeout(3000);
  if (page.url().includes('/login')) {
    console.log('  Delayed redirect detected to /login. Auth guard working.');
    const ss_delay = screenshotPath('02-delayed-redirect');
    await page.screenshot({ path: ss_delay, fullPage: true });
    await browser.close();
    return;
  }

  const ss3 = screenshotPath('03-profile-page-loaded');
  await page.screenshot({ path: ss3, fullPage: true });
  console.log(`  Screenshot: ${ss3}`);

  // ─── Step 4: Find "About You" section ─────────────────────────────────────
  console.log('\n=== STEP 4: Locate "About You" section ===');
  const pagePreview = await page.evaluate(() => document.body.innerText.substring(0, 600));
  console.log(`  Page content preview:\n${pagePreview}`);

  const aboutYouVisible = await page.locator('text=About You').isVisible().catch(() => false);
  const usernameFieldExists = await page.locator('#username').count();
  console.log(`  "About You" visible: ${aboutYouVisible}`);
  console.log(`  Username field count: ${usernameFieldExists}`);

  if (!aboutYouVisible || usernameFieldExists === 0) {
    console.log('  Cannot find profile form elements. Stopping.');
    await browser.close();
    return;
  }

  // Get initial username value
  const initialUsername = await page.locator('#username').inputValue().catch(() => '');
  console.log(`  Initial username value: "${initialUsername}"`);

  // Confirm field is locked (disabled) initially
  const initiallyDisabled = await page.locator('#username').isDisabled().catch(() => false);
  console.log(`  Username field initially disabled: ${initiallyDisabled}`);

  // ─── Step 5: Click Edit ────────────────────────────────────────────────────
  console.log('\n=== STEP 5: Click "Edit" button ===');
  const editButton = page.locator('button', { hasText: 'Edit' }).first();
  await editButton.click();
  await page.waitForTimeout(400);

  const nowEnabled = await page.locator('#username').isEnabled().catch(() => false);
  console.log(`  Username field enabled after Edit click: ${nowEnabled}`);
  const ss5 = screenshotPath('05-after-edit-click');
  await page.screenshot({ path: ss5, fullPage: true });
  console.log(`  Screenshot: ${ss5}`);

  // ─── Step 6: Type "Ki" and click Save Profile ─────────────────────────────
  console.log('\n=== STEP 6: Type "Ki" (2 chars) then Save Profile (no Done) ===');

  await page.locator('#username').click();
  await page.keyboard.press('Meta+A');
  await page.keyboard.press('Control+A');
  await page.locator('#username').fill('Ki');
  await page.waitForTimeout(200);

  const kiValue = await page.locator('#username').inputValue();
  console.log(`  Value in username field: "${kiValue}"`);

  const ss6a = screenshotPath('06a-typed-Ki');
  await page.screenshot({ path: ss6a, fullPage: true });
  console.log(`  Screenshot before save: ${ss6a}`);

  // Mousedown first (simulates what real click does — sets saveClickedRef)
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.dispatchEvent('mousedown');
  await submitBtn.click();
  await page.waitForTimeout(2000);

  const ss6b = screenshotPath('06b-after-save-Ki');
  await page.screenshot({ path: ss6b, fullPage: true });
  console.log(`  Screenshot after save attempt: ${ss6b}`);

  // Inspect all role="alert" elements
  const alerts6 = await page.locator('[role="alert"]').all();
  console.log(`  role="alert" elements found: ${alerts6.length}`);
  for (let i = 0; i < alerts6.length; i++) {
    const alertText = (await alerts6[i].textContent() || '').trim();
    const alertStyle = await alerts6[i].getAttribute('style') || '';
    const isFixed = alertStyle.includes('fixed');
    const isVisible = await alerts6[i].isVisible().catch(() => false);
    console.log(`    Alert[${i}]: visible=${isVisible}, fixed=${isFixed}, text="${alertText}"`);
  }

  const usernameAfterKi = await page.locator('#username').inputValue().catch(() => 'N/A');
  console.log(`  Username value after save attempt: "${usernameAfterKi}"`);

  // Check if any toast appeared (fixed position)
  const toastText6 = await page.evaluate(() => {
    const alerts = document.querySelectorAll('[role="alert"]');
    const results = [];
    for (const el of alerts) {
      const style = window.getComputedStyle(el);
      results.push({
        text: el.textContent?.trim(),
        position: style.position,
        bottom: style.bottom,
      });
    }
    return results;
  });
  console.log('  All alerts with computed style:', JSON.stringify(toastText6));

  // ─── Step 7: Test "K" (1 character) ───────────────────────────────────────
  console.log('\n=== STEP 7: Type "K" (1 char) then Save Profile ===');

  // Check if we still have edit mode active
  const stillEditable = await page.locator('#username').isEnabled().catch(() => false);
  console.log(`  Username field still editable: ${stillEditable}`);

  if (!stillEditable) {
    // Re-click Edit
    const editBtn2 = page.locator('button', { hasText: 'Edit' }).first();
    const editBtn2Visible = await editBtn2.isVisible().catch(() => false);
    if (editBtn2Visible) {
      await editBtn2.click();
      await page.waitForTimeout(300);
      console.log('  Clicked Edit again to re-enable field.');
    }
  }

  await page.locator('#username').click();
  await page.keyboard.press('Meta+A');
  await page.keyboard.press('Control+A');
  await page.locator('#username').fill('K');
  await page.waitForTimeout(200);

  const kValue = await page.locator('#username').inputValue();
  console.log(`  Value in username field: "${kValue}"`);

  const ss7a = screenshotPath('07a-typed-K');
  await page.screenshot({ path: ss7a, fullPage: true });
  console.log(`  Screenshot before save: ${ss7a}`);

  await page.locator('button[type="submit"]').dispatchEvent('mousedown');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  const ss7b = screenshotPath('07b-after-save-K');
  await page.screenshot({ path: ss7b, fullPage: true });
  console.log(`  Screenshot after save attempt: ${ss7b}`);

  const alerts7 = await page.locator('[role="alert"]').all();
  console.log(`  role="alert" elements found: ${alerts7.length}`);
  for (let i = 0; i < alerts7.length; i++) {
    const alertText = (await alerts7[i].textContent() || '').trim();
    const alertStyle = await alerts7[i].getAttribute('style') || '';
    const isVisible = await alerts7[i].isVisible().catch(() => false);
    const isFixed = alertStyle.includes('fixed');
    console.log(`    Alert[${i}]: visible=${isVisible}, fixed=${isFixed}, text="${alertText}"`);
  }

  const usernameAfterK = await page.locator('#username').inputValue().catch(() => 'N/A');
  console.log(`  Username value after K save attempt: "${usernameAfterK}"`);

  // ─── Console errors ────────────────────────────────────────────────────────
  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length === 0) {
    console.log('  None detected.');
  } else {
    consoleErrors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }

  await browser.close();
  console.log('\n=== TEST COMPLETE ===');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
