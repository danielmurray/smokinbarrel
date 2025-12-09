# Post-Deployment Test Script

This automatically tests the booking form after each Vercel deployment and daily at noon Central time.

## Automatic Testing

### Daily Scheduled Test

The GitHub Action (`.github/workflows/daily-booking-test.yml`) runs:
- **Every day at 12:00 PM Central Time** (18:00 UTC)
- Tests your production site
- Saves failure screenshots (kept for 7 days)
- Can be manually triggered from GitHub Actions tab

### Post-Deployment Test

The GitHub Action (`.github/workflows/test-after-vercel-deploy.yml`) automatically:
- Waits for Vercel deployment to complete (30 seconds)
- Tests the booking form after each push to `main`
- Uses the commit SHA as the deployment ID
- Generates test data:
  - **Name**: `test-{commitSHA}` (first 8 chars)
  - **Number**: Current datetime in format `YYYYMMDDHHmmss`

**No configuration needed** - it just works after you push to main!

### How It Works

1. You push to `main` branch
2. Vercel automatically deploys
3. GitHub Action waits 30 seconds for deployment to complete
4. Action runs the Puppeteer script which:
   - Opens a browser and navigates to your site
   - Fills out the booking form with test data
   - Submits the form
   - Verifies the submission was successful
5. Results are logged in GitHub Actions

## Manual Testing

### Test with Puppeteer Script (Full Browser Test)

```bash
# Test the default URL (https://smokinbarrel.vercel.app)
npm run test:booking

# Test a custom URL
node scripts/test-booking.js https://www.smokinbarrelsauna.com
```

The Puppeteer script provides a full browser-based test (fills form, clicks submit, etc.) but requires a local environment with Chrome installed.

## What It Tests

1. ✅ Navigates to the site
2. ✅ Waits for the booking form to load
3. ✅ Fills in the form with test data:
   - Name: `test-{buildHash}`
   - Number: `{datetime}`
4. ✅ Submits the form
5. ✅ Verifies the submission was successful
6. ✅ Takes a screenshot on failure for debugging

## Exit Codes

- `0`: Test passed
- `1`: Test failed or error occurred

