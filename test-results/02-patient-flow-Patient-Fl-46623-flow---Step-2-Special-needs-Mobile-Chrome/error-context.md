# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-patient-flow.spec.ts >> Patient Flow >> Booking flow - Step 2: Special needs
- Location: e2e\02-patient-flow.spec.ts:57:7

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByText('Welcome back') to be visible

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Helper: Login and select patient role
  4   | async function loginAsPatient(page: any) {
  5   |   await page.goto('/');
> 6   |   await page.getByText('Welcome back').waitFor({ timeout: 15000 });
      |                                        ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  7   |   
  8   |   const inputs = page.locator('input');
  9   |   await inputs.nth(0).fill('patient@medride.com');
  10  |   await inputs.nth(1).fill('pass123');
  11  |   await page.getByText('Sign In').click();
  12  |   
  13  |   // Select patient role
  14  |   await page.getByText('How will you use MedRide?').waitFor({ timeout: 10000 });
  15  |   await page.getByText('I need a ride').click();
  16  |   
  17  |   // Wait for patient home
  18  |   await page.getByText('Book Medical Ride').waitFor({ timeout: 10000 });
  19  | }
  20  | 
  21  | test.describe('Patient Flow', () => {
  22  |   test('Role selection → Patient home', async ({ page }) => {
  23  |     await loginAsPatient(page);
  24  |     
  25  |     // Verify patient home elements
  26  |     await expect(page.getByText('Book Medical Ride')).toBeVisible();
  27  |     
  28  |     console.log('✅ Patient home screen loaded');
  29  |   });
  30  | 
  31  |   test('Booking flow - Step 1: Select ride type & urgency', async ({ page }) => {
  32  |     await loginAsPatient(page);
  33  |     
  34  |     // Click Book Medical Ride
  35  |     await page.getByText('Book Medical Ride').click();
  36  |     
  37  |     // Step 1 - Ride type
  38  |     await expect(page.getByText('What do you need?')).toBeVisible({ timeout: 5000 });
  39  |     await expect(page.getByText('Hospital Visit')).toBeVisible();
  40  |     await expect(page.getByText('Dialysis')).toBeVisible();
  41  |     
  42  |     // Select Hospital Visit
  43  |     await page.getByText('Hospital Visit').click();
  44  |     
  45  |     // Select urgency Low
  46  |     await page.getByText('Low').click();
  47  |     
  48  |     // Click Continue
  49  |     await page.getByText('Continue').click();
  50  |     
  51  |     // Should show step 2
  52  |     await expect(page.getByText('Do you need any support?')).toBeVisible({ timeout: 5000 });
  53  |     
  54  |     console.log('✅ Booking Step 1 works → Type + Urgency selected');
  55  |   });
  56  | 
  57  |   test('Booking flow - Step 2: Special needs', async ({ page }) => {
  58  |     await loginAsPatient(page);
  59  |     
  60  |     await page.getByText('Book Medical Ride').click();
  61  |     await page.getByText('What do you need?').waitFor({ timeout: 5000 });
  62  |     
  63  |     // Step 1
  64  |     await page.getByText('Hospital Visit').click();
  65  |     await page.getByText('Low').click();
  66  |     await page.getByText('Continue').click();
  67  |     
  68  |     // Step 2
  69  |     await page.getByText('Do you need any support?').waitFor({ timeout: 5000 });
  70  |     await page.getByText('Can sit normally').click();
  71  |     
  72  |     // Continue to step 3
  73  |     await page.getByText('Continue').click();
  74  |     
  75  |     // Should show destination step
  76  |     await expect(page.getByText('Where do you need to go?')).toBeVisible({ timeout: 5000 });
  77  |     
  78  |     console.log('✅ Booking Step 2 works → Special needs selected');
  79  |   });
  80  | 
  81  |   test('Booking flow - Step 3: Destination & Book', async ({ page }) => {
  82  |     await loginAsPatient(page);
  83  |     
  84  |     await page.getByText('Book Medical Ride').click();
  85  |     await page.getByText('What do you need?').waitFor({ timeout: 5000 });
  86  |     
  87  |     // Step 1
  88  |     await page.getByText('Hospital Visit').click();
  89  |     await page.getByText('Low').click();
  90  |     await page.getByText('Continue').click();
  91  |     
  92  |     // Step 2
  93  |     await page.getByText('Do you need any support?').waitFor({ timeout: 5000 });
  94  |     await page.getByText('Can sit normally').click();
  95  |     await page.getByText('Continue').click();
  96  |     
  97  |     // Step 3 - Enter destination
  98  |     await page.getByText('Where do you need to go?').waitFor({ timeout: 5000 });
  99  |     const destInput = page.locator('input');
  100 |     await destInput.last().fill('Apollo Hospital');
  101 |     
  102 |     // Confirm booking
  103 |     await page.getByText('Confirm Booking').click();
  104 |     
  105 |     // Should show active ride screen (driver searching/accepted)
  106 |     await expect(page.getByText(/looking|searching|driver|accepted/i)).toBeVisible({ timeout: 10000 });
```