import { test, expect } from '@playwright/test';

// Helper: Login and select driver role
async function loginAsDriver(page: any) {
  await page.goto('/');
  await page.getByText('Welcome back').waitFor({ timeout: 15000 });
  
  const inputs = page.locator('input');
  await inputs.nth(0).fill('driver@medride.com');
  await inputs.nth(1).fill('pass123');
  await page.getByText('Sign In').click();
  
  // Select driver role
  await page.getByText('How will you use MedRide?').waitFor({ timeout: 10000 });
  await page.getByText("I'm a driver").click();
  
  // Wait for driver home
  await expect(page.getByText(/online|offline|go online/i)).toBeVisible({ timeout: 10000 });
}

test.describe('Driver Flow', () => {
  test('Role selection → Driver home', async ({ page }) => {
    await loginAsDriver(page);
    
    console.log('✅ Driver home screen loaded');
  });

  test('Toggle online/offline status', async ({ page }) => {
    await loginAsDriver(page);
    
    // Find and click online toggle
    const toggle = page.getByText(/go online|offline/i);
    await toggle.click();
    
    // Status should change
    await expect(page.getByText(/online|accepting/i)).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Driver online/offline toggle works');
  });

  test('Receive incoming ride request (after going online)', async ({ page }) => {
    await loginAsDriver(page);
    
    // Go online
    const toggle = page.getByText(/go online|offline/i);
    await toggle.click();
    
    // Wait for simulated ride request (appears after 5s in demo)
    await expect(page.getByText(/Priya Sharma|incoming|new ride/i)).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Incoming ride request received');
  });

  test('Accept ride and navigate', async ({ page }) => {
    await loginAsDriver(page);
    
    // Go online
    const toggle = page.getByText(/go online|offline/i);
    await toggle.click();
    
    // Wait for ride request
    await page.getByText(/Priya Sharma|incoming|new ride/i).waitFor({ timeout: 10000 });
    
    // Accept the ride
    await page.getByText(/accept/i).click();
    
    // Should show navigation/ride status
    await expect(page.getByText(/on the way|arriving|navigation/i)).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Ride accepted → Navigation started');
  });

  test('Driver SOS Screen', async ({ page }) => {
    await loginAsDriver(page);
    
    // Navigate to SOS tab
    await page.getByText('SOS').click();
    
    await expect(page.getByText('Emergency SOS')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Call 108')).toBeVisible();
    
    console.log('✅ Driver SOS screen works');
  });

  test('Driver Profile & Role Switch', async ({ page }) => {
    await loginAsDriver(page);
    
    // Navigate to Profile
    await page.getByText('Profile').click();
    
    await expect(page.getByText('Profile')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Switch to Patient mode/i)).toBeVisible();
    await expect(page.getByText('Log Out')).toBeVisible();
    
    console.log('✅ Driver profile with role switch');
  });
});
