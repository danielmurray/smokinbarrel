#!/usr/bin/env node

/**
 * Post-deployment test script for booking form
 *
 * Usage:
 *   node scripts/test-booking.js [url]
 *
 * Environment variables:
 *   - VERCEL_DEPLOYMENT_ID: Build/deployment ID from Vercel (auto-provided)
 *   - TEST_URL: URL to test (defaults to https://smokinbarrel.vercel.app)
 */

import puppeteer from 'puppeteer';
import { execSync } from 'child_process';

// Helper function to replace deprecated waitForTimeout
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get build hash from environment or git
function getBuildHash() {
  // Vercel provides VERCEL_DEPLOYMENT_ID
  if (process.env.VERCEL_DEPLOYMENT_ID) {
    return process.env.VERCEL_DEPLOYMENT_ID.substring(0, 8); // First 8 chars
  }

  // Fallback to git commit hash
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch (err) {
    // If no git, use timestamp
    return Date.now().toString(36);
  }
}

// Get datetime as number (format: YYYYMMDDHHmmss)
function getDateTimeNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

async function testBookingForm(url) {
  const buildHash = getBuildHash();
  const dateTimeNumber = getDateTimeNumber();
  const testName = `test-${buildHash}`;
  const testNumber = dateTimeNumber;

  console.log(`\n🧪 Testing booking form on ${url}`);
  console.log(`   Name: ${testName}`);
  console.log(`   Number: ${testNumber}`);
  console.log(`   Build Hash: ${buildHash}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to the site
    console.log('📡 Navigating to site...');
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the booking form to be visible
    console.log('⏳ Waiting for booking form...');
    await page.waitForSelector('#name', { timeout: 10000 });
    await page.waitForSelector('#number', { timeout: 10000 });
    await page.waitForSelector('#button', { timeout: 10000 });

    // Scroll to the booking section
    await page.evaluate(() => {
      document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
    });
    await delay(1000); // Wait for scroll

    // Fill in the form
    console.log('✍️  Filling in form fields...');
    await page.type('#name', testName, { delay: 50 });
    await page.type('#number', testNumber, { delay: 50 });

    // Optional: fill email if you want
    // await page.type('#email', `test-${buildHash}@example.com`, { delay: 50 });

    // Wait a moment for any validation
    await delay(500);

    // Submit the form
    console.log('📤 Submitting form...');
    const submitButton = await page.$('#button');
    await submitButton.click();

    // Wait for the button text to change (indicating submission)
    console.log('⏳ Waiting for submission response...');
    await page.waitForFunction(
      (buttonText) => {
        const btn = document.getElementById('button');
        return btn && btn.textContent !== buttonText;
      },
      { timeout: 10000 },
      'Request Booking'
    );

    // Check the button text to see if it succeeded
    const buttonText = await page.evaluate(() => {
      const btn = document.getElementById('button');
      return btn ? btn.textContent : '';
    });

    const success = buttonText.includes('Request Sent!') || buttonText.includes('Requesting...');

    if (success) {
      console.log('✅ Booking form test PASSED!');
      console.log(`   Button status: ${buttonText}`);

      // Wait a bit to see final state
      await delay(2000);
      const finalButtonText = await page.evaluate(() => {
        const btn = document.getElementById('button');
        return btn ? btn.textContent : '';
      });
      console.log(`   Final button status: ${finalButtonText}`);

      return true;
    } else {
      console.log('❌ Booking form test FAILED!');
      console.log(`   Button status: ${buttonText}`);

      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-booking-failure.png', fullPage: true });
      console.log('   Screenshot saved to: test-booking-failure.png');

      return false;
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);

    // Take a screenshot for debugging
    try {
      await page.screenshot({ path: 'test-booking-error.png', fullPage: true });
      console.log('   Screenshot saved to: test-booking-error.png');
    } catch (screenshotError) {
      // Ignore screenshot errors
    }

    return false;
  } finally {
    await browser.close();
  }
}

// Main execution
const testUrl = process.argv[2] || process.env.TEST_URL || 'https://smokinbarrel.vercel.app';

testBookingForm(testUrl)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

