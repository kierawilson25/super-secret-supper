const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    console.log('✓ Navigated to login page');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: '/tmp/login_initial.png', fullPage: true });
    console.log('✓ Initial screenshot saved');

    // Find the "Forgot password?" link
    const forgotPasswordSelector = 'a:has-text("Forgot password")';
    const forgotPassword = await page.locator(forgotPasswordSelector).first();

    if (await forgotPassword.count() > 0) {
      const forgotStyles = await forgotPassword.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontSizePx: parseFloat(computed.fontSize),
          fontSizeRem: (parseFloat(computed.fontSize) / 16).toFixed(6) + 'rem',
          color: computed.color,
          textContent: el.textContent.trim()
        };
      });

      console.log('\n--- Forgot Password Link ---');
      console.log('Text:', forgotStyles.textContent);
      console.log('Font Size:', forgotStyles.fontSize);
      console.log('Font Size (rem):', forgotStyles.fontSizeRem);
      console.log('Expected: 15px (0.9375rem)');
      console.log('Match:', forgotStyles.fontSizePx === 15 ? '✓ YES' : '✗ NO');

      // Highlight the element
      await forgotPassword.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });

      await page.screenshot({ path: '/tmp/login_forgot_highlighted.png', fullPage: true });
      console.log('✓ Forgot password link highlighted and saved');
    } else {
      console.log('✗ Could not find "Forgot password?" link');
    }

    // Trigger error by submitting empty form
    console.log('\n--- Triggering Error Popup ---');
    const submitButton = await page.locator('button[type="submit"]').first();
    await submitButton.click();
    await page.waitForTimeout(1500);
    console.log('✓ Submitted empty form');

    // Take screenshot with error
    await page.screenshot({ path: '/tmp/login_with_error.png', fullPage: true });
    console.log('✓ Error popup screenshot saved');

    // Try multiple selectors to find the error message
    const errorSelectors = [
      'text="Need help? Reset your password"',
      ':has-text("Need help")',
      ':has-text("Reset your password")',
      '[role="alert"]',
      '.error',
      '.alert'
    ];

    let errorStyles = null;
    for (const selector of errorSelectors) {
      const locator = page.locator(selector).first();
      if (await locator.count() > 0) {
        errorStyles = await locator.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            fontSize: computed.fontSize,
            fontSizePx: parseFloat(computed.fontSize),
            fontSizeRem: (parseFloat(computed.fontSize) / 16).toFixed(6) + 'rem',
            color: computed.color,
            textContent: el.textContent.trim(),
            selector: el.outerHTML.substring(0, 100)
          };
        });
        console.log('\n--- Error Popup Text ---');
        console.log('Found with selector:', selector);
        console.log('Text:', errorStyles.textContent);
        console.log('Font Size:', errorStyles.fontSize);
        console.log('Font Size (rem):', errorStyles.fontSizeRem);
        console.log('Expected: 15px (0.9375rem)');
        console.log('Match:', errorStyles.fontSizePx === 15 ? '✓ YES' : '✗ NO');
        break;
      }
    }

    if (!errorStyles) {
      console.log('✗ Could not find error popup text');
      // Log all visible text for debugging
      const allText = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('*'))
          .filter(el => el.textContent.includes('help') || el.textContent.includes('Reset'))
          .map(el => ({
            text: el.textContent.trim(),
            tag: el.tagName,
            classes: el.className
          }));
      });
      console.log('Elements with "help" or "Reset":', allText);
    }

    // Final comparison
    if (forgotStyles && errorStyles) {
      console.log('\n--- FINAL COMPARISON ---');
      console.log('Forgot Password Link: ' + forgotStyles.fontSize + ' (' + forgotStyles.fontSizeRem + ')');
      console.log('Error Popup Text:      ' + errorStyles.fontSize + ' (' + errorStyles.fontSizeRem + ')');

      if (forgotStyles.fontSizePx === 15 && errorStyles.fontSizePx === 15) {
        console.log('\n✓✓✓ SUCCESS! Both are exactly 15px (0.9375rem)');
      } else {
        console.log('\n✗✗✗ MISMATCH! Font sizes do not match 15px');
      }
    }

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: '/tmp/login_error_state.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
