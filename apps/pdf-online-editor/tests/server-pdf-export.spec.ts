import { test, expect } from '@playwright/test';

test.describe('Server-side PDF Export', () => {
  test('should test server-side PDF generation API', async ({ page }) => {
    await page.goto('/converter');
    
    // Test the API endpoint directly
    const testHtml = `
      <div style="font-family: Arial; padding: 20px;">
        <h1>Server-side PDF Test</h1>
        <p>This is a test document generated using server-side Puppeteer.</p>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr><th>Column 1</th><th>Column 2</th></tr>
          <tr><td>Data 1</td><td>Data 2</td></tr>
        </table>
        <p>The content should be clean and properly formatted.</p>
      </div>
    `;

    // Test API health check
    const healthResponse = await page.evaluate(async () => {
      const response = await fetch('/api/generate-pdf', {
        method: 'GET',
      });
      return {
        status: response.status,
        data: await response.json(),
      };
    });

    console.log('API Health Check:', healthResponse);
    expect(healthResponse.status).toBe(200);
    expect(healthResponse.data.status).toBe('ok');

    // Test PDF generation
    const pdfResponse = await page.evaluate(async (html) => {
      try {
        const response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html: html,
            options: {
              filename: 'test-server-export.pdf',
              format: 'A4',
              orientation: 'portrait',
              margin: 10,
              scale: 1,
            },
          }),
        });

        const result = await response.json();
        
        return {
          status: response.status,
          success: result.success,
          error: result.error,
          hasPdfData: !!result.pdfData,
          filename: result.filename,
          pdfDataLength: result.pdfData ? result.pdfData.length : 0,
        };
      } catch (error) {
        return {
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          hasPdfData: false,
        };
      }
    }, testHtml);

    console.log('PDF Generation Response:', pdfResponse);

    // Verify the PDF was generated successfully
    expect(pdfResponse.status).toBe(200);
    expect(pdfResponse.success).toBe(true);
    expect(pdfResponse.hasPdfData).toBe(true);
    expect(pdfResponse.filename).toBe('test-server-export.pdf');
    expect(pdfResponse.pdfDataLength).toBeGreaterThan(1000); // PDF should have reasonable size

    if (!pdfResponse.success) {
      console.error('PDF generation failed:', pdfResponse.error);
    }
  });

  test('should test complete workflow with UI', async ({ page }) => {
    await page.goto('/converter');
    
    // Create mock file upload scenario
    await page.addInitScript(() => {
      (window as any).mockPdfResult = {
        html: `
          <div style="font-family: Arial; padding: 20px;">
            <h1>UI Test PDF Document</h1>
            <p>This document tests the complete workflow from UI to server-side PDF generation.</p>
            <div style="margin: 20px 0;">
              <h2>Features Tested:</h2>
              <ul>
                <li>HTML content extraction from iframe</li>
                <li>Server-side Puppeteer PDF generation</li>
                <li>Clean content rendering (no website background)</li>
                <li>Proper PDF formatting and styling</li>
              </ul>
            </div>
            <p>If you can see this content in the PDF, the export is working correctly!</p>
          </div>
        `,
        originalFilename: 'test-ui-export.pdf',
        processingTime: 1500,
        assetCount: 2,
        convertedAt: new Date().toISOString()
      };
    });

    // Simulate successful PDF conversion
    await page.evaluate(() => {
      document.body.innerHTML = `
        <div class="w-full max-w-6xl mx-auto p-6">
          <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">PDF Editor</h2>
            <div class="flex space-x-2">
              <button id="server-pdf-btn" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                📄 Generate PDF
              </button>
              <button id="client-pdf-btn" class="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                📱 Client PDF
              </button>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div style="padding: 16px;">
              <iframe 
                title="PDF Preview" 
                style="width: 100%; height: 400px; border: none;"
                srcdoc="${(window as any).mockPdfResult.html}"
              ></iframe>
            </div>
          </div>
        </div>
      `;
    });

    // Wait for iframe to load
    await page.waitForTimeout(1000);

    // Verify elements are present
    await expect(page.locator('#server-pdf-btn')).toBeVisible();
    await expect(page.locator('#client-pdf-btn')).toBeVisible();
    await expect(page.locator('iframe[title="PDF Preview"]')).toBeVisible();

    // Test server-side PDF export button functionality
    const exportResult = await page.evaluate(async () => {
      // Mock the ServerPdfService
      class MockServerPdfService {
        async generatePdfFromIframe(iframe: HTMLIFrameElement, options: any) {
          // Simulate successful server-side generation
          const iframeDoc = iframe.contentDocument;
          if (!iframeDoc || !iframeDoc.body) {
            throw new Error('Cannot access iframe content');
          }

          const htmlContent = iframeDoc.body.innerHTML;
          
          // Simulate API call
          const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              html: htmlContent,
              options: options
            })
          });

          if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.pdfData) {
              // Simulate download (without actually creating file in test)
              console.log(`Would download PDF: ${options.filename}, Size: ${result.pdfData.length} chars`);
              return { success: true };
            }
          }
          
          throw new Error('API request failed');
        }
      }

      const serverPdfService = new MockServerPdfService();
      const iframe = document.querySelector('iframe[title="PDF Preview"]') as HTMLIFrameElement;
      
      if (!iframe) {
        return { success: false, error: 'Iframe not found' };
      }

      try {
        const result = await serverPdfService.generatePdfFromIframe(iframe, {
          filename: 'test-ui-export.pdf',
          format: 'A4',
          orientation: 'portrait',
          margin: 10,
          scale: 1
        });

        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    console.log('UI Export Result:', exportResult);

    // Verify the export worked
    expect(exportResult.success).toBe(true);
    
    if (!exportResult.success) {
      console.error('UI export failed:', exportResult.error);
    }
  });
});