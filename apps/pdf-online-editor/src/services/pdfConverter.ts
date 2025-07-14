export interface ConversionOptions {
  embedFonts?: boolean;
  embedImages?: boolean;
  embedJavascript?: boolean;
  embedOutline?: boolean;
  splitPages?: boolean;
  zoom?: number;
  dpi?: number;
}

export interface ConversionResult {
  html: string;
  originalFilename: string;
  convertedAt: string;
  processingTime: number;
  conversionId: string;
  assetCount: number;
}

export interface ConversionError {
  error: string;
  details?: string;
}

export class PdfConverterService {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async convertPdfToHtml(
    file: File,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    const formData = new FormData();
    formData.append('file', file);

    // Add conversion options to form data
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    try {
      const response = await fetch(`${this.baseUrl}/convert`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data as ConversionResult;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`PDF conversion failed: ${error.message}`);
      }
      throw new Error('PDF conversion failed: Unknown error');
    }
  }

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw new Error('Backend service is not available');
    }
  }
}