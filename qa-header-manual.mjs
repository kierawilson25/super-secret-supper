import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';

async function testHeaderGoldLinks() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500  // Slow down actions for better visibility
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    testResults: [],
    screenshots: [],
    bugs: [],
    notes: []
  };

  try {
    console.log('\n=== QA TEST: Header Gold Links (Manual Auth) ===\n');
    console.log('This test will pause for manual login.');
    console.log('Please sign up or log in when the browser opens.\n');

    // Step 1: Navigate to homepage
    console.log('Step 1: Opening application homepage');
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'screenshots/qa-manual-01-homepage.png',
      fullPage: true
    });
    console.log('✓ Screenshot: screenshots/qa-manual-01-homepage.png');
    results.screenshots.push('screenshots/qa-manual-01-homepage.png');

    console.log('\n==========================================================');
    console.log('MANUAL ACTION REQUIRED:');
    console.log('1. Please sign up or log in to the application');
    console.log('2. Navigate to your Profile page');
    console.log('3. The test will automatically continue in 60 seconds');
    console.log('   OR press Enter in this terminal when ready');
    console.log('==========================================================\n');

    // Wait 60 seconds for manual login
    await page.waitForTimeout(60000);

    console.log('\nContinuing with automated tests...\n');

    // Step 2: Check if user is logged in
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    await page.screenshot({
      path: 'screenshots/qa-manual-02-current-page.png',
      fullPage: true
    });
    console.log('✓ Screenshot: screenshots/qa-manual-02-current-page.png');
    results.screenshots.push('screenshots/qa-manual-02-current-page.png');

    // Navigate to profile if not already there
    if (!currentUrl.includes('/profile') && !currentUrl.includes('/groups') && !currentUrl.includes('/create-group')) {
      console.log('Navigating to /profile...');
      await page.goto('http://localhost:3001/profile', { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    // Step 3: Verify Header Exists
    console.log('\n=== STEP 1: Verify Header Exists ===');
    const headerCount = await page.locator('header').count();

    if (headerCount === 0) {
      console.log('❌ FAIL: No header element found');
      results.bugs.push({
        severity: 'Critical',
        title: 'Header element missing',
        description: 'No <header> element found on authenticated page',
        component: 'Header',
        reproducibility: 'Always'
      });
      results.notes.push('Test cannot continue - header not found. User may not be logged in.');

      await page.screenshot({
        path: 'screenshots/qa-manual-03-no-header.png',
        fullPage: true
      });
      console.log('✓ Screenshot: screenshots/qa-manual-03-no-header.png');
      results.screenshots.push('screenshots/qa-manual-03-no-header.png');

      return results;
    }

    console.log('✓ PASS: Header element found');

    // Take full page screenshot
    await page.screenshot({
      path: 'screenshots/qa-manual-03-page-with-header.png',
      fullPage: true
    });
    console.log('✓ Screenshot: screenshots/qa-manual-03-page-with-header.png');
    results.screenshots.push('screenshots/qa-manual-03-page-with-header.png');

    // Take header close-up
    const headerElement = page.locator('header').first();
    await headerElement.screenshot({
      path: 'screenshots/qa-manual-04-header-closeup.png'
    });
    console.log('✓ Screenshot: screenshots/qa-manual-04-header-closeup.png');
    results.screenshots.push('screenshots/qa-manual-04-header-closeup.png');

    // Step 4: Check Navigation Links
    console.log('\n=== STEP 2: Verify Navigation Links ===');

    const navLinks = [
      { href: '/profile', text: 'Profile' },
      { href: '/groups', text: 'Groups' },
      { href: '/create-group', text: 'Create Group' }
    ];

    for (const link of navLinks) {
      console.log(`\nChecking "${link.text}" link...`);

      const linkElement = page.locator(`header a[href="${link.href}"]`).first();
      const linkCount = await linkElement.count();

      if (linkCount === 0) {
        console.log(`  ❌ FAIL: Link not found`);
        results.testResults.push({
          test: `${link.text} link exists`,
          status: 'FAIL',
          expected: 'Link should exist in header',
          actual: 'Link not found'
        });
        results.bugs.push({
          severity: 'High',
          title: `${link.text} navigation link missing`,
          description: `Link with href="${link.href}" not found in header`,
          component: 'Header Navigation'
        });
        continue;
      }

      const isVisible = await linkElement.isVisible();
      if (!isVisible) {
        console.log(`  ⚠️  WARNING: Link exists but not visible`);
        results.testResults.push({
          test: `${link.text} link visible`,
          status: 'FAIL',
          expected: 'Link should be visible',
          actual: 'Link hidden'
        });
        results.bugs.push({
          severity: 'Medium',
          title: `${link.text} link not visible`,
          description: `Link exists in DOM but is not visible`,
          component: 'Header Navigation'
        });
        continue;
      }

      console.log(`  ✓ Link exists and is visible`);

      // Get computed color
      const color = await linkElement.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      console.log(`  Computed RGB: ${color}`);

      // Convert RGB to hex
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();

        const expectedHex = '#FBE6A6';  // Gold color
        console.log(`  Hex color: ${hex}`);
        console.log(`  Expected: ${expectedHex}`);

        if (hex === expectedHex) {
          console.log(`  ✓ PASS: Color is GOLD (${expectedHex})`);
          results.testResults.push({
            test: `${link.text} link color`,
            status: 'PASS',
            expected: expectedHex,
            actual: hex
          });
        } else {
          console.log(`  ❌ FAIL: Color is NOT gold`);
          console.log(`     Expected: ${expectedHex}`);
          console.log(`     Actual: ${hex}`);

          // Check if it's purple (#9333EA or similar)
          const isPurple = (r < 200 && b > 200) || hex.includes('9333') || hex.includes('93');
          if (isPurple) {
            console.log(`     ⚠️  This appears to be PURPLE, not gold!`);
          }

          results.testResults.push({
            test: `${link.text} link color`,
            status: 'FAIL',
            expected: expectedHex,
            actual: hex
          });
          results.bugs.push({
            severity: 'Medium',
            title: `${link.text} link color is not gold`,
            description: `Expected ${expectedHex} (gold) but found ${hex}`,
            component: 'Header Navigation',
            expectedBehavior: 'Link should be gold (#FBE6A6)',
            actualBehavior: `Link is ${hex}`,
            reproducibility: 'Always'
          });
        }
      }
    }

    // Step 5: Test Hover Effect
    console.log('\n=== STEP 3: Test Hover Effect ===');

    const profileLink = page.locator('header a[href="/profile"]').first();
    const profileLinkExists = await profileLink.count() > 0;

    if (profileLinkExists) {
      // Get initial state
      const initialOpacity = await profileLink.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      console.log(`Initial opacity: ${initialOpacity}`);

      // Hover
      await profileLink.hover();
      await page.waitForTimeout(300);

      const hoverOpacity = await profileLink.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      console.log(`Hover opacity: ${hoverOpacity}`);

      // Take screenshot during hover
      await page.screenshot({
        path: 'screenshots/qa-manual-05-hover-state.png',
        fullPage: true
      });
      console.log('✓ Screenshot: screenshots/qa-manual-05-hover-state.png');
      results.screenshots.push('screenshots/qa-manual-05-hover-state.png');

      const expectedHoverOpacity = '0.8';

      if (hoverOpacity === expectedHoverOpacity) {
        console.log(`✓ PASS: Hover opacity correct (${expectedHoverOpacity})`);
        results.testResults.push({
          test: 'Hover opacity effect',
          status: 'PASS',
          expected: expectedHoverOpacity,
          actual: hoverOpacity
        });
      } else if (parseFloat(hoverOpacity) < parseFloat(initialOpacity)) {
        console.log(`✓ PASS: Hover effect working (opacity decreased)`);
        results.testResults.push({
          test: 'Hover opacity effect',
          status: 'PASS',
          expected: 'Opacity should decrease',
          actual: `Changed from ${initialOpacity} to ${hoverOpacity}`
        });
      } else {
        console.log(`❌ FAIL: Hover effect not working`);
        results.testResults.push({
          test: 'Hover opacity effect',
          status: 'FAIL',
          expected: expectedHoverOpacity,
          actual: hoverOpacity
        });
        results.bugs.push({
          severity: 'Low',
          title: 'Hover effect not working properly',
          description: `Expected opacity ${expectedHoverOpacity} on hover, got ${hoverOpacity}`,
          component: 'Header Navigation'
        });
      }

      // Move mouse away
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    }

    // Step 6: Test Link Navigation
    console.log('\n=== STEP 4: Test Link Navigation ===');

    // Test Groups link
    console.log('\nTesting Groups link navigation...');
    await page.click('header a[href="/groups"]');
    await page.waitForTimeout(2000);

    let url = page.url();
    if (url.includes('/groups')) {
      console.log(`✓ PASS: Navigated to ${url}`);
      results.testResults.push({
        test: 'Groups link navigation',
        status: 'PASS',
        expected: '/groups',
        actual: url
      });
    } else {
      console.log(`❌ FAIL: Did not navigate to /groups`);
      results.testResults.push({
        test: 'Groups link navigation',
        status: 'FAIL',
        expected: '/groups',
        actual: url
      });
    }

    await page.screenshot({
      path: 'screenshots/qa-manual-06-groups-page.png',
      fullPage: true
    });
    console.log('✓ Screenshot: screenshots/qa-manual-06-groups-page.png');
    results.screenshots.push('screenshots/qa-manual-06-groups-page.png');

    // Test Create Group link
    console.log('\nTesting Create Group link navigation...');
    await page.click('header a[href="/create-group"]');
    await page.waitForTimeout(2000);

    url = page.url();
    if (url.includes('/create-group')) {
      console.log(`✓ PASS: Navigated to ${url}`);
      results.testResults.push({
        test: 'Create Group link navigation',
        status: 'PASS',
        expected: '/create-group',
        actual: url
      });
    } else {
      console.log(`❌ FAIL: Did not navigate to /create-group`);
      results.testResults.push({
        test: 'Create Group link navigation',
        status: 'FAIL',
        expected: '/create-group',
        actual: url
      });
    }

    await page.screenshot({
      path: 'screenshots/qa-manual-07-create-group-page.png',
      fullPage: true
    });
    console.log('✓ Screenshot: screenshots/qa-manual-07-create-group-page.png');
    results.screenshots.push('screenshots/qa-manual-07-create-group-page.png');

    // Test Profile link
    console.log('\nTesting Profile link navigation...');
    await page.click('header a[href="/profile"]');
    await page.waitForTimeout(2000);

    url = page.url();
    if (url.includes('/profile')) {
      console.log(`✓ PASS: Navigated to ${url}`);
      results.testResults.push({
        test: 'Profile link navigation',
        status: 'PASS',
        expected: '/profile',
        actual: url
      });
    } else {
      console.log(`❌ FAIL: Did not navigate to /profile`);
      results.testResults.push({
        test: 'Profile link navigation',
        status: 'FAIL',
        expected: '/profile',
        actual: url
      });
    }

    await page.screenshot({
      path: 'screenshots/qa-manual-08-profile-page-final.png',
      fullPage: true
    });
    console.log('✓ Screenshot: screenshots/qa-manual-08-profile-page-final.png');
    results.screenshots.push('screenshots/qa-manual-08-profile-page-final.png');

    // Final Results
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));

    const passCount = results.testResults.filter(r => r.status === 'PASS').length;
    const failCount = results.testResults.filter(r => r.status === 'FAIL').length;

    console.log(`Total Tests: ${results.testResults.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Bugs Found: ${results.bugs.length}`);
    console.log(`Screenshots: ${results.screenshots.length}`);

    if (results.bugs.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('BUGS FOUND');
      console.log('='.repeat(60));
      results.bugs.forEach((bug, index) => {
        console.log(`\n${index + 1}. [${bug.severity}] ${bug.title}`);
        console.log(`   ${bug.description}`);
        if (bug.expectedBehavior) {
          console.log(`   Expected: ${bug.expectedBehavior}`);
          console.log(`   Actual: ${bug.actualBehavior}`);
        }
      });
    }

    // Save results
    writeFileSync('qa-header-test-results.json', JSON.stringify(results, null, 2));
    console.log('\n✓ Results saved to qa-header-test-results.json');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await page.screenshot({
      path: 'screenshots/qa-manual-error.png',
      fullPage: true
    });
    results.bugs.push({
      severity: 'Critical',
      title: 'Test execution error',
      description: error.message
    });
    writeFileSync('qa-header-test-results.json', JSON.stringify(results, null, 2));
  } finally {
    console.log('\nKeeping browser open for 10 seconds for review...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('\n=== TEST COMPLETE ===\n');
  }

  return results;
}

testHeaderGoldLinks();
