const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Take initial screenshot
    await page.screenshot({
      path: '/tmp/login-before-error.png',
      fullPage: true
    });
    console.log('✓ Initial screenshot saved: /tmp/login-before-error.png');

    // Fill in invalid credentials
    console.log('\nFilling form with invalid credentials...');
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword123');

    // Submit the form
    console.log('Submitting form...');
    await page.click('button[type="submit"]');

    // Wait for error message to appear
    await page.waitForSelector('.border-red-400', { timeout: 10000 });
    console.log('✓ Error message appeared');

    // Wait a bit for animations
    await page.waitForTimeout(500);

    // Take screenshot with error
    await page.screenshot({
      path: '/tmp/login-with-error.png',
      fullPage: true
    });
    console.log('✓ Screenshot with error saved: /tmp/login-with-error.png');

    // Analyze the spacing
    console.log('\n=== Analyzing Spacing ===');

    const spacingInfo = await page.evaluate(() => {
      // Find the error message paragraph
      const errorParagraph = document.querySelector('.border-red-400 .text-red-100');

      // Find the "Need help?" paragraph
      const helpParagraph = document.querySelector('.border-red-400 .text-\\[\\#F8F4F0\\]');

      if (!errorParagraph || !helpParagraph) {
        return { error: 'Could not find required elements' };
      }

      // Get bounding rectangles
      const errorRect = errorParagraph.getBoundingClientRect();
      const helpRect = helpParagraph.getBoundingClientRect();

      // Calculate spacing
      const spacing = helpRect.top - errorRect.bottom;

      // Get computed styles
      const helpStyle = window.getComputedStyle(helpParagraph);
      const marginTop = helpStyle.marginTop;

      // Get inline style
      const inlineStyle = helpParagraph.getAttribute('style') || 'none';

      return {
        errorBottom: errorRect.bottom,
        helpTop: helpRect.top,
        spacing: spacing,
        computedMarginTop: marginTop,
        inlineStyle: inlineStyle,
        helpText: helpParagraph.textContent.substring(0, 50)
      };
    });

    if (spacingInfo.error) {
      console.log('✗ Error:', spacingInfo.error);
    } else {
      console.log(`Error message bottom: ${spacingInfo.errorBottom}px`);
      console.log(`Help text top: ${spacingInfo.helpTop}px`);
      console.log(`Calculated spacing: ${spacingInfo.spacing}px`);
      console.log(`Computed margin-top: ${spacingInfo.computedMarginTop}`);
      console.log(`Inline style attribute: ${spacingInfo.inlineStyle}`);
      console.log(`Help text content: "${spacingInfo.helpText}"`);

      // Verify the fix
      console.log('\n=== Verification Results ===');

      if (spacingInfo.inlineStyle.includes('marginTop') || spacingInfo.inlineStyle.includes('margin-top')) {
        console.log('✓ PASS: Inline marginTop style is present in HTML');
      } else {
        console.log('✗ FAIL: Inline marginTop style NOT found in HTML');
      }

      if (spacingInfo.inlineStyle.includes('0.25rem') || spacingInfo.computedMarginTop === '4px') {
        console.log('✓ PASS: marginTop value is 0.25rem (4px)');
      } else {
        console.log(`✗ WARNING: marginTop value is ${spacingInfo.computedMarginTop}, expected 4px`);
      }

      // Check actual spacing (allowing for small rendering differences)
      if (spacingInfo.spacing >= 3 && spacingInfo.spacing <= 6) {
        console.log(`✓ PASS: Visual spacing is approximately 4px (actual: ${spacingInfo.spacing.toFixed(2)}px)`);
      } else {
        console.log(`✗ FAIL: Visual spacing is ${spacingInfo.spacing.toFixed(2)}px, expected ~4px`);
      }
    }

    // Take a zoomed screenshot of just the error area
    const errorBox = await page.locator('.border-red-400').boundingBox();
    if (errorBox) {
      await page.screenshot({
        path: '/tmp/login-error-closeup.png',
        clip: {
          x: Math.max(0, errorBox.x - 20),
          y: Math.max(0, errorBox.y - 20),
          width: Math.min(errorBox.width + 40, page.viewportSize().width),
          height: errorBox.height + 40
        }
      });
      console.log('\n✓ Closeup screenshot saved: /tmp/login-error-closeup.png');
    }

  } catch (error) {
    console.error('\n✗ Error during test:', error.message);
    await page.screenshot({ path: '/tmp/login-error-state.png' });
    console.log('Error state screenshot saved: /tmp/login-error-state.png');
  } finally {
    await browser.close();
    console.log('\n✓ Browser closed');
  }
})();
