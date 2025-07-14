// Import html2pdf.js with type declaration
declare const html2pdf: any;

export interface HtmlToPdfOptions {
  margin?: number | [number, number] | [number, number, number, number];
  filename?: string;
  image?: {
    type?: 'jpeg' | 'png' | 'webp';
    quality?: number;
  };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    scrollX?: number;
    scrollY?: number;
    windowWidth?: number;
    windowHeight?: number;
  };
  jsPDF?: {
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    format?: 'a4' | 'a3' | 'letter' | 'legal' | [number, number];
    orientation?: 'portrait' | 'landscape';
    compress?: boolean;
  };
  pagebreak?: {
    mode?: 'avoid-all' | 'css' | 'legacy';
    before?: string;
    after?: string;
    avoid?: string;
  };
}

export interface HtmlToPdfResult {
  success: boolean;
  error?: string;
}

export class HtmlToPdfConverter {
  private loadHtml2Pdf(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).html2pdf) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        console.log('html2pdf.js loaded successfully');
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load html2pdf.js'));
      document.head.appendChild(script);
    });
  }

  // Simple test method to verify html2pdf.js is working
  async testPdfGeneration(): Promise<HtmlToPdfResult> {
    try {
      await this.loadHtml2Pdf();
      
      const testHtml = `
        <div style="padding: 20px; background: white; color: black;">
          <h1>Test PDF Generation</h1>
          <p>This is a test to verify PDF generation is working.</p>
          <p>Current time: ${new Date().toLocaleString()}</p>
        </div>
      `;

      const result = await this.convertHtmlStringToPdf(testHtml, 'test.pdf');
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      };
    }
  }

  async convertElementToPdf(
    element: HTMLElement,
    filename: string,
    options: HtmlToPdfOptions = {}
  ): Promise<HtmlToPdfResult> {
    try {
      await this.loadHtml2Pdf();

      const defaultOptions = {
        margin: 10,
        filename: filename || 'document.pdf',
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { 
          mode: 'avoid-all'
        }
      };

      const mergedOptions = {
        ...defaultOptions,
        ...options,
        filename: filename || defaultOptions.filename,
        image: { ...defaultOptions.image, ...options.image },
        html2canvas: { ...defaultOptions.html2canvas, ...options.html2canvas },
        jsPDF: { ...defaultOptions.jsPDF, ...options.jsPDF },
        pagebreak: { ...defaultOptions.pagebreak, ...options.pagebreak }
      };

      await (window as any).html2pdf().set(mergedOptions).from(element).save();

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Simplified conversion method for complex HTML
  async convertHtmlStringToPdfSimple(
    htmlString: string,
    filename: string,
    options: HtmlToPdfOptions = {}
  ): Promise<HtmlToPdfResult> {
    try {
      await this.loadHtml2Pdf();

      // Create a simple container div with the content
      const container = document.createElement('div');
      container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 800px;
        background: white;
        color: black;
        font-family: Arial, sans-serif;
        padding: 20px;
        line-height: 1.4;
      `;
      
      // Extract text content and basic structure
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlString;
      
      // Remove scripts and problematic elements
      const scripts = tempDiv.querySelectorAll('script, noscript, style');
      scripts.forEach(el => el.remove());
      
      // Set the cleaned content
      container.innerHTML = tempDiv.innerHTML;
      
      document.body.appendChild(container);

      const pdfOptions = {
        margin: 10,
        filename: filename || 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      console.log('Converting with simple method...', container);
      
      await (window as any).html2pdf()
        .set(pdfOptions)
        .from(container)
        .save();

      document.body.removeChild(container);

      return { success: true };
    } catch (error) {
      console.error('Simple PDF conversion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async convertHtmlStringToPdf(
    htmlString: string,
    filename: string,
    options: HtmlToPdfOptions = {}
  ): Promise<HtmlToPdfResult> {
    try {
      await this.loadHtml2Pdf();

      // Clean up the HTML string - remove any script tags and make it PDF-friendly
      let cleanHtml = htmlString;
      
      // Remove script tags that might interfere
      cleanHtml = cleanHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // Ensure we have a complete HTML document
      if (!cleanHtml.includes('<html')) {
        cleanHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: white;
                color: black;
              }
              * { 
                box-sizing: border-box; 
              }
              img { 
                max-width: 100%; 
                height: auto; 
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
              }
            </style>
          </head>
          <body>
            ${cleanHtml}
          </body>
          </html>
        `;
      }

      // Create a temporary iframe for better rendering
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);

      // Write content to iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }

      iframeDoc.open();
      iframeDoc.write(cleanHtml);
      iframeDoc.close();

      // Wait for iframe to load completely
      await new Promise<void>((resolve) => {
        if (iframe.contentWindow) {
          iframe.onload = () => {
            // Give additional time for CSS and images to load
            setTimeout(() => resolve(), 1000);
          };
          // Fallback timeout
          setTimeout(() => resolve(), 3000);
        } else {
          resolve();
        }
      });

      const defaultOptions = {
        margin: 15,
        filename: filename || 'document.pdf',
        image: { 
          type: 'jpeg', 
          quality: 0.95 
        },
        html2canvas: { 
          scale: 1.5,
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { 
          mode: 'avoid-all'
        }
      };

      const mergedOptions = {
        ...defaultOptions,
        ...options,
        filename: filename || defaultOptions.filename,
        image: { ...defaultOptions.image, ...options.image },
        html2canvas: { ...defaultOptions.html2canvas, ...options.html2canvas },
        jsPDF: { ...defaultOptions.jsPDF, ...options.jsPDF },
        pagebreak: { ...defaultOptions.pagebreak, ...options.pagebreak }
      };

      // Use iframe body as the source for PDF generation
      const sourceElement = iframeDoc.body;
      
      console.log('Converting element to PDF...', sourceElement);
      
      await (window as any).html2pdf()
        .set(mergedOptions)
        .from(sourceElement)
        .save();

      // Clean up
      document.body.removeChild(iframe);

      return {
        success: true
      };
    } catch (error) {
      console.error('PDF conversion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}