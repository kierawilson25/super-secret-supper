const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  let forgotStyles = null;
  let errorStyles = null;

  try {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    console.log('✓ Navigated to login page');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: '/tmp/login_initial.png', fullPage: true });
    console.log('✓ Initial screenshot saved to /tmp/login_initial.png');

    // Find the "Forgot password?" link
    const forgotPasswordSelector = 'a:has-text("Forgot password")';
    const forgotPassword = await page.locator(forgotPasswordSelector).first();

    if (await forgotPassword.count() > 0) {
      forgotStyles = await forgotPassword.evaluate((el) => {
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
      console.log('✓ Forgot password link highlighted and saved to /tmp/login_forgot_highlighted.png');
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
    console.log('✓ Error popup screenshot saved to /tmp/login_with_error.png');

    // Look for the specific "Need help? Reset your password" text
    errorStyles = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');

      for (let el of allElements) {
        const text = el.textContent.trim();
        if (text.includes('Need help') && text.includes('Reset your password')) {
          const computed = window.getComputedStyle(el);
          return {
            fontSize: computed.fontSize,
            fontSizePx: parseFloat(computed.fontSize),
            fontSizeRem: (parseFloat(computed.fontSize) / 16).toFixed(6) + 'rem',
            color: computed.color,
            textContent: text,
            tag: el.tagName,
            className: el.className
          };
        }
      }

      return null;
    });

    if (errorStyles) {
      console.log('\n--- Error Popup Text (Need help? Reset your password) ---');
      console.log('Text:', errorStyles.textContent);
      console.log('Tag:', errorStyles.tag);
      console.log('Class:', errorStyles.className);
      console.log('Font Size:', errorStyles.fontSize);
      console.log('Font Size (rem):', errorStyles.fontSizeRem);
      console.log('Expected: 15px (0.9375rem)');
      console.log('Match:', errorStyles.fontSizePx === 15 ? '✓ YES' : '✗ NO');

      // Highlight this element too
      await page.evaluate((className) => {
        const elements = document.querySelectorAll('*');
        for (let el of elements) {
          const text = el.textContent.trim();
          if (text.includes('Need help') && text.includes('Reset your password')) {
            el.style.outline = '3px solid blue';
            el.style.outlineOffset = '2px';
            break;
          }
        }
      }, errorStyles.className);

      await page.screenshot({ path: '/tmp/login_error_highlighted.png', fullPage: true });
      console.log('✓ Error text highlighted and saved to /tmp/login_error_highlighted.png');
    } else {
      console.log('✗ Could not find "Need help? Reset your password" text');
    }

    // Final comparison
    if (forgotStyles && errorStyles) {
      console.log('\n===========================================');
      console.log('         FINAL COMPARISON REPORT');
      console.log('===========================================');
      console.log('Forgot Password Link: ' + forgotStyles.fontSize + ' (' + forgotStyles.fontSizeRem + ')');
      console.log('Error Popup Text:     ' + errorStyles.fontSize + ' (' + errorStyles.fontSizeRem + ')');
      console.log('-------------------------------------------');

      if (forgotStyles.fontSizePx === 15 && errorStyles.fontSizePx === 15) {
        console.log('✓✓✓ SUCCESS! Both are exactly 15px (0.9375rem)');
      } else {
        console.log('✗✗✗ MISMATCH DETECTED!');
        console.log('   - Forgot Password: ' + forgotStyles.fontSizePx + 'px ' + (forgotStyles.fontSizePx === 15 ? '✓' : '✗'));
        console.log('   - Error Popup:     ' + errorStyles.fontSizePx + 'px ' + (errorStyles.fontSizePx === 15 ? '✓' : '✗'));
      }
      console.log('===========================================\n');
    }

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: '/tmp/login_error_state.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\nTest complete. Screenshots saved to /tmp/');
  }
})();
