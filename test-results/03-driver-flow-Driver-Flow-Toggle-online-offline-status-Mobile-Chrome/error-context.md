# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-driver-flow.spec.ts >> Driver Flow >> Toggle online/offline status
- Location: e2e\03-driver-flow.spec.ts:28:7

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByText('Welcome back') to be visible

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Helper: Login and select driver role
  4  | async function loginAsDriver(page: any) {
  5  |   await page.goto('/');
> 6  |   await page.getByText('Welcome back').waitFor({ timeout: 15000 });
     |                                        ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  7  |   
  8  |   const inputs = page.locator('input');
  9  |   await inputs.nth(0).fill('driver@medride.com');
  10 |   await inputs.nth(1).fill('pass123');
  11 |   await page.getByText('Sign In').click();
  12 |   
  13 |   // Select driver role
  14 |   await page.getByText('How will you use MedRide?').waitFor({ timeout: 10000 });
  15 |   await page.getByText("I'm a driver").click();
  16 |   
  17 |   // Wait for driver home
  18 |   await expect(page.getByText(/online|offline|go online/i)).toBeVisible({ timeout: 10000 });
  19 | }
  20 | 
  21 | test.describe('Driver Flow', () => {
  22 |   test('Role selection → Driver home', async ({ page }) => {
  23 |     await loginAsDriver(page);
  24 |     
  25 |     console.log('✅ Driver home screen loaded');
  26 |   });
  27 | 
  28 |   test('Toggle online/offline status', async ({ page }) => {
  29 |     await loginAsDriver(page);
  30 |     
  31 |     // Find and click online toggle
  32 |     const toggle = page.getByText(/go online|offline/i);
  33 |     await toggle.click();
  34 |     
  35 |     // Status should change
  36 |     await expect(page.getByText(/online|accepting/i)).toBeVisible({ timeout: 5000 });
  37 |     
  38 |     console.log('✅ Driver online/offline toggle works');
  39 |   });
  40 | 
  41 |   test('Receive incoming ride request (after going online)', async ({ page }) => {
  42 |     await loginAsDriver(page);
  43 |     
  44 |     // Go online
  45 |     const toggle = page.getByText(/go online|offline/i);
  46 |     await toggle.click();
  47 |     
  48 |     // Wait for simulated ride request (appears after 5s in demo)
  49 |     await expect(page.getByText(/Priya Sharma|incoming|new ride/i)).toBeVisible({ timeout: 10000 });
  50 |     
  51 |     console.log('✅ Incoming ride request received');
  52 |   });
  53 | 
  54 |   test('Accept ride and navigate', async ({ page }) => {
  55 |     await loginAsDriver(page);
  56 |     
  57 |     // Go online
  58 |     const toggle = page.getByText(/go online|offline/i);
  59 |     await toggle.click();
  60 |     
  61 |     // Wait for ride request
  62 |     await page.getByText(/Priya Sharma|incoming|new ride/i).waitFor({ timeout: 10000 });
  63 |     
  64 |     // Accept the ride
  65 |     await page.getByText(/accept/i).click();
  66 |     
  67 |     // Should show navigation/ride status
  68 |     await expect(page.getByText(/on the way|arriving|navigation/i)).toBeVisible({ timeout: 10000 });
  69 |     
  70 |     console.log('✅ Ride accepted → Navigation started');
  71 |   });
  72 | 
  73 |   test('Driver SOS Screen', async ({ page }) => {
  74 |     await loginAsDriver(page);
  75 |     
  76 |     // Navigate to SOS tab
  77 |     await page.getByText('SOS').click();
  78 |     
  79 |     await expect(page.getByText('Emergency SOS')).toBeVisible({ timeout: 5000 });
  80 |     await expect(page.getByText('Call 108')).toBeVisible();
  81 |     
  82 |     console.log('✅ Driver SOS screen works');
  83 |   });
  84 | 
  85 |   test('Driver Profile & Role Switch', async ({ page }) => {
  86 |     await loginAsDriver(page);
  87 |     
  88 |     // Navigate to Profile
  89 |     await page.getByText('Profile').click();
  90 |     
  91 |     await expect(page.getByText('Profile')).toBeVisible({ timeout: 5000 });
  92 |     await expect(page.getByText(/Switch to Patient mode/i)).toBeVisible();
  93 |     await expect(page.getByText('Log Out')).toBeVisible();
  94 |     
  95 |     console.log('✅ Driver profile with role switch');
  96 |   });
  97 | });
  98 | 
```