import { test, expect } from '@playwright/test';

// Helper: Login and select patient role
async function loginAsPatient(page: any) {
  await page.goto('/');
  await page.getByText('Welcome back').waitFor({ timeout: 15000 });
  
  const inputs = page.locator('input');
  await inputs.nth(0).fill('patient@medride.com');
  await inputs.nth(1).fill('pass123');
  await page.getByText('Sign In').click();
  
  // Select patient role
  await page.getByText('How will you use MedRide?').waitFor({ timeout: 10000 });
  await page.getByText('I need a ride').click();
  
  // Wait for patient home
  await page.getByText('Book Medical Ride').waitFor({ timeout: 10000 });
}

test.describe('Patient Flow', () => {
  test('Role selection → Patient home', async ({ page }) => {
    await loginAsPatient(page);
    
    // Verify patient home elements
    await expect(page.getByText('Book Medical Ride')).toBeVisible();
    
    console.log('✅ Patient home screen loaded');
  });

  test('Booking flow - Step 1: Select ride type & urgency', async ({ page }) => {
    await loginAsPatient(page);
    
    // Click Book Medical Ride
    await page.getByText('Book Medical Ride').click();
    
    // Step 1 - Ride type
    await expect(page.getByText('What do you need?')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Hospital Visit')).toBeVisible();
    await expect(page.getByText('Dialysis')).toBeVisible();
    
    // Select Hospital Visit
    await page.getByText('Hospital Visit').click();
    
    // Select urgency Low
    await page.getByText('Low').click();
    
    // Click Continue
    await page.getByText('Continue').click();
    
    // Should show step 2
    await expect(page.getByText('Do you need any support?')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Booking Step 1 works → Type + Urgency selected');
  });

  test('Booking flow - Step 2: Special needs', async ({ page }) => {
    await loginAsPatient(page);
    
    await page.getByText('Book Medical Ride').click();
    await page.getByText('What do you need?').waitFor({ timeout: 5000 });
    
    // Step 1
    await page.getByText('Hospital Visit').click();
    await page.getByText('Low').click();
    await page.getByText('Continue').click();
    
    // Step 2
    await page.getByText('Do you need any support?').waitFor({ timeout: 5000 });
    await page.getByText('Can sit normally').click();
    
    // Continue to step 3
    await page.getByText('Continue').click();
    
    // Should show destination step
    await expect(page.getByText('Where do you need to go?')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Booking Step 2 works → Special needs selected');
  });

  test('Booking flow - Step 3: Destination & Book', async ({ page }) => {
    await loginAsPatient(page);
    
    await page.getByText('Book Medical Ride').click();
    await page.getByText('What do you need?').waitFor({ timeout: 5000 });
    
    // Step 1
    await page.getByText('Hospital Visit').click();
    await page.getByText('Low').click();
    await page.getByText('Continue').click();
    
    // Step 2
    await page.getByText('Do you need any support?').waitFor({ timeout: 5000 });
    await page.getByText('Can sit normally').click();
    await page.getByText('Continue').click();
    
    // Step 3 - Enter destination
    await page.getByText('Where do you need to go?').waitFor({ timeout: 5000 });
    const destInput = page.locator('input');
    await destInput.last().fill('Apollo Hospital');
    
    // Confirm booking
    await page.getByText('Confirm Booking').click();
    
    // Should show active ride screen (driver searching/accepted)
    await expect(page.getByText(/looking|searching|driver|accepted/i)).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Booking Step 3 works → Ride booked successfully');
  });

  test('SOS Screen - Emergency numbers', async ({ page }) => {
    await loginAsPatient(page);
    
    // Navigate to SOS tab
    await page.getByText('SOS').click();
    
    // Verify emergency content
    await expect(page.getByText('Emergency SOS')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Call 108')).toBeVisible();
    await expect(page.getByText('100')).toBeVisible();
    await expect(page.getByText('101')).toBeVisible();
    await expect(page.getByText(/non-emergency/i)).toBeVisible();
    
    console.log('✅ SOS screen renders with all emergency numbers');
  });

  test('Ride History Screen', async ({ page }) => {
    await loginAsPatient(page);
    
    // Navigate to Rides tab
    await page.getByText('Rides').click();
    
    // Verify history content
    await expect(page.getByText('Your Rides')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Apollo Hospital')).toBeVisible();
    
    console.log('✅ Ride history loads with demo rides');
  });

  test('Profile Screen', async ({ page }) => {
    await loginAsPatient(page);
    
    // Navigate to Profile tab
    await page.getByText('Profile').click();
    
    // Verify profile content
    await expect(page.getByText('Profile')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Log Out')).toBeVisible();
    await expect(page.getByText(/Switch to Driver mode/i)).toBeVisible();
    
    console.log('✅ Profile screen loads correctly');
  });
});
