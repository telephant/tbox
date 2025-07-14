import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('PDF to HTML Conversion E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the converter page
    await page.goto('/converter');
    await page.waitForLoadState('networkidle');
  });

  test('should convert PDF to HTML with proper asset loading', async ({ page }) => {
    // Wait for the page to be ready
    await expect(page.locator('h1')).toContainText('PDF to HTML Converter');

    // Get the test PDF file
    const testPdfPath = path.join(__dirname, '../../test.pdf');
    
    // Upload the PDF file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);

    // Wait for file validation and UI update
    await expect(page.locator('text=test.pdf')).toBeVisible();

    // Click convert button
    const convertButton = page.locator('button:has-text("Convert to HTML")');
    await expect(convertButton).toBeEnabled();
    await convertButton.click();

    // Wait for conversion to complete
    await expect(page.locator('text=Conversion Complete')).toBeVisible({ timeout: 30000 });

    // Verify conversion metadata is displayed
    await expect(page.locator('text=test.pdf → HTML')).toBeVisible();
    await expect(page.locator('text=processed in')).toBeVisible();

    // Test HTML preview mode
    await expect(page.locator('button:has-text("Preview")')).toHaveClass(/bg-blue-500/);
    
    // Wait for iframe to load
    const iframe = page.frameLocator('iframe[title="PDF Preview"]');
    await expect(iframe.locator('body')).toBeVisible({ timeout: 10000 });

    // Take screenshot of the HTML preview
    await page.screenshot({ 
      path: 'test-results/pdf-conversion-preview.png',
      fullPage: true 
    });

    // Switch to code view
    await page.locator('button:has-text("HTML Code")').click();
    await expect(page.locator('button:has-text("HTML Code")')).toHaveClass(/bg-blue-500/);
    
    // Verify HTML code is displayed
    await expect(page.locator('pre code')).toBeVisible();
    
    // Take screenshot of the code view
    await page.screenshot({ 
      path: 'test-results/pdf-conversion-code-view.png',
      fullPage: true 
    });

    // Test fullscreen mode
    await page.locator('button:has-text("Preview")').click();
    await page.locator('button:has-text("Fullscreen")').click();
    
    // Verify fullscreen mode
    await expect(page.locator('.fixed.inset-0')).toBeVisible();
    await page.screenshot({ 
      path: 'test-results/pdf-conversion-fullscreen.png',
      fullPage: true 
    });
    
    // Exit fullscreen
    await page.locator('button:has-text("Exit Fullscreen")').click();

    // Test download functionality
    const downloadPromise = page.waitForDownload();
    await page.locator('button:has-text("Download HTML")').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/test\.html$/);

    // Verify metadata section shows correct information
    await expect(page.locator('text=Conversion Details')).toBeVisible();
    await expect(page.locator('text=Original File:')).toBeVisible();
    await expect(page.locator('text=Processing Time:')).toBeVisible();
    await expect(page.locator('text=Assets:')).toBeVisible();
    await expect(page.locator('text=HTML Size:')).toBeVisible();
  });

  test('should validate asset loading in converted HTML', async ({ page }) => {
    // Upload and convert a PDF
    const testPdfPath = path.join(__dirname, '../../test.pdf');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);
    
    await page.locator('button:has-text("Convert to HTML")').click();
    await expect(page.locator('text=Conversion Complete')).toBeVisible({ timeout: 30000 });

    // Monitor network requests to validate asset loading
    const failedRequests: string[] = [];
    const assetRequests: string[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      
      // Track asset requests (CSS, JS, images, fonts)
      if (url.includes('/assets/') && 
          (url.includes('.css') || url.includes('.js') || 
           url.includes('.png') || url.includes('.woff') || 
           url.includes('.jpg') || url.includes('.gif'))) {
        assetRequests.push(url);
        
        if (!response.ok()) {
          failedRequests.push(`${response.status()} - ${url}`);
        }
      }
    });

    // Wait for iframe and any asset loading
    const iframe = page.frameLocator('iframe[title="PDF Preview"]');
    await expect(iframe.locator('body')).toBeVisible({ timeout: 15000 });
    
    // Give additional time for all assets to load
    await page.waitForTimeout(3000);

    // Verify no assets failed to load
    expect(failedRequests).toEqual([]);
    
    // Verify some assets were actually requested (converted PDF should have assets)
    expect(assetRequests.length).toBeGreaterThan(0);
    
    console.log(`Successfully loaded ${assetRequests.length} assets:`);
    assetRequests.forEach(url => console.log(`  ✓ ${url}`));
  });

  test('should handle conversion errors gracefully', async ({ page }) => {
    // Create a mock invalid file for testing error handling
    const invalidFile = Buffer.from('This is not a valid PDF file');
    
    // Navigate to converter page
    await page.goto('/converter');
    
    // Try to upload an invalid file (we'll simulate this by uploading a text file)
    const fileInput = page.locator('input[type="file"]');
    
    // Create a temporary invalid file
    const tempPath = path.join(__dirname, '../../temp-invalid.txt');
    fs.writeFileSync(tempPath, 'Invalid PDF content');
    
    await fileInput.setInputFiles(tempPath);
    
    // The UI should still show the file but conversion should fail
    const convertButton = page.locator('button:has-text("Convert to HTML")');
    await convertButton.click();
    
    // Expect an error message or failure state
    // This might show up as a toast, error message, or failure UI
    await expect(page.locator('text=error', { timeout: 10000 })).toBeVisible().catch(() => {
      // If no explicit error message, check that conversion didn't complete successfully
      expect(page.locator('text=Conversion Complete')).not.toBeVisible();
    });
    
    // Cleanup
    fs.unlinkSync(tempPath);
  });

  test('should validate backend health before conversion', async ({ page }) => {
    // Test the backend health endpoint directly via browser
    const response = await page.request.get('http://localhost:3000/health');
    expect(response.ok()).toBeTruthy();
    
    const healthData = await response.json();
    expect(healthData).toHaveProperty('status', 'ok');
    expect(healthData).toHaveProperty('timestamp');
  });

  test('should validate asset serving endpoints', async ({ page }) => {
    // Test that asset endpoints are working by directly requesting known assets
    const assetResponse = await page.request.get('http://localhost:3000/assets/base.min.css');
    expect(assetResponse.ok()).toBeTruthy();
    expect(assetResponse.headers()['content-type']).toBe('text/css');

    const jsAssetResponse = await page.request.get('http://localhost:3000/assets/pdf2htmlEX.min.js');
    expect(jsAssetResponse.ok()).toBeTruthy();
    expect(jsAssetResponse.headers()['content-type']).toBe('application/javascript');
  });
});

test.describe('PDF Conversion UI Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/converter');
    await page.waitForLoadState('networkidle');
    
    // Test that upload area is still usable on mobile
    await expect(page.locator('text=PDF to HTML Converter')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/mobile-converter-view.png',
      fullPage: true 
    });
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/converter');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=PDF to HTML Converter')).toBeVisible();
    
    // Take tablet screenshot
    await page.screenshot({ 
      path: 'test-results/tablet-converter-view.png',
      fullPage: true 
    });
  });
});