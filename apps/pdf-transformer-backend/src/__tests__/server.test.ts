import request from 'supertest';
import app from '../server';
import fs from 'fs';
import path from 'path';
import { PdfConverter } from '../lib/pdf-converter';

// Mock the PdfConverter
jest.mock('../lib/pdf-converter');

describe('PDF Transformer API', () => {
  const mockHtmlContent = '<html><body>Converted PDF Content</body></html>';
  const mockConversionResult = {
    html: mockHtmlContent,
    originalFilename: 'test.pdf',
    convertedAt: new Date().toISOString(),
    processingTime: 1500
  };

  afterAll(async () => {
    // No need to close server as it's not started in test environment
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock PdfConverter methods
    (PdfConverter as jest.MockedClass<typeof PdfConverter>).prototype.convertToHtml
      .mockResolvedValue(mockConversionResult);
    
    (PdfConverter as jest.MockedClass<typeof PdfConverter>).prototype.cleanup
      .mockResolvedValue();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /convert', () => {
    const testPdfPath = path.join(__dirname, 'fixtures', 'test.pdf');
    
    beforeAll(() => {
      // Create test PDF file
      const fixturesDir = path.join(__dirname, 'fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      
      // Create a minimal PDF file for testing
      const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 0 /Kids [] >>\nendobj\nxref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n116\n%%EOF');
      fs.writeFileSync(testPdfPath, pdfContent);
    });

    afterAll(() => {
      // Cleanup test file
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath);
      }
      
      const fixturesDir = path.join(__dirname, 'fixtures');
      if (fs.existsSync(fixturesDir)) {
        fs.rmdirSync(fixturesDir);
      }
    });

    it('should successfully convert PDF to HTML', async () => {
      const response = await request(app)
        .post('/convert')
        .attach('file', testPdfPath)
        .expect(200);

      expect(response.body).toEqual(mockConversionResult);
      expect(PdfConverter.prototype.convertToHtml).toHaveBeenCalled();
      expect(PdfConverter.prototype.cleanup).toHaveBeenCalled();
    });

    it('should handle custom conversion options', async () => {
      const response = await request(app)
        .post('/convert')
        .attach('file', testPdfPath)
        .field('splitPages', 'true')
        .field('zoom', '1.5')
        .field('dpi', '300')
        .field('embedFonts', 'false')
        .expect(200);

      expect(PdfConverter.prototype.convertToHtml).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          splitPages: true,
          zoom: 1.5,
          dpi: 300,
          embedFonts: false,
          embedImages: true,
          embedJavascript: true,
          embedOutline: true
        })
      );
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .post('/convert')
        .expect(400);

      expect(response.body).toEqual({ error: 'No file uploaded' });
    });

    it('should return 400 for non-PDF files', async () => {
      const txtPath = path.join(__dirname, 'fixtures', 'test.txt');
      fs.writeFileSync(txtPath, 'This is not a PDF');

      const response = await request(app)
        .post('/convert')
        .attach('file', txtPath)
        .expect(400);

      expect(response.body).toEqual({ error: 'Only PDF files are allowed' });

      fs.unlinkSync(txtPath);
    });

    it('should return 400 for files exceeding size limit', async () => {
      // This would require creating a large file, so we'll test the multer error handler
      const response = await request(app)
        .post('/convert')
        .attach('file', Buffer.alloc(51 * 1024 * 1024), 'large.pdf') // 51MB
        .expect(400);

      expect(response.body.error).toContain('File size too large');
    });

    it('should handle conversion errors', async () => {
      (PdfConverter as jest.MockedClass<typeof PdfConverter>).prototype.convertToHtml
        .mockRejectedValue(new Error('Docker container failed'));

      const response = await request(app)
        .post('/convert')
        .attach('file', testPdfPath)
        .expect(500);

      expect(response.body).toEqual({
        error: 'PDF conversion failed',
        details: 'Docker container failed'
      });

      expect(PdfConverter.prototype.cleanup).toHaveBeenCalled();
    });
  });

  describe('Error handling middleware', () => {
    it('should handle unexpected errors', async () => {
      // Force an error by sending invalid data
      const response = await request(app)
        .post('/convert')
        .send({ invalid: 'data' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});