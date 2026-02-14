const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  let forgotStyles = null;
  let errorHelpTextStyles = null;

  try {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    console.log('✓ Navigated to login page');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // STEP 1: Measure "Forgot password?" link
    const forgotPasswordLink = await page.locator('a:has-text("Forgot password")').first();

    if (await forgotPasswordLink.count() > 0) {
      forgotStyles = await forgotPasswordLink.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontSizePx: parseFloat(computed.fontSize),
          fontSizeRem: (parseFloat(computed.fontSize) / 16).toFixed(6) + 'rem',
          color: computed.color,
          textContent: el.textContent.trim()
        };
      });

      console.log('\n========================================');
      console.log('  FORGOT PASSWORD LINK MEASUREMENT');
      console.log('========================================');
      console.log('Text:', forgotStyles.textContent);
      console.log('Font Size:', forgotStyles.fontSize);
      console.log('Font Size (rem):', forgotStyles.fontSizeRem);
      console.log('Expected: 15px (0.9375rem)');
      console.log('Status:', forgotStyles.fontSizePx === 15 ? '✓ CORRECT' : '✗ INCORRECT');

      // Highlight the element
      await forgotPasswordLink.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });

      await page.screenshot({ path: '/tmp/login_forgot_highlighted.png', fullPage: true });
      console.log('\n✓ Screenshot saved: /tmp/login_forgot_highlighted.png');
    }

    // STEP 2: Trigger error by submitting invalid credentials
    console.log('\n========================================');
    console.log('  TRIGGERING ERROR POPUP');
    console.log('========================================');

    await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    await page.locator('button[type="submit"]').first().click();

    // Wait for error popup to appear
    await page.waitForTimeout(2000);
    console.log('✓ Submitted invalid credentials');

    // STEP 3: Measure "Need help? Reset your password" text
    // First, find the link "Reset your password" and then get its parent or surrounding text
    const resetLink = await page.locator('a:has-text("Reset your password")').first();

    if (await resetLink.count() > 0) {
      // Get the parent element that contains "Need help? Reset your password"
      errorHelpTextStyles = await resetLink.evaluate((linkEl) => {
        // Find the parent that contains both "Need help?" and the link
        let parent = linkEl.parentElement;
        while (parent && !parent.textContent.includes('Need help')) {
          parent = parent.parentElement;
        }

        if (parent) {
          const computed = window.getComputedStyle(parent);
          return {
            fontSize: computed.fontSize,
            fontSizePx: parseFloat(computed.fontSize),
            fontSizeRem: (parseFloat(computed.fontSize) / 16).toFixed(6) + 'rem',
            color: computed.color,
            textContent: parent.textContent.trim(),
            tag: parent.tagName,
            className: parent.className
          };
        }
        return null;
      });

      if (errorHelpTextStyles) {
        console.log('\n========================================');
        console.log('  ERROR POPUP TEXT MEASUREMENT');
        console.log('========================================');
        console.log('Text:', errorHelpTextStyles.textContent);
        console.log('Tag:', errorHelpTextStyles.tag);
        console.log('Class:', errorHelpTextStyles.className);
        console.log('Font Size:', errorHelpTextStyles.fontSize);
        console.log('Font Size (rem):', errorHelpTextStyles.fontSizeRem);
        console.log('Expected: 15px (0.9375rem)');
        console.log('Status:', errorHelpTextStyles.fontSizePx === 15 ? '✓ CORRECT' : '✗ INCORRECT');

        // Highlight the error text
        await resetLink.evaluate((linkEl) => {
          let parent = linkEl.parentElement;
          while (parent && !parent.textContent.includes('Need help')) {
            parent = parent.parentElement;
          }
          if (parent) {
            parent.style.outline = '3px solid blue';
            parent.style.outlineOffset = '2px';
          }
        });

        await page.screenshot({ path: '/tmp/login_error_highlighted.png', fullPage: true });
        console.log('\n✓ Screenshot saved: /tmp/login_error_highlighted.png');
      }
    }

    // FINAL COMPARISON
    if (forgotStyles && errorHelpTextStyles) {
      console.log('\n');
      console.log('============================================');
      console.log('         FINAL COMPARISON RESULTS');
      console.log('============================================');
      console.log('');
      console.log('Forgot Password Link:');
      console.log('  - Font Size: ' + forgotStyles.fontSize);
      console.log('  - In rem:    ' + forgotStyles.fontSizeRem);
      console.log('  - Status:    ' + (forgotStyles.fontSizePx === 15 ? '✓ CORRECT (15px)' : '✗ INCORRECT (expected 15px)'));
      console.log('');
      console.log('Error Popup "Need help? Reset your password":');
      console.log('  - Font Size: ' + errorHelpTextStyles.fontSize);
      console.log('  - In rem:    ' + errorHelpTextStyles.fontSizeRem);
      console.log('  - Status:    ' + (errorHelpTextStyles.fontSizePx === 15 ? '✓ CORRECT (15px)' : '✗ INCORRECT (expected 15px)'));
      console.log('');
      console.log('--------------------------------------------');

      if (forgotStyles.fontSizePx === 15 && errorHelpTextStyles.fontSizePx === 15) {
        console.log('✓✓✓ SUCCESS!');
        console.log('Both elements have matching font sizes of 15px (0.9375rem)');
      } else {
        console.log('✗✗✗ FONT SIZE MISMATCH!');
        if (forgotStyles.fontSizePx !== 15) {
          console.log('  - Forgot Password link is ' + forgotStyles.fontSizePx + 'px (should be 15px)');
        }
        if (errorHelpTextStyles.fontSizePx !== 15) {
          console.log('  - Error popup text is ' + errorHelpTextStyles.fontSizePx + 'px (should be 15px)');
        }
      }
      console.log('============================================\n');
    } else {
      console.log('\n✗ Unable to complete comparison - one or both elements not found');
    }

  } catch (error) {
    console.error('\n✗ Error during test:', error.message);
    await page.screenshot({ path: '/tmp/login_error_state.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
