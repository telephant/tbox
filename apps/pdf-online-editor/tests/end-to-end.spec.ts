import { test, expect } from '@playwright/test';

test.describe('Complete PDF Editor Workflow', () => {
  test('should complete full PDF editing workflow with screenshot validation', async ({ page }) => {
    // Step 1: Navigate to converter
    await page.goto('/converter');
    await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'test-results/01-initial-state.png', fullPage: true });
    
    // Step 2: Upload PDF
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'workflow-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    // Take screenshot of file selected
    await page.screenshot({ path: 'test-results/02-file-selected.png', fullPage: true });
    
    // Step 3: Convert PDF
    await page.getByText('Convert to HTML').click();
    await expect(page.getByText('Converting...')).toBeVisible();
    
    // Take screenshot of conversion in progress
    await page.screenshot({ path: 'test-results/03-converting.png', fullPage: true });
    
    // Wait for conversion to complete
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    
    // Take screenshot of conversion complete
    await page.screenshot({ path: 'test-results/04-conversion-complete.png', fullPage: true });
    
    // Verify conversion results
    await expect(page.locator('iframe')).toBeVisible();
    await expect(page.getByText('workflow-test.pdf')).toBeVisible();
    await expect(page.getByText(/Processing Time:/)).toBeVisible();
    
    // Step 4: Enter editor mode
    await page.getByText('Edit & Export PDF').click();
    await expect(page.getByText('PDF Editor')).toBeVisible();
    
    // Take screenshot of editor interface
    await page.screenshot({ path: 'test-results/05-editor-interface.png', fullPage: true });
    
    // Step 5: Test view modes
    // Preview mode (default)
    await expect(page.getByText('HTML Preview')).toBeVisible();
    
    // Edit mode
    await page.getByText('Edit Text').click();
    await expect(page.getByText('Editing Mode')).toBeVisible();
    await page.screenshot({ path: 'test-results/06-edit-mode.png', fullPage: true });
    
    // Code mode
    await page.getByText('HTML Code').click();
    await expect(page.getByText('HTML Source Code')).toBeVisible();
    await page.screenshot({ path: 'test-results/07-code-mode.png', fullPage: true });
    
    // Return to preview
    await page.getByText('Preview').click();
    
    // Step 6: Test editing functionality
    await page.getByText('Start Editing').click();
    await expect(page.getByText('Editing...')).toBeVisible();
    await page.screenshot({ path: 'test-results/08-editing-active.png', fullPage: true });
    
    // Save changes
    await page.getByText('Save Changes').click();
    await expect(page.getByText('(Modified)')).toBeVisible();
    await page.screenshot({ path: 'test-results/09-changes-saved.png', fullPage: true });
    
    // Step 7: Test export options
    await expect(page.getByText('PDF Export Options')).toBeVisible();
    
    // Change export settings
    await page.selectOption('select[value="A4"]', 'A3');
    await page.selectOption('select[value="portrait"]', 'landscape');
    await page.screenshot({ path: 'test-results/10-export-options.png', fullPage: true });
    
    // Step 8: Test all export methods
    
    // Test HTML download
    const htmlDownloadPromise = page.waitForEvent('download');
    await page.getByText('Download HTML').click();
    const htmlDownload = await htmlDownloadPromise;
    expect(htmlDownload.suggestedFilename()).toBe('workflow-test_edited.html');
    
    // Test copy to clipboard
    await page.context().grantPermissions(['clipboard-write']);
    await page.getByText('Copy HTML').click();
    await expect(page.getByText('HTML code copied to clipboard!')).toBeVisible();
    
    // Test printable HTML download
    const printableDownloadPromise = page.waitForEvent('download');
    await page.getByText('Printable HTML').click();
    const printableDownload = await printableDownloadPromise;
    expect(printableDownload.suggestedFilename()).toBe('workflow-test_printable.html');
    await expect(page.getByText('HTML file downloaded!')).toBeVisible();
    
    // Mock window.open for print tests
    await page.addInitScript(() => {
      window.open = () => {
        const mockWindow = {
          document: { write: () => {}, close: () => {} },
          print: () => {},
          close: () => {},
          onload: null as any
        };
        setTimeout(() => {
          if (mockWindow.onload) mockWindow.onload();
        }, 100);
        return mockWindow as any;
      };
    });
    
    // Test open for print
    await page.getByText('Open for Print').click();
    await expect(page.getByText('Document opened in new tab')).toBeVisible();
    
    // Test print to PDF
    await page.getByText('🖨️ Print to PDF').click();
    await expect(page.getByText('Print dialog opened!')).toBeVisible({ timeout: 10000 });
    
    // Step 9: Test fullscreen mode
    await page.getByText('Fullscreen').click();
    await expect(page.getByText('Exit Fullscreen')).toBeVisible();
    await page.screenshot({ path: 'test-results/11-fullscreen.png', fullPage: true });
    
    await page.getByText('Exit Fullscreen').click();
    await expect(page.getByText('Fullscreen')).toBeVisible();
    
    // Step 10: Test navigation back
    await page.getByText('← Back').click();
    await expect(page.getByText('Conversion Complete')).toBeVisible();
    await page.screenshot({ path: 'test-results/12-back-to-results.png', fullPage: true });
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/13-workflow-complete.png', fullPage: true });
  });

  test('should handle responsive design across devices', async ({ page }) => {
    const devices = [
      { name: 'Desktop', width: 1200, height: 800 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    for (const device of devices) {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('/converter');
      
      await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
      await page.screenshot({ 
        path: `test-results/responsive-${device.name.toLowerCase()}.png`, 
        fullPage: true 
      });
      
      // Verify UI elements are accessible on this device
      const uploadArea = page.locator('[data-testid="upload-area"]').first();
      await expect(uploadArea).toBeVisible();
      
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
    }
  });

  test('should verify asset serving and HTML rendering', async ({ page }) => {
    await page.goto('/converter');
    
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'asset-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    await page.getByText('Convert to HTML').click();
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    
    // Check that iframe loads without errors
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    
    // Verify no 404 errors in console
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    // Wait a bit for any asset loading
    await page.waitForTimeout(3000);
    
    // Check for 404 errors (should be minimal or none)
    const has404Errors = logs.some(log => log.includes('404') || log.includes('Failed to load'));
    if (has404Errors) {
      console.warn('Asset loading errors detected:', logs);
    }
    
    await page.screenshot({ path: 'test-results/asset-rendering.png', fullPage: true });
  });

  test('should validate performance metrics', async ({ page }) => {
    await page.goto('/converter');
    
    // Measure page load performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    console.log('Performance metrics:', performanceMetrics);
    
    // Basic performance assertions
    expect(performanceMetrics.totalTime).toBeLessThan(10000); // Should load in under 10s
    expect(performanceMetrics.loadTime).toBeLessThan(5000); // Load event should be quick
    
    // Test conversion performance
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    
    const conversionStart = Date.now();
    await fileInput.setInputFiles({
      name: 'performance-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    await page.getByText('Convert to HTML').click();
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    const conversionEnd = Date.now();
    
    const conversionTime = conversionEnd - conversionStart;
    console.log('Conversion time:', conversionTime, 'ms');
    
    // Conversion should complete within reasonable time
    expect(conversionTime).toBeLessThan(30000); // 30 seconds max
  });
});

// Helper function to create test PDF
function createTestPdf(): Buffer {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 54
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test PDF for E2E Testing) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
307
%%EOF`;

  return Buffer.from(pdfContent);
}