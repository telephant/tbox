import { test, expect } from '@playwright/test';

test.describe('Basic System Validation', () => {
  test('backend health check', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/health');
    
    if (!response.ok()) {
      console.log(`Health check failed with status: ${response.status()}`);
      console.log(`Response text: ${await response.text()}`);
    }
    
    expect(response.ok()).toBeTruthy();
    
    const healthData = await response.json();
    expect(healthData).toHaveProperty('status', 'ok');
    expect(healthData).toHaveProperty('timestamp');
  });

  test('asset serving validation', async ({ page }) => {
    // First verify CSS asset
    const cssResponse = await page.request.get('http://localhost:3000/assets/base.min.css');
    
    if (!cssResponse.ok()) {
      console.log(`CSS asset failed with status: ${cssResponse.status()}`);
      console.log(`CSS response text: ${await cssResponse.text()}`);
    }
    
    expect(cssResponse.ok()).toBeTruthy();
    expect(cssResponse.headers()['content-type']).toBe('text/css');

    // Then verify JS asset
    const jsResponse = await page.request.get('http://localhost:3000/assets/pdf2htmlEX.min.js');
    
    if (!jsResponse.ok()) {
      console.log(`JS asset failed with status: ${jsResponse.status()}`);
      console.log(`JS response text: ${await jsResponse.text()}`);
    }
    
    expect(jsResponse.ok()).toBeTruthy();
    expect(jsResponse.headers()['content-type']).toBe('application/javascript');
  });

  test('frontend accessibility', async ({ page }) => {
    await page.goto('/converter');
    await page.waitForLoadState('networkidle');
    
    // Use more specific locators
    await expect(page.locator('h1')).toContainText('PDF to HTML Converter');
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Take screenshot for visual validation
    await page.screenshot({ 
      path: 'test-results/basic-converter-page.png',
      fullPage: true 
    });
  });

  test('port configuration validation', async ({ page }) => {
    // Log current URLs to confirm port configuration
    const currentUrl = page.url();
    console.log(`Frontend running on: ${currentUrl}`);
    
    // Test backend endpoints from multiple angles
    const healthFromBrowser = await page.request.get('http://localhost:3000/health');
    console.log(`Backend health status: ${healthFromBrowser.status()}`);
    
    // Verify frontend can reach backend (this is the critical test)
    await page.goto('/converter');
    
    // Check browser console for any connection errors
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Report any console errors that might indicate connectivity issues
    if (consoleLogs.length > 0) {
      console.log('Console errors detected:', consoleLogs);
    }
    
    expect(healthFromBrowser.ok()).toBeTruthy();
  });
});