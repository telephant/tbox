export interface PrintToPdfOptions {
  filename?: string;
  paperSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margin?: string;
  scale?: number;
}

export interface PrintToPdfResult {
  success: boolean;
  error?: string;
}

export class PrintToPdfService {
  // Method 1: Browser's native print API (most reliable)
  async printHtmlToPdf(
    htmlContent: string,
    options: PrintToPdfOptions = {}
  ): Promise<PrintToPdfResult> {
    try {
      // Create a new window/iframe for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window. Please allow popups.');
      }

      const printCSS = `
        <style>
          @media print {
            @page {
              size: ${options.paperSize || 'A4'};
              margin: ${options.margin || '1cm'};
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.4;
              color: black !important;
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            * {
              box-sizing: border-box;
            }
            img {
              max-width: 100% !important;
              height: auto !important;
              page-break-inside: avoid;
            }
            table {
              page-break-inside: avoid;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 4px;
            }
            .no-print {
              display: none !important;
            }
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
            }
            p, div {
              orphans: 3;
              widows: 3;
            }
          }
          @media screen {
            body {
              font-family: Arial, sans-serif;
              line-height: 1.4;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
          }
        </style>
      `;

      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${options.filename || 'Document'}</title>
          ${printCSS}
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      printWindow.document.write(fullHtml);
      printWindow.document.close();

      // Wait for content to load
      return new Promise((resolve) => {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            
            // Close window after printing
            setTimeout(() => {
              printWindow.close();
            }, 1000);
            
            resolve({ success: true });
          }, 500);
        };
        
        // Fallback timeout
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          resolve({ success: true });
        }, 2000);
      });

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Print failed'
      };
    }
  }

  // Method 2: Download as HTML with print-optimized CSS
  downloadPrintableHtml(
    htmlContent: string,
    filename: string,
    options: PrintToPdfOptions = {}
  ): void {
    const printCSS = `
      <style>
        @media print {
          @page {
            size: ${options.paperSize || 'A4'};
            margin: ${options.margin || '1cm'};
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: black !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          * {
            box-sizing: border-box;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
            page-break-inside: avoid;
          }
          table {
            page-break-inside: avoid;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 4px;
          }
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
          }
          p, div {
            orphans: 3;
            widows: 3;
          }
        }
        @media screen {
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          .print-instructions {
            background: #f0f8ff;
            border: 2px solid #0066cc;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
        }
      </style>
    `;

    const instructions = `
      <div class="print-instructions">
        <h3>📄 How to save as PDF:</h3>
        <ol>
          <li>Press <strong>Ctrl+P</strong> (Windows) or <strong>Cmd+P</strong> (Mac)</li>
          <li>Select <strong>"Save as PDF"</strong> as destination</li>
          <li>Choose your preferred settings</li>
          <li>Click <strong>"Save"</strong></li>
        </ol>
        <p><em>This instruction box will not appear in the PDF.</em></p>
      </div>
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${filename}</title>
        ${printCSS}
      </head>
      <body>
        ${instructions}
        ${htmlContent}
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.pdf', '_printable.html');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Method 3: Open in new tab for manual PDF save
  openInNewTabForPdf(
    htmlContent: string,
    options: PrintToPdfOptions = {}
  ): void {
    const printCSS = `
      <style>
        @media print {
          @page {
            size: ${options.paperSize || 'A4'};
            margin: ${options.margin || '1cm'};
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: black !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        @media screen {
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          .pdf-instructions {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          }
        }
      </style>
    `;

    const instructions = `
      <div class="pdf-instructions">
        Press Ctrl+P to save as PDF
      </div>
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document - Ready for PDF</title>
        ${printCSS}
      </head>
      <body>
        ${instructions}
        ${htmlContent}
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Clean up the URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  }
}