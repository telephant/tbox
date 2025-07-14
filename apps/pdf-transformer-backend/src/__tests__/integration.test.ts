import { PdfConverter } from '../lib/pdf-converter';
import fs from 'fs/promises';
import path from 'path';
import request from 'supertest';
import app from '../server';

describe('PDF Conversion Integration Tests', () => {
  const testPdfPath = path.join(__dirname, 'fixtures', 'test.pdf');
  const uploadsDir = path.join(__dirname, '../../uploads');

  beforeAll(async () => {
    // Create test fixtures directory
    const fixturesDir = path.join(__dirname, 'fixtures');
    await fs.mkdir(fixturesDir, { recursive: true });

    // Use the same test PDF from the main directory
    const mainTestPdfPath = path.join(__dirname, '../../test.pdf');
    
    try {
      // Copy the test PDF to fixtures
      const testPdfContent = await fs.readFile(mainTestPdfPath);
      await fs.writeFile(testPdfPath, testPdfContent);
    } catch (error) {
      // If main test PDF doesn't exist, create a simple one
      const testPdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Contents 4 0 R /MediaBox [0 0 612 792] >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
72 720 Td
(Hello World!) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000188 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
280
%%EOF`;

      await fs.writeFile(testPdfPath, testPdfContent);
    }
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.unlink(testPdfPath);
      await fs.rmdir(path.dirname(testPdfPath));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Backend Service Integration', () => {
    it('should have Docker available', async () => {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      try {
        await execAsync('docker --version');
      } catch (error) {
        throw new Error('Docker is not available. Please install Docker to run PDF conversion tests.');
      }
    });

    it('should convert PDF using PdfConverter service', async () => {
      // Copy test file to uploads directory for this test
      const uploadsTestPdfPath = path.join(uploadsDir, 'service-test.pdf');
      const testPdfContent = await fs.readFile(testPdfPath);
      await fs.writeFile(uploadsTestPdfPath, testPdfContent);
      
      const converter = new PdfConverter(uploadsDir);
      
      try {
        const result = await converter.convertToHtml(uploadsTestPdfPath);
        
        expect(result).toBeDefined();
        expect(result.html).toContain('<!DOCTYPE html>');
        expect(result.html).toContain('pdf2htmlEX');
        expect(result.originalFilename).toBe('service-test.pdf');
        expect(result.processingTime).toBeGreaterThan(0);
        expect(result.convertedAt).toBeDefined();
      } finally {
        // Clean up
        try {
          await fs.unlink(uploadsTestPdfPath);
        } catch {}
      }
    });

    it('should handle conversion options correctly', async () => {
      // Copy test file to uploads directory for this test
      const uploadsTestPdfPath = path.join(uploadsDir, 'options-test.pdf');
      const testPdfContent = await fs.readFile(testPdfPath);
      await fs.writeFile(uploadsTestPdfPath, testPdfContent);
      
      const converter = new PdfConverter(uploadsDir);
      
      const options = {
        embedFonts: true,
        embedImages: true,
        embedJavascript: false,
        zoom: 1.5
      };
      
      try {
        const result = await converter.convertToHtml(uploadsTestPdfPath, options);
        
        expect(result).toBeDefined();
        expect(result.html).toContain('<!DOCTYPE html>');
        expect(result.processingTime).toBeGreaterThan(0);
      } finally {
        // Clean up
        try {
          await fs.unlink(uploadsTestPdfPath);
        } catch {}
      }
    });
  });

  describe('API Endpoints Integration', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should convert PDF via API endpoint', async () => {
      const response = await request(app)
        .post('/convert')
        .attach('file', testPdfPath)
        .expect(200);

      expect(response.body).toHaveProperty('html');
      expect(response.body).toHaveProperty('originalFilename');
      expect(response.body).toHaveProperty('convertedAt');
      expect(response.body).toHaveProperty('processingTime');
      
      expect(response.body.html).toContain('<!DOCTYPE html>');
      expect(response.body.html).toContain('pdf2htmlEX');
      expect(response.body.processingTime).toBeGreaterThan(0);
    });

    it('should handle conversion options via API', async () => {
      const response = await request(app)
        .post('/convert')
        .attach('file', testPdfPath)
        .field('embedFonts', 'true')
        .field('embedImages', 'false')
        .field('zoom', '1.5')
        .expect(200);

      expect(response.body).toHaveProperty('html');
      expect(response.body.html).toContain('<!DOCTYPE html>');
    });

    it('should reject non-PDF files', async () => {
      // Create a fake text file
      const textPath = path.join(__dirname, 'fixtures', 'test.txt');
      await fs.writeFile(textPath, 'This is not a PDF');

      const response = await request(app)
        .post('/convert')
        .attach('file', textPath)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Only PDF files are allowed');

      // Clean up
      await fs.unlink(textPath);
    });

    it('should handle missing file', async () => {
      const response = await request(app)
        .post('/convert')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No file uploaded');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid PDF files gracefully', async () => {
      // Create an invalid PDF file
      const invalidPdfPath = path.join(__dirname, 'fixtures', 'invalid.pdf');
      await fs.writeFile(invalidPdfPath, 'This is not a valid PDF content');

      const response = await request(app)
        .post('/convert')
        .attach('file', invalidPdfPath)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('PDF conversion failed');

      // Clean up
      await fs.unlink(invalidPdfPath);
    });
  });

  describe('Performance Tests', () => {
    it('should complete conversion within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/convert')
        .attach('file', testPdfPath)
        .expect(200);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within 10 seconds
      expect(totalTime).toBeLessThan(10000);
      expect(response.body.processingTime).toBeLessThan(5000);
    });
  });
});