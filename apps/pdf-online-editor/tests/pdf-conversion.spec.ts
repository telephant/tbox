import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

test.describe('PDF Upload and Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/converter');
  });

  test('should display upload interface correctly', async ({ page }) => {
    // Check if the main elements are present
    await expect(page.getByText('PDF to HTML Converter')).toBeVisible();
    await expect(page.getByText('Drop your PDF file here')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
    
    // Check upload area styling
    const uploadArea = page.locator('[data-testid="upload-area"]').first();
    await expect(uploadArea).toBeVisible();
  });

  test('should show drag and drop states', async ({ page }) => {
    const uploadArea = page.locator('[data-testid="upload-area"]').first();
    
    // Simulate drag over
    await uploadArea.dispatchEvent('dragover', { dataTransfer: { files: [] } });
    await expect(uploadArea).toHaveClass(/border-blue-500/);
    
    // Simulate drag leave
    await uploadArea.dispatchEvent('dragleave');
  });

  test('should validate file types', async ({ page }) => {
    // Create a fake non-PDF file
    const fileInput = page.locator('input[type="file"]');
    
    // Try to upload a non-PDF file (simulate by checking validation)
    await page.evaluate(() => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        // Simulate file selection with wrong type
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Should show error message for invalid file type
    await expect(page.getByText(/Please select a PDF file/)).toBeVisible({ timeout: 5000 });
  });

  test('should show upload progress and convert PDF', async ({ page }) => {
    // Create a minimal PDF for testing
    const testPdfContent = createTestPdf();
    
    // Upload the test PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    // Should show upload progress
    await expect(page.getByText('Uploading...')).toBeVisible({ timeout: 5000 });
    
    // Wait for conversion to complete (increased timeout for backend processing)
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    
    // Should show the converted HTML
    await expect(page.locator('iframe')).toBeVisible();
    await expect(page.getByText('Edit & Export PDF')).toBeVisible();
  });

  test('should display conversion metadata', async ({ page }) => {
    const testPdfContent = createTestPdf();
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'sample.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    
    // Check metadata display
    await expect(page.getByText('sample.pdf')).toBeVisible();
    await expect(page.getByText(/Processing Time:/)).toBeVisible();
    await expect(page.getByText(/Assets:/)).toBeVisible();
    await expect(page.getByText(/HTML Size:/)).toBeVisible();
  });

  test('should handle conversion errors gracefully', async ({ page }) => {
    // Create an invalid/corrupted PDF
    const invalidPdf = Buffer.from('invalid pdf content');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'corrupted.pdf',
      mimeType: 'application/pdf',
      buffer: invalidPdf
    });
    
    // Should show error message
    await expect(page.getByText(/Error converting/)).toBeVisible({ timeout: 15000 });
  });

  test('should allow downloading HTML', async ({ page }) => {
    const testPdfContent = createTestPdf();
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'download-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    
    // Test download functionality
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Download HTML').click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toBe('download-test.html');
  });

  test('should copy HTML to clipboard', async ({ page }) => {
    const testPdfContent = createTestPdf();
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'clipboard-test.pdf',
      mimeType: 'application/pdf',  
      buffer: testPdfContent
    });
    
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-write']);
    
    await page.getByText('Copy HTML').click();
    await expect(page.getByText('HTML code copied to clipboard!')).toBeVisible();
  });
});

// Helper function to create a minimal valid PDF for testing
function createTestPdf(): Buffer {
  // This is a minimal PDF structure for testing purposes
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