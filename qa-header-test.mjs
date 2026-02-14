import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';

async function testHeaderGoldLinks() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    testResults: [],
    screenshots: [],
    bugs: []
  };

  try {
    console.log('\n=== STARTING QA TEST: Header Gold Links ===\n');

    // Step 1: Navigate to homepage
    console.log('Step 1: Navigating to http://localhost:3001');
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);

    // Take baseline screenshot
    await page.screenshot({
      path: 'screenshots/qa-01-homepage.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: screenshots/qa-01-homepage.png');
    results.screenshots.push('screenshots/qa-01-homepage.png');

    // Step 2: Sign up with test account
    console.log('\nStep 2: Testing Sign Up Flow');
    const timestamp = Date.now();
    const testEmail = `test_qa_${timestamp}@example.com`;
    const testPassword = 'TestPass123!';

    // Check if we're on homepage, navigate to signup
    const signupLink = await page.locator('a[href="/signup"]').first();
    if (await signupLink.isVisible()) {
      console.log('- Clicking Sign Up link');
      await signupLink.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('- Navigating directly to /signup');
      await page.goto('http://localhost:3001/signup');
      await page.waitForTimeout(1000);
    }

    // Take screenshot of signup page
    await page.screenshot({
      path: 'screenshots/qa-02-signup-page.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: screenshots/qa-02-signup-page.png');
    results.screenshots.push('screenshots/qa-02-signup-page.png');

    // Fill signup form
    console.log('- Filling signup form with test data');
    console.log(`  Email: ${testEmail}`);
    console.log(`  Password: ${testPassword}`);

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    await page.screenshot({
      path: 'screenshots/qa-03-signup-filled.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: screenshots/qa-03-signup-filled.png');
    results.screenshots.push('screenshots/qa-03-signup-filled.png');

    // Submit signup
    console.log('- Submitting signup form');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Check for errors in console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Take screenshot after signup
    await page.screenshot({
      path: 'screenshots/qa-04-after-signup.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: screenshots/qa-04-after-signup.png');
    results.screenshots.push('screenshots/qa-04-after-signup.png');

    // Wait for navigation to profile or dashboard
    await page.waitForTimeout(2000);

    // Step 3: Navigate to profile page
    console.log('\nStep 3: Navigating to Profile Page');

    // Check current URL
    const currentUrl = page.url();
    console.log(`- Current URL: ${currentUrl}`);

    if (!currentUrl.includes('/profile')) {
      console.log('- Navigating to /profile');
      await page.goto('http://localhost:3001/profile');
      await page.waitForTimeout(2000);
    }

    // Take screenshot of profile page with header
    await page.screenshot({
      path: 'screenshots/qa-05-profile-with-header.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: screenshots/qa-05-profile-with-header.png');
    results.screenshots.push('screenshots/qa-05-profile-with-header.png');

    // Step 4: Verify Header Navigation Links are GOLD
    console.log('\nStep 4: Verifying Header Navigation Link Colors');

    // Check for header element
    const header = await page.locator('header').first();
    const headerExists = await header.count() > 0;

    if (!headerExists) {
      console.log('❌ CRITICAL: Header element not found!');
      results.bugs.push({
        severity: 'Critical',
        title: 'Header element missing on profile page',
        description: 'Expected to find <header> element but none exists'
      });
    } else {
      console.log('✓ Header element found');

      // Check navigation links
      const navLinks = [
        { href: '/profile', text: 'Profile' },
        { href: '/groups', text: 'Groups' },
        { href: '/create-group', text: 'Create Group' }
      ];

      for (const link of navLinks) {
        console.log(`\n- Checking "${link.text}" link (href="${link.href}")`);

        // Find the link
        const linkElement = await page.locator(`a[href="${link.href}"]`).first();
        const linkVisible = await linkElement.isVisible();

        if (!linkVisible) {
          console.log(`  ❌ Link not visible`);
          results.bugs.push({
            severity: 'High',
            title: `${link.text} navigation link not visible`,
            description: `Link with href="${link.href}" is not visible in header`
          });
          continue;
        }

        console.log(`  ✓ Link is visible`);

        // Get computed color
        const color = await linkElement.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.color;
        });

        console.log(`  Computed color: ${color}`);

        // Convert RGB to hex
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
          console.log(`  Hex color: ${hex}`);

          // Expected gold color #FBE6A6
          const expectedHex = '#FBE6A6';

          if (hex === expectedHex) {
            console.log(`  ✓ PASS: Color matches expected gold (${expectedHex})`);
            results.testResults.push({
              test: `${link.text} link color`,
              status: 'PASS',
              expected: expectedHex,
              actual: hex
            });
          } else {
            console.log(`  ❌ FAIL: Color does NOT match expected gold`);
            console.log(`     Expected: ${expectedHex}`);
            console.log(`     Actual: ${hex}`);
            results.testResults.push({
              test: `${link.text} link color`,
              status: 'FAIL',
              expected: expectedHex,
              actual: hex
            });
            results.bugs.push({
              severity: 'Medium',
              title: `${link.text} link is not gold color`,
              description: `Expected color ${expectedHex} but found ${hex}`,
              component: 'Header Navigation',
              expectedBehavior: `Link should be gold (#FBE6A6)`,
              actualBehavior: `Link is ${hex}`,
              reproducibility: 'Always'
            });
          }
        }
      }
    }

    // Step 5: Test hover effect
    console.log('\nStep 5: Testing Hover Effects on Navigation Links');

    const profileLink = await page.locator('a[href="/profile"]').first();

    // Get initial opacity
    const initialOpacity = await profileLink.evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });
    console.log(`- Initial opacity: ${initialOpacity}`);

    // Hover over link
    await profileLink.hover();
    await page.waitForTimeout(500);

    const hoverOpacity = await profileLink.evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });
    console.log(`- Hover opacity: ${hoverOpacity}`);

    if (parseFloat(hoverOpacity) < parseFloat(initialOpacity)) {
      console.log('✓ PASS: Hover effect working (opacity decreased)');
      results.testResults.push({
        test: 'Hover opacity effect',
        status: 'PASS',
        expected: 'Opacity should decrease on hover',
        actual: `Opacity changed from ${initialOpacity} to ${hoverOpacity}`
      });
    } else {
      console.log('❌ FAIL: Hover effect not working properly');
      results.testResults.push({
        test: 'Hover opacity effect',
        status: 'FAIL',
        expected: 'Opacity should decrease on hover',
        actual: `Opacity stayed at ${hoverOpacity}`
      });
      results.bugs.push({
        severity: 'Low',
        title: 'Hover effect not working on navigation links',
        description: 'Opacity should decrease on hover but does not change',
        component: 'Header Navigation',
        reproducibility: 'Always'
      });
    }

    // Take screenshot with hover
    await page.screenshot({
      path: 'screenshots/qa-06-hover-effect.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: screenshots/qa-06-hover-effect.png');
    results.screenshots.push('screenshots/qa-06-hover-effect.png');

    // Step 6: Test that links work
    console.log('\nStep 6: Testing Link Navigation');

    // Test Groups link
    console.log('- Clicking Groups link');
    await page.click('a[href="/groups"]');
    await page.waitForTimeout(2000);

    let groupsUrl = page.url();
    console.log(`  Current URL: ${groupsUrl}`);

    if (groupsUrl.includes('/groups')) {
      console.log('  ✓ PASS: Groups link navigation works');
      results.testResults.push({
        test: 'Groups link navigation',
        status: 'PASS',
        expected: 'Should navigate to /groups',
        actual: `Navigated to ${groupsUrl}`
      });
    } else {
      console.log('  ❌ FAIL: Groups link did not navigate correctly');
      results.testResults.push({
        test: 'Groups link navigation',
        status: 'FAIL',
        expected: 'Should navigate to /groups',
        actual: `Stayed at ${groupsUrl}`
      });
    }

    await page.screenshot({
      path: 'screenshots/qa-07-groups-page.png',
      fullPage: true
    });
    console.log('  ✓ Screenshot saved: screenshots/qa-07-groups-page.png');
    results.screenshots.push('screenshots/qa-07-groups-page.png');

    // Test Create Group link
    console.log('- Clicking Create Group link');
    await page.click('a[href="/create-group"]');
    await page.waitForTimeout(2000);

    let createGroupUrl = page.url();
    console.log(`  Current URL: ${createGroupUrl}`);

    if (createGroupUrl.includes('/create-group')) {
      console.log('  ✓ PASS: Create Group link navigation works');
      results.testResults.push({
        test: 'Create Group link navigation',
        status: 'PASS',
        expected: 'Should navigate to /create-group',
        actual: `Navigated to ${createGroupUrl}`
      });
    } else {
      console.log('  ❌ FAIL: Create Group link did not navigate correctly');
      results.testResults.push({
        test: 'Create Group link navigation',
        status: 'FAIL',
        expected: 'Should navigate to /create-group',
        actual: `Stayed at ${createGroupUrl}`
      });
    }

    await page.screenshot({
      path: 'screenshots/qa-08-create-group-page.png',
      fullPage: true
    });
    console.log('  ✓ Screenshot saved: screenshots/qa-08-create-group-page.png');
    results.screenshots.push('screenshots/qa-08-create-group-page.png');

    // Test Profile link
    console.log('- Clicking Profile link');
    await page.click('a[href="/profile"]');
    await page.waitForTimeout(2000);

    let profileUrl = page.url();
    console.log(`  Current URL: ${profileUrl}`);

    if (profileUrl.includes('/profile')) {
      console.log('  ✓ PASS: Profile link navigation works');
      results.testResults.push({
        test: 'Profile link navigation',
        status: 'PASS',
        expected: 'Should navigate to /profile',
        actual: `Navigated to ${profileUrl}`
      });
    } else {
      console.log('  ❌ FAIL: Profile link did not navigate correctly');
      results.testResults.push({
        test: 'Profile link navigation',
        status: 'FAIL',
        expected: 'Should navigate to /profile',
        actual: `Stayed at ${profileUrl}`
      });
    }

    // Final header screenshot
    await page.screenshot({
      path: 'screenshots/qa-09-final-header.png',
      fullPage: true
    });
    console.log('  ✓ Screenshot saved: screenshots/qa-09-final-header.png');
    results.screenshots.push('screenshots/qa-09-final-header.png');

    // Summary
    console.log('\n=== TEST SUMMARY ===');
    const passCount = results.testResults.filter(r => r.status === 'PASS').length;
    const failCount = results.testResults.filter(r => r.status === 'FAIL').length;
    console.log(`Total Tests: ${results.testResults.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Bugs Found: ${results.bugs.length}`);
    console.log(`Screenshots: ${results.screenshots.length}`);

    // Save results to file
    writeFileSync('qa-header-test-results.json', JSON.stringify(results, null, 2));
    console.log('\n✓ Results saved to qa-header-test-results.json');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    results.bugs.push({
      severity: 'Critical',
      title: 'Test execution error',
      description: error.message,
      stack: error.stack
    });
  } finally {
    await browser.close();
    console.log('\n=== TEST COMPLETE ===\n');
  }

  return results;
}

testHeaderGoldLinks();
