import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';

async function testHeaderGoldLinks() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
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

    // Step 2: Sign up with test account using valid email domain
    console.log('\nStep 2: Testing Sign Up Flow');
    const timestamp = Date.now();
    const testEmail = `testqa${timestamp}@gmail.com`; // Using gmail.com for better validation
    const testUsername = `testuser_${timestamp}`;
    const testPassword = 'TestPass123!';

    // Navigate to signup
    console.log('- Navigating to /signup');
    await page.goto('http://localhost:3001/signup');
    await page.waitForTimeout(1000);

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
    console.log(`  Username: ${testUsername}`);
    console.log(`  Password: ${testPassword}`);

    // Find all input fields
    const emailInput = await page.locator('input[type="email"]');
    const usernameInput = await page.locator('input[placeholder*="username" i], input[name*="username" i]');
    const passwordInputs = await page.locator('input[type="password"]');

    await emailInput.fill(testEmail);
    await usernameInput.fill(testUsername);

    // Fill both password fields
    await passwordInputs.nth(0).fill(testPassword);
    await passwordInputs.nth(1).fill(testPassword);

    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/qa-03-signup-filled.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: screenshots/qa-03-signup-filled.png');
    results.screenshots.push('screenshots/qa-03-signup-filled.png');

    // Submit signup
    console.log('- Submitting signup form');
    await page.click('button:has-text("Sign Up")');

    // Wait for navigation or error
    await page.waitForTimeout(5000);

    // Take screenshot after signup
    await page.screenshot({
      path: 'screenshots/qa-04-after-signup.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: screenshots/qa-04-after-signup.png');
    results.screenshots.push('screenshots/qa-04-after-signup.png');

    // Check current URL
    let currentUrl = page.url();
    console.log(`- Current URL after signup: ${currentUrl}`);

    // Step 3: Navigate to profile page
    console.log('\nStep 3: Ensuring we are on Profile Page');

    // Wait a bit more for auth to complete
    await page.waitForTimeout(2000);

    if (!currentUrl.includes('/profile')) {
      console.log('- Navigating to /profile');
      await page.goto('http://localhost:3001/profile', { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    currentUrl = page.url();
    console.log(`- Current URL: ${currentUrl}`);

    // Take screenshot of profile page with header
    await page.screenshot({
      path: 'screenshots/qa-05-profile-with-header.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: screenshots/qa-05-profile-with-header.png');
    results.screenshots.push('screenshots/qa-05-profile-with-header.png');

    // Step 4: Verify Header Navigation Links are GOLD
    console.log('\nStep 4: Verifying Header Navigation Link Colors');

    // Wait for header to be visible
    await page.waitForTimeout(2000);

    // Check for header element
    const headerCount = await page.locator('header').count();

    if (headerCount === 0) {
      console.log('❌ CRITICAL: Header element not found!');
      results.bugs.push({
        severity: 'Critical',
        title: 'Header element missing on profile page',
        description: 'Expected to find <header> element but none exists',
        component: 'Header',
        reproducibility: 'Always'
      });

      // Check if we're on login page (which means signup failed)
      if (currentUrl.includes('/login')) {
        console.log('⚠️  WARNING: Redirected to login page - signup failed');
        console.log('   This indicates the signup validation is blocking test email addresses');
        results.bugs.push({
          severity: 'High',
          title: 'Signup flow blocking test email addresses',
          description: 'Signup form rejects valid email formats, preventing automated testing',
          component: 'Authentication',
          recommendedFix: 'Allow test email domains in development/staging environments',
          reproducibility: 'Always'
        });
      }
    } else {
      console.log('✓ Header element found');

      // Check for navigation links in header
      const navLinkCount = await page.locator('header a').count();
      console.log(`- Found ${navLinkCount} links in header`);

      // Define expected links
      const navLinks = [
        { href: '/profile', text: 'Profile' },
        { href: '/groups', text: 'Groups' },
        { href: '/create-group', text: 'Create Group' }
      ];

      for (const link of navLinks) {
        console.log(`\n- Checking "${link.text}" link (href="${link.href}")`);

        // Find the link
        const linkElement = page.locator(`a[href="${link.href}"]`).first();
        const linkCount = await linkElement.count();

        if (linkCount === 0) {
          console.log(`  ❌ Link not found in DOM`);
          results.bugs.push({
            severity: 'High',
            title: `${link.text} navigation link not found`,
            description: `Link with href="${link.href}" does not exist in header`,
            component: 'Header Navigation',
            reproducibility: 'Always'
          });
          continue;
        }

        const linkVisible = await linkElement.isVisible();

        if (!linkVisible) {
          console.log(`  ⚠️  Link exists but is not visible`);
          results.bugs.push({
            severity: 'Medium',
            title: `${link.text} navigation link not visible`,
            description: `Link with href="${link.href}" is in DOM but not visible in header`,
            component: 'Header Navigation',
            reproducibility: 'Always'
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

      // Take a close-up screenshot of the header
      const headerElement = await page.locator('header').first();
      await headerElement.screenshot({
        path: 'screenshots/qa-06-header-closeup.png'
      });
      console.log('\n✓ Header close-up screenshot saved: screenshots/qa-06-header-closeup.png');
      results.screenshots.push('screenshots/qa-06-header-closeup.png');

      // Step 5: Test hover effect
      console.log('\nStep 5: Testing Hover Effects on Navigation Links');

      const profileLink = page.locator('a[href="/profile"]').first();
      const profileLinkExists = await profileLink.count() > 0;

      if (profileLinkExists) {
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

        // Expected hover opacity is 0.8 based on the code
        const expectedHoverOpacity = '0.8';

        if (hoverOpacity === expectedHoverOpacity) {
          console.log(`✓ PASS: Hover effect working correctly (opacity changed to ${expectedHoverOpacity})`);
          results.testResults.push({
            test: 'Hover opacity effect',
            status: 'PASS',
            expected: `Opacity should be ${expectedHoverOpacity} on hover`,
            actual: `Opacity is ${hoverOpacity}`
          });
        } else if (parseFloat(hoverOpacity) < parseFloat(initialOpacity)) {
          console.log(`✓ PASS: Hover effect working (opacity decreased from ${initialOpacity} to ${hoverOpacity})`);
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
            expected: `Opacity should be ${expectedHoverOpacity} on hover`,
            actual: `Opacity is ${hoverOpacity}`
          });
          results.bugs.push({
            severity: 'Low',
            title: 'Hover effect not working on navigation links',
            description: `Opacity should be ${expectedHoverOpacity} on hover but is ${hoverOpacity}`,
            component: 'Header Navigation',
            reproducibility: 'Always'
          });
        }

        // Take screenshot with hover
        await page.screenshot({
          path: 'screenshots/qa-07-hover-effect.png',
          fullPage: true
        });
        console.log('✓ Screenshot saved: screenshots/qa-07-hover-effect.png');
        results.screenshots.push('screenshots/qa-07-hover-effect.png');
      }

      // Step 6: Test that links work
      console.log('\nStep 6: Testing Link Navigation');

      // Test Groups link
      const groupsLinkExists = await page.locator('a[href="/groups"]').count() > 0;
      if (groupsLinkExists) {
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
            actual: `URL is ${groupsUrl}`
          });
        }

        await page.screenshot({
          path: 'screenshots/qa-08-groups-page.png',
          fullPage: true
        });
        console.log('  ✓ Screenshot saved: screenshots/qa-08-groups-page.png');
        results.screenshots.push('screenshots/qa-08-groups-page.png');
      }

      // Test Create Group link
      const createGroupLinkExists = await page.locator('a[href="/create-group"]').count() > 0;
      if (createGroupLinkExists) {
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
            actual: `URL is ${createGroupUrl}`
          });
        }

        await page.screenshot({
          path: 'screenshots/qa-09-create-group-page.png',
          fullPage: true
        });
        console.log('  ✓ Screenshot saved: screenshots/qa-09-create-group-page.png');
        results.screenshots.push('screenshots/qa-09-create-group-page.png');
      }

      // Test Profile link
      const profileLinkExistsForNav = await page.locator('a[href="/profile"]').count() > 0;
      if (profileLinkExistsForNav) {
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
            actual: `URL is ${profileUrl}`
          });
        }

        // Final header screenshot
        await page.screenshot({
          path: 'screenshots/qa-10-final-header.png',
          fullPage: true
        });
        console.log('  ✓ Screenshot saved: screenshots/qa-10-final-header.png');
        results.screenshots.push('screenshots/qa-10-final-header.png');
      }
    }

    // Summary
    console.log('\n=== TEST SUMMARY ===');
    const passCount = results.testResults.filter(r => r.status === 'PASS').length;
    const failCount = results.testResults.filter(r => r.status === 'FAIL').length;
    console.log(`Total Tests: ${results.testResults.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Bugs Found: ${results.bugs.length}`);
    console.log(`Screenshots: ${results.screenshots.length}`);

    if (results.bugs.length > 0) {
      console.log('\n=== BUGS FOUND ===');
      results.bugs.forEach((bug, index) => {
        console.log(`\n${index + 1}. [${bug.severity}] ${bug.title}`);
        console.log(`   ${bug.description}`);
      });
    }

    // Save results to file
    writeFileSync('qa-header-test-results.json', JSON.stringify(results, null, 2));
    console.log('\n✓ Results saved to qa-header-test-results.json');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await page.screenshot({
      path: 'screenshots/qa-error-state.png',
      fullPage: true
    });
    console.log('✓ Error state screenshot saved');
    results.bugs.push({
      severity: 'Critical',
      title: 'Test execution error',
      description: error.message,
      stack: error.stack
    });

    // Save results even on error
    writeFileSync('qa-header-test-results.json', JSON.stringify(results, null, 2));
  } finally {
    console.log('\n✓ Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('\n=== TEST COMPLETE ===\n');
  }

  return results;
}

testHeaderGoldLinks();
