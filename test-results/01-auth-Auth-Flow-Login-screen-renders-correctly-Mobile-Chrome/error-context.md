# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-auth.spec.ts >> Auth Flow >> Login screen renders correctly
- Location: e2e\01-auth.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Welcome back')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText('Welcome back')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Auth Flow', () => {
  4  |   test('Login screen renders correctly', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // Should show login screen
> 8  |     await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 15000 });
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  9  |     await expect(page.getByText('MedRide')).toBeVisible();
  10 |     await expect(page.getByText('Sign In')).toBeVisible();
  11 |     
  12 |     console.log('✅ Login screen renders correctly');
  13 |   });
  14 | 
  15 |   test('Shows validation error on empty login', async ({ page }) => {
  16 |     await page.goto('/');
  17 |     await page.getByText('Welcome back').waitFor({ timeout: 15000 });
  18 |     
  19 |     // Click Sign In without entering anything
  20 |     await page.getByText('Sign In').click();
  21 |     
  22 |     // Should show error
  23 |     await expect(page.getByText('Please fill in all fields')).toBeVisible();
  24 |     
  25 |     console.log('✅ Empty login validation works');
  26 |   });
  27 | 
  28 |   test('Login with demo credentials', async ({ page }) => {
  29 |     await page.goto('/');
  30 |     await page.getByText('Welcome back').waitFor({ timeout: 15000 });
  31 |     
  32 |     // Fill in email and password
  33 |     const inputs = page.locator('input');
  34 |     await inputs.nth(0).fill('demo@medride.com');
  35 |     await inputs.nth(1).fill('password123');
  36 |     
  37 |     // Click Sign In
  38 |     await page.getByText('Sign In').click();
  39 |     
  40 |     // Should navigate to role selection
  41 |     await expect(page.getByText('How will you use MedRide?')).toBeVisible({ timeout: 10000 });
  42 |     
  43 |     console.log('✅ Demo login successful → Role selection shown');
  44 |   });
  45 | 
  46 |   test('Navigate to Signup screen', async ({ page }) => {
  47 |     await page.goto('/');
  48 |     await page.getByText('Welcome back').waitFor({ timeout: 15000 });
  49 |     
  50 |     // Click sign up link
  51 |     await page.getByText('Sign Up').click();
  52 |     
  53 |     // Should show signup form
  54 |     await expect(page.getByText('Create Account')).toBeVisible({ timeout: 5000 });
  55 |     
  56 |     console.log('✅ Signup screen navigation works');
  57 |   });
  58 | 
  59 |   test('Signup with demo credentials', async ({ page }) => {
  60 |     await page.goto('/');
  61 |     await page.getByText('Welcome back').waitFor({ timeout: 15000 });
  62 |     
  63 |     // Go to signup
  64 |     await page.getByText('Sign Up').click();
  65 |     await page.getByText('Create Account').first().waitFor({ timeout: 5000 });
  66 |     
  67 |     // Fill signup form
  68 |     const inputs = page.locator('input');
  69 |     await inputs.nth(0).fill('Test Patient');
  70 |     await inputs.nth(1).fill('patient@test.com');
  71 |     await inputs.nth(2).fill('9876543210');
  72 |     await inputs.nth(3).fill('secure123');
  73 |     
  74 |     // Submit - click the button (last "Create Account" text)
  75 |     await page.getByRole('button', { name: /Create Account/i }).click();
  76 |     
  77 |     // Should navigate to role selection
  78 |     await expect(page.getByText('How will you use MedRide?')).toBeVisible({ timeout: 10000 });
  79 |     
  80 |     console.log('✅ Signup successful → Role selection shown');
  81 |   });
  82 | });
  83 | 
```