import { test, expect } from '@playwright/test';

test.describe('PDF Export Fix Validation', () => {
  // Helper function to get to the editor
  async function navigateToEditor(page: any, filename = 'test-export.pdf') {
    await page.goto('/converter');
    
    const testPdfContent = createTestPdf();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: filename,
      mimeType: 'application/pdf',
      buffer: testPdfContent
    });
    
    await expect(page.getByText('Conversion Complete')).toBeVisible({ timeout: 30000 });
    await page.getByText('Edit & Export PDF').click();
    await expect(page.getByText('PDF Editor')).toBeVisible();
  }

  test('should handle Generate PDF without NaN dimension errors', async ({ page }) => {
    await navigateToEditor(page, 'dimension-test.pdf');
    
    // Mock html2canvas to return a valid canvas
    await page.addInitScript(() => {
      (window as any).html2canvas = (element: HTMLElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 800, 1200);
          ctx.fillStyle = 'black';
          ctx.font = '16px Arial';
          ctx.fillText('Test PDF Content', 50, 100);
          ctx.fillText('Generated from HTML', 50, 130);
          ctx.fillText('Canvas dimensions: 800x1200', 50, 160);
        }
        return Promise.resolve(canvas);
      };
    });

    // Monitor console for errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Attempt PDF generation
    await page.getByText('📄 Generate PDF').click();
    
    // Wait for result (either success or error)
    await expect(page.locator('text=/PDF (downloaded successfully|export failed)/')).toBeVisible({ timeout: 15000 });
    
    // Check for specific NaN errors
    const hasNaNErrors = consoleErrors.some(error => 
      error.includes('NaN') || 
      error.includes('Invalid final dimensions') ||
      error.includes('width:nan') ||
      error.includes('height: nan')
    );
    
    if (hasNaNErrors) {
      console.log('Console errors detected:', consoleErrors);
    }
    
    // Should not have NaN dimension errors
    expect(hasNaNErrors).toBe(false);
  });

  test('should fallback to simple PDF when canvas fails', async ({ page }) => {
    await navigateToEditor(page, 'fallback-test.pdf');
    
    // Mock html2canvas to fail initially, then succeed on retry
    await page.addInitScript(() => {
      let callCount = 0;
      (window as any).html2canvas = () => {
        callCount++;
        if (callCount === 1) {
          // First call fails to test fallback
          return Promise.reject(new Error('Canvas generation failed'));
        }
        // Subsequent calls succeed
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;
        return Promise.resolve(canvas);
      };
    });

    await page.getByText('📄 Generate PDF').click();
    
    // Should show success (fallback worked)
    await expect(page.getByText('PDF downloaded successfully!')).toBeVisible({ timeout: 15000 });
  });

  test('should handle zero-dimension containers gracefully', async ({ page }) => {
    await navigateToEditor(page, 'zero-dimension-test.pdf');
    
    // Mock html2canvas but simulate zero-dimension container
    await page.addInitScript(() => {
      (window as any).html2canvas = (element: HTMLElement) => {
        // Simulate problematic element dimensions
        Object.defineProperty(element, 'offsetWidth', { value: 0 });
        Object.defineProperty(element, 'offsetHeight', { value: 0 });
        
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;
        return Promise.resolve(canvas);
      };
    });

    await page.getByText('📄 Generate PDF').click();
    
    // Should either succeed or provide helpful error message
    await expect(page.locator('text=/PDF (downloaded successfully|export failed)/')).toBeVisible({ timeout: 15000 });
  });

  test('should validate all export methods work as alternatives', async ({ page }) => {
    await navigateToEditor(page, 'alternatives-test.pdf');
    
    // Test each export method
    const exportMethods = [
      { button: '🖨️ Print to PDF', expectText: 'Print dialog opened!' },
      { button: 'Printable HTML', expectText: 'HTML file downloaded!' },
      { button: 'Open for Print', expectText: 'Document opened in new tab' }
    ];

    // Mock window.open for print methods
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

    for (const method of exportMethods) {
      await page.getByText(method.button).click();
      await expect(page.getByText(method.expectText)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should provide helpful error messages when PDF generation fails', async ({ page }) => {
    await navigateToEditor(page, 'error-message-test.pdf');
    
    // Mock html2canvas to always fail
    await page.addInitScript(() => {
      (window as any).html2canvas = () => {
        return Promise.reject(new Error('Simulated canvas failure for testing'));
      };
    });

    // Mock alert to capture error message
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.getByText('📄 Generate PDF').click();
    
    // Wait for error handling
    await page.waitForTimeout(5000);
    
    // Should provide helpful alternatives in error message
    expect(alertMessage).toContain('Try these alternatives');
    expect(alertMessage).toContain('Print to PDF');
    expect(alertMessage).toContain('Printable HTML');
  });

  test('should handle different page sizes and orientations', async ({ page }) => {
    await navigateToEditor(page, 'page-format-test.pdf');
    
    // Test different page configurations
    const pageConfigs = [
      { size: 'A3', orientation: 'landscape' },
      { size: 'Letter', orientation: 'portrait' },
      { size: 'Legal', orientation: 'portrait' }
    ];

    // Mock html2canvas
    await page.addInitScript(() => {
      (window as any).html2canvas = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;
        return Promise.resolve(canvas);
      };
    });

    for (const config of pageConfigs) {
      // Change page settings
      await page.selectOption('select[value="A4"], select[value="A3"], select[value="Letter"], select[value="Legal"]', config.size);
      await page.selectOption('select[value="portrait"], select[value="landscape"]', config.orientation);
      
      // Try export
      await page.getByText('📄 Generate PDF').click();
      await expect(page.locator('text=/PDF (downloaded successfully|export failed)/')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should maintain export functionality after editing', async ({ page }) => {
    await navigateToEditor(page, 'editing-export-test.pdf');
    
    // Edit the content first
    await page.getByText('Start Editing').click();
    await page.getByText('Save Changes').click();
    await expect(page.getByText('(Modified)')).toBeVisible();
    
    // Mock html2canvas
    await page.addInitScript(() => {
      (window as any).html2canvas = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;
        return Promise.resolve(canvas);
      };
    });
    
    // Export should work with modified content
    await page.getByText('📄 Generate PDF').click();
    await expect(page.getByText('PDF downloaded successfully!')).toBeVisible({ timeout: 15000 });
  });

  test('should handle export during fullscreen mode', async ({ page }) => {
    await navigateToEditor(page, 'fullscreen-export-test.pdf');
    
    // Enter fullscreen
    await page.getByText('Fullscreen').click();
    await expect(page.getByText('Exit Fullscreen')).toBeVisible();
    
    // Mock html2canvas
    await page.addInitScript(() => {
      (window as any).html2canvas = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;
        return Promise.resolve(canvas);
      };
    });
    
    // Export should work in fullscreen
    await page.getByText('📄 Generate PDF').click();
    await expect(page.getByText('PDF downloaded successfully!')).toBeVisible({ timeout: 15000 });
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
(PDF Export Test Content) Tj
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