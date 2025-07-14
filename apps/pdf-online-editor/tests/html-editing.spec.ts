import { test, expect } from '@playwright/test';

test.describe('HTML Editing Functionality', () => {
  // Helper function to get to the editor
  async function navigateToEditor(page: any) {
    await page.goto('/converter');
    
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'edit-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    await page.getByText('Edit & Export PDF').click();
    await expect(page.getByText('PDF Editor')).toBeVisible();
  }

  test('should display editor interface correctly', async ({ page }) => {
    await navigateToEditor(page);
    
    // Check main editor elements
    await expect(page.getByText('PDF Editor')).toBeVisible();
    await expect(page.getByText('Preview')).toBeVisible();
    await expect(page.getByText('Edit Text')).toBeVisible();
    await expect(page.getByText('HTML Code')).toBeVisible();
    await expect(page.getByText('Fullscreen')).toBeVisible();
  });

  test('should switch between view modes', async ({ page }) => {
    await navigateToEditor(page);
    
    // Test Preview mode (default)
    await page.getByText('Preview').click();
    await expect(page.getByText('HTML Preview')).toBeVisible();
    await expect(page.locator('iframe')).toBeVisible();
    
    // Test Edit mode
    await page.getByText('Edit Text').click();
    await expect(page.getByText('Editing Mode')).toBeVisible();
    await expect(page.getByText('Click on any text to edit')).toBeVisible();
    
    // Test Code mode
    await page.getByText('HTML Code').click();
    await expect(page.getByText('HTML Source Code')).toBeVisible();
    await expect(page.locator('pre code')).toBeVisible();
  });

  test('should enable editing mode', async ({ page }) => {
    await navigateToEditor(page);
    
    // Start editing
    await page.getByText('Start Editing').click();
    await expect(page.getByText('Editing...')).toBeVisible();
    await expect(page.getByText('Save Changes')).toBeVisible();
    await expect(page.getByText('Discard')).toBeVisible();
  });

  test('should save and discard changes', async ({ page }) => {
    await navigateToEditor(page);
    
    // Start editing
    await page.getByText('Start Editing').click();
    
    // Save changes
    await page.getByText('Save Changes').click();
    await expect(page.getByText('(Modified)')).toBeVisible();
    
    // Start editing again
    await page.getByText('Start Editing').click();
    
    // Discard changes
    await page.getByText('Discard').click();
    await expect(page.getByText('(Modified)')).not.toBeVisible();
  });

  test('should toggle fullscreen mode', async ({ page }) => {
    await navigateToEditor(page);
    
    // Enter fullscreen
    await page.getByText('Fullscreen').click();
    await expect(page.getByText('Exit Fullscreen')).toBeVisible();
    
    // Exit fullscreen
    await page.getByText('Exit Fullscreen').click();
    await expect(page.getByText('Fullscreen')).toBeVisible();
  });

  test('should copy HTML code', async ({ page }) => {
    await navigateToEditor(page);
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-write']);
    
    await page.getByText('Copy HTML').click();
    await expect(page.getByText('HTML code copied to clipboard!')).toBeVisible();
  });

  test('should download edited HTML', async ({ page }) => {
    await navigateToEditor(page);
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Download HTML').click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toBe('edit-test_edited.html');
  });

  test('should display document information', async ({ page }) => {
    await navigateToEditor(page);
    
    // Check document info section
    await expect(page.getByText('Document Information')).toBeVisible();
    await expect(page.getByText('edit-test.pdf')).toBeVisible();
    await expect(page.getByText('Original')).toBeVisible();
    await expect(page.getByText(/\d+ files/)).toBeVisible(); // Assets count
    await expect(page.getByText(/\d+.\d+ KB/)).toBeVisible(); // HTML size
  });

  test('should show modification status', async ({ page }) => {
    await navigateToEditor(page);
    
    // Initially should show "Original"
    await expect(page.getByText('Original')).toBeVisible();
    
    // After editing, should show "Modified"
    await page.getByText('Start Editing').click();
    await page.getByText('Save Changes').click();
    await expect(page.getByText('Modified')).toBeVisible();
  });

  test('should display export options in preview mode', async ({ page }) => {
    await navigateToEditor(page);
    
    // Should see export options
    await expect(page.getByText('PDF Export Options')).toBeVisible();
    await expect(page.getByText('Page Size')).toBeVisible();
    await expect(page.getByText('Orientation')).toBeVisible();
    await expect(page.getByText('Quality Scale')).toBeVisible();
    await expect(page.getByText('Quality')).toBeVisible();
  });

  test('should update export options', async ({ page }) => {
    await navigateToEditor(page);
    
    // Change page size
    await page.selectOption('select[value="A4"]', 'A3');
    
    // Change orientation
    await page.selectOption('select[value="portrait"]', 'landscape');
    
    // Change quality scale
    await page.fill('input[value="2"]', '3');
    
    // Change quality
    await page.fill('input[value="0.95"]', '0.8');
    
    // Verify changes are reflected (values should be updated)
    await expect(page.locator('select[value="A3"]')).toBeVisible();
    await expect(page.locator('select[value="landscape"]')).toBeVisible();
  });

  test('should hide export options during editing', async ({ page }) => {
    await navigateToEditor(page);
    
    // Export options should be visible initially
    await expect(page.getByText('PDF Export Options')).toBeVisible();
    
    // Start editing
    await page.getByText('Start Editing').click();
    
    // Export options should be hidden during editing
    await expect(page.getByText('PDF Export Options')).not.toBeVisible();
  });

  test('should navigate back to conversion page', async ({ page }) => {
    await navigateToEditor(page);
    
    await page.getByText('← Back').click();
    await expect(page.getByText('Conversion Complete')).toBeVisible();
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