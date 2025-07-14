export interface ServerPdfOptions {
  filename?: string;
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  scale?: number;
  width?: number;
  height?: number;
}

export interface ServerPdfResult {
  success: boolean;
  error?: string;
  downloadUrl?: string;
  filename?: string;
  fileSize?: number;
  processingTime?: number;
}

export class ServerPdfService {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate PDF using server-side Puppeteer
   */
  async generatePdf(
    htmlContent: string,
    options: ServerPdfOptions = {}
  ): Promise<ServerPdfResult> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Server PDF generation failed');
      }

      // Handle URL-based download
      if (result.downloadUrl) {
        const filename = result.filename || options.filename || 'document.pdf';
        
        // Create download link and trigger download
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { 
          success: true, 
          downloadUrl: result.downloadUrl,
          filename,
          fileSize: result.fileSize,
          processingTime: result.processingTime
        };
      } else {
        throw new Error('No download URL received from server');
      }

    } catch (error) {
      console.error('Server PDF generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF generation failed',
      };
    }
  }

  /**
   * Generate PDF from iframe content using server-side Puppeteer
   */
  async generatePdfFromIframe(
    iframe: HTMLIFrameElement,
    options: ServerPdfOptions = {}
  ): Promise<ServerPdfResult> {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) {
        throw new Error('Cannot access iframe content');
      }

      // Extract complete HTML document from iframe (including head, styles, etc.)
      const htmlContent = iframeDoc.documentElement.outerHTML || '<!DOCTYPE html>' + iframeDoc.documentElement.outerHTML;
      
      if (!htmlContent.trim()) {
        throw new Error('No content found in iframe');
      }

      return await this.generatePdf(htmlContent, options);

    } catch (error) {
      console.error('Iframe PDF generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Iframe PDF generation failed',
      };
    }
  }

  /**
   * Generate PDF from a specific element using server-side Puppeteer
   */
  async generatePdfFromElement(
    element: HTMLElement,
    options: ServerPdfOptions = {}
  ): Promise<ServerPdfResult> {
    try {
      if (!element) {
        throw new Error('Element is required');
      }

      // Extract HTML content from element
      const htmlContent = element.innerHTML;
      
      if (!htmlContent.trim()) {
        throw new Error('No content found in element');
      }

      return await this.generatePdf(htmlContent, options);

    } catch (error) {
      console.error('Element PDF generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Element PDF generation failed',
      };
    }
  }

  /**
   * Check if the PDF generation service is available
   */
  async checkHealth(): Promise<{ available: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });

      if (response.ok) {
        return { available: true };
      } else {
        return { 
          available: false, 
          error: `Service unavailable: ${response.status} ${response.statusText}` 
        };
      }

    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Service check failed',
      };
    }
  }
}