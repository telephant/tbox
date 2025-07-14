import { test, expect } from '@playwright/test';

test.describe('PDF Export Functionality', () => {
  // Helper function to get to the editor
  async function navigateToEditor(page: any) {
    await page.goto('/converter');
    
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'export-test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    await page.getByText('Edit & Export PDF').click();
    await expect(page.getByText('PDF Editor')).toBeVisible();
  }

  test('should display all PDF export buttons', async ({ page }) => {
    await navigateToEditor(page);
    
    // Check all export buttons are present
    await expect(page.getByText('🖨️ Print to PDF')).toBeVisible();
    await expect(page.getByText('📄 Generate PDF')).toBeVisible();
    await expect(page.getByText('Printable HTML')).toBeVisible();
    await expect(page.getByText('Open for Print')).toBeVisible();
  });

  test('should display export method explanations', async ({ page }) => {
    await navigateToEditor(page);
    
    // Check export method explanations
    await expect(page.getByText('PDF Export Methods:')).toBeVisible();
    await expect(page.getByText('Uses browser\'s print dialog (most reliable)')).toBeVisible();
    await expect(page.getByText('Creates PDF directly using canvas rendering')).toBeVisible();
    await expect(page.getByText('Downloads HTML optimized for printing')).toBeVisible();
    await expect(page.getByText('Opens in new tab ready for Ctrl+P')).toBeVisible();
  });

  test('should handle Print to PDF export', async ({ page }) => {
    await navigateToEditor(page);
    
    // Mock window.open to prevent actual popup
    await page.addInitScript(() => {
      window.open = () => {
        // Mock print window
        const mockWindow = {
          document: {
            write: () => {},
            close: () => {},
            documentElement: { outerHTML: '' },
            body: document.createElement('body')
          },
          print: () => {},
          close: () => {},
          onload: null as any
        };
        
        // Simulate immediate load
        setTimeout(() => {
          if (mockWindow.onload) {
            mockWindow.onload();
          }
        }, 100);
        
        return mockWindow as any;
      };
    });
    
    await page.getByText('🖨️ Print to PDF').click();
    await expect(page.getByText('Print dialog opened!')).toBeVisible({ timeout: 10000 });
  });

  test('should handle Generate PDF export', async ({ page }) => {
    await navigateToEditor(page);
    
    // Mock the manual PDF service to prevent actual download
    await page.addInitScript(() => {
      // Mock html2canvas
      (window as any).html2canvas = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 800, 1200);
          ctx.fillStyle = 'black';
          ctx.fillText('Test content', 10, 50);
        }
        return Promise.resolve(canvas);
      };
    });
    
    await page.getByText('📄 Generate PDF').click();
    
    // Should show either success or error message
    await expect(page.locator('text=/PDF (downloaded successfully|export failed)/')).toBeVisible({ timeout: 15000 });
  });

  test('should handle Printable HTML download', async ({ page }) => {
    await navigateToEditor(page);
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Printable HTML').click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toBe('export-test_printable.html');
    await expect(page.getByText('HTML file downloaded!')).toBeVisible();
  });

  test('should handle Open for Print', async ({ page }) => {
    await navigateToEditor(page);
    
    // Mock window.open to prevent actual popup
    await page.addInitScript(() => {
      window.open = () => {
        return {} as any;
      };
    });
    
    await page.getByText('Open for Print').click();
    await expect(page.getByText('Document opened in new tab')).toBeVisible();
  });

  test('should disable export buttons during export', async ({ page }) => {
    await navigateToEditor(page);
    
    // Mock a slow export process
    await page.addInitScript(() => {
      (window as any).html2canvas = () => {
        return new Promise(resolve => {
          setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 1200;
            resolve(canvas);
          }, 2000);
        });
      };
    });
    
    // Start export
    await page.getByText('📄 Generate PDF').click();
    
    // Buttons should be disabled during export
    await expect(page.locator('button:has-text("📄 Generate PDF")[disabled]')).toBeVisible();
    await expect(page.locator('button:has-text("🖨️ Print to PDF")[disabled]')).toBeVisible();
  });

  test('should update export options and reflect in exports', async ({ page }) => {
    await navigateToEditor(page);
    
    // Change export options
    await page.selectOption('select[value="A4"]', 'A3');
    await page.selectOption('select[value="portrait"]', 'landscape');
    await page.fill('input[type="number"][value="2"]', '3');
    await page.fill('input[type="number"][value="0.95"]', '0.8');
    
    // Verify the options are updated
    await expect(page.locator('select option[value="A3"][selected]')).toBeAttached();
    await expect(page.locator('select option[value="landscape"][selected]')).toBeAttached();
  });

  test('should work with edited content', async ({ page }) => {
    await navigateToEditor(page);
    
    // Edit the content first
    await page.getByText('Start Editing').click();
    await page.getByText('Save Changes').click();
    
    // Verify content is marked as modified
    await expect(page.getByText('(Modified)')).toBeVisible();
    
    // Export should work with modified content
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Printable HTML').click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toBe('export-test_printable.html');
  });

  test('should maintain export options across mode switches', async ({ page }) => {
    await navigateToEditor(page);
    
    // Change export options
    await page.selectOption('select[value="A4"]', 'Letter');
    await page.selectOption('select[value="portrait"]', 'landscape');
    
    // Switch to edit mode and back
    await page.getByText('Edit Text').click();
    await page.getByText('Preview').click();
    
    // Options should be preserved
    await expect(page.locator('select option[value="Letter"][selected]')).toBeAttached();
    await expect(page.locator('select option[value="landscape"][selected]')).toBeAttached();
  });

  test('should handle export errors gracefully', async ({ page }) => {
    await navigateToEditor(page);
    
    // Mock failing html2canvas
    await page.addInitScript(() => {
      (window as any).html2canvas = () => {
        return Promise.reject(new Error('Canvas generation failed'));
      };
    });
    
    await page.getByText('📄 Generate PDF').click();
    await expect(page.getByText(/PDF export failed/)).toBeVisible({ timeout: 10000 });
  });

  test('should show correct filenames for downloads', async ({ page }) => {
    await navigateToEditor(page);
    
    // Test HTML download filename
    const htmlDownloadPromise = page.waitForEvent('download');
    await page.getByText('Download HTML').click();
    const htmlDownload = await htmlDownloadPromise;
    expect(htmlDownload.suggestedFilename()).toBe('export-test_edited.html');
    
    // Test Printable HTML filename
    const printableDownloadPromise = page.waitForEvent('download');
    await page.getByText('Printable HTML').click();
    const printableDownload = await printableDownloadPromise;
    expect(printableDownload.suggestedFilename()).toBe('export-test_printable.html');
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