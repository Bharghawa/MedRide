import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('Login screen renders correctly', async ({ page }) => {
    await page.goto('/');
    
    // Should show login screen
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('MedRide')).toBeVisible();
    await expect(page.getByText('Sign In')).toBeVisible();
    
    console.log('✅ Login screen renders correctly');
  });

  test('Shows validation error on empty login', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Welcome back').waitFor({ timeout: 15000 });
    
    // Click Sign In without entering anything
    await page.getByText('Sign In').click();
    
    // Should show error
    await expect(page.getByText('Please fill in all fields')).toBeVisible();
    
    console.log('✅ Empty login validation works');
  });

  test('Login with demo credentials', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Welcome back').waitFor({ timeout: 15000 });
    
    // Fill in email and password
    const inputs = page.locator('input');
    await inputs.nth(0).fill('demo@medride.com');
    await inputs.nth(1).fill('password123');
    
    // Click Sign In
    await page.getByText('Sign In').click();
    
    // Should navigate to role selection
    await expect(page.getByText('How will you use MedRide?')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Demo login successful → Role selection shown');
  });

  test('Navigate to Signup screen', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Welcome back').waitFor({ timeout: 15000 });
    
    // Click sign up link
    await page.getByText('Sign Up').click();
    
    // Should show signup form
    await expect(page.getByText('Create Account')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Signup screen navigation works');
  });

  test('Signup with demo credentials', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Welcome back').waitFor({ timeout: 15000 });
    
    // Go to signup
    await page.getByText('Sign Up').click();
    await page.getByText('Create Account').first().waitFor({ timeout: 5000 });
    
    // Fill signup form
    const inputs = page.locator('input');
    await inputs.nth(0).fill('Test Patient');
    await inputs.nth(1).fill('patient@test.com');
    await inputs.nth(2).fill('9876543210');
    await inputs.nth(3).fill('secure123');
    
    // Submit - click the button (last "Create Account" text)
    await page.getByRole('button', { name: /Create Account/i }).click();
    
    // Should navigate to role selection
    await expect(page.getByText('How will you use MedRide?')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Signup successful → Role selection shown');
  });
});
