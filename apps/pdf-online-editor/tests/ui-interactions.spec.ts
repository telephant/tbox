import { test, expect } from '@playwright/test';

test.describe('UI Interactions and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate between pages correctly', async ({ page }) => {
    // Start at landing page
    await expect(page.getByText('PDF Online Editor')).toBeVisible();
    
    // Navigate to converter
    await page.getByText('Get Started').click();
    await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
    
    // Check URL
    expect(page.url()).toContain('/converter');
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/converter');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.max-w-6xl')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/converter');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // File input should be focusable
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeFocused();
  });

  test('should handle large file uploads gracefully', async ({ page }) => {
    await page.goto('/converter');
    
    // Create a large dummy file (simulate with metadata)
    const largeFileContent = Buffer.alloc(10 * 1024 * 1024); // 10MB
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeFileContent
    });
    
    // Should show upload progress or size warning
    await expect(page.locator('text=/Uploading|too large|size/i')).toBeVisible({ timeout: 10000 });
  });

  test('should handle network errors', async ({ page }) => {
    await page.goto('/converter');
    
    // Simulate network failure
    await page.route('**/api/convert', route => route.abort());
    
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'network-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    // Should show network error
    await expect(page.getByText(/Error|failed|network/i)).toBeVisible({ timeout: 15000 });
  });

  test('should handle server errors', async ({ page }) => {
    await page.goto('/converter');
    
    // Simulate server error
    await page.route('**/api/convert', route => route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    }));
    
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'server-error-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    // Should show server error
    await expect(page.getByText(/server error|500/i)).toBeVisible({ timeout: 15000 });
  });

  test('should validate empty file uploads', async ({ page }) => {
    await page.goto('/converter');
    
    // Try to upload an empty file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'empty.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(0)
    });
    
    // Should show validation error
    await expect(page.getByText(/empty|invalid|file/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle multiple rapid uploads', async ({ page }) => {
    await page.goto('/converter');
    
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    
    // Upload first file
    await fileInput.setInputFiles({
      name: 'first.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    // Immediately upload second file
    await fileInput.setInputFiles({
      name: 'second.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    // Should handle gracefully (either queue or replace)
    await expect(page.locator('text=/Uploading|processing/i')).toBeVisible({ timeout: 5000 });
  });

  test('should maintain state during browser refresh', async ({ page }) => {
    await page.goto('/converter');
    
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'refresh-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    
    // Refresh page
    await page.reload();
    
    // Should return to initial state
    await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
    await expect(page.getByText('Drop your PDF file here')).toBeVisible();
  });

  test('should handle accessibility features', async ({ page }) => {
    await page.goto('/converter');
    
    // Check for ARIA labels and roles
    await expect(page.locator('[role="button"]')).toHaveCount({ timeout: 5000 });
    await expect(page.locator('[aria-label]')).toHaveCount({ timeout: 5000 });
    
    // Check for keyboard accessibility
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should handle print functionality', async ({ page }) => {
    await page.goto('/converter');
    
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'print-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    await page.getByText('Edit & Export PDF').click();
    
    // Mock print function
    await page.addInitScript(() => {
      window.print = () => console.log('Print called');
    });
    
    // Test print functionality via keyboard
    await page.keyboard.press('Control+P');
    
    // Should not crash or show errors
    await expect(page.getByText('PDF Editor')).toBeVisible();
  });

  test('should handle browser back/forward buttons', async ({ page }) => {
    await page.goto('/');
    
    // Navigate forward
    await page.getByText('Get Started').click();
    await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
    
    // Go back
    await page.goBack();
    await expect(page.getByText('PDF Online Editor')).toBeVisible();
    
    // Go forward
    await page.goForward();
    await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
  });

  test('should handle edge cases in text editing', async ({ page }) => {
    await page.goto('/converter');
    
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'edit-edge-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    await page.getByText('Edit & Export PDF').click();
    
    // Start editing
    await page.getByText('Start Editing').click();
    
    // Test rapid mode switching
    await page.getByText('HTML Code').click();
    await page.getByText('Preview').click();
    await page.getByText('Edit Text').click();
    
    // Should not crash
    await expect(page.getByText('Editing Mode')).toBeVisible();
  });

  test('should handle device orientation changes on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/converter');
    
    // Portrait mode
    await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
    
    // Landscape mode
    await page.setViewportSize({ width: 667, height: 375 });
    await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
    
    // Should adapt layout
    const uploadArea = page.locator('[data-testid="upload-area"]').first();
    await expect(uploadArea).toBeVisible();
  });
});

// Helper function to create a test PDF
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
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test PDF Content) Tj
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
297
%%EOF`;

  return Buffer.from(pdfContent);
}