import { PdfConverter } from '../pdf-converter';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

jest.mock('child_process');
jest.mock('fs/promises');

describe('PdfConverter', () => {
  let pdfConverter: PdfConverter;
  const uploadsDir = '/tmp/test-uploads';
  const mockPdfPath = '/tmp/test-uploads/test.pdf';
  const mockHtmlPath = '/tmp/test-uploads/test.html';
  const mockHtmlContent = '<html><body>Test PDF Content</body></html>';

  beforeEach(() => {
    pdfConverter = new PdfConverter(uploadsDir);
    jest.clearAllMocks();
  });

  describe('convertToHtml', () => {
    it('should successfully convert PDF to HTML with default options', async () => {
      // Mock exec to simulate successful conversion
      (exec as unknown as jest.Mock).mockImplementation((cmd, callback) => {
        callback(null, 'Processing PDF...', '');
      });

      // Mock file read
      (fs.readFile as jest.Mock).mockResolvedValue(mockHtmlContent);
      
      // Mock file unlink
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const result = await pdfConverter.convertToHtml(mockPdfPath);

      expect(result.html).toBe(mockHtmlContent);
      expect(result.originalFilename).toBe('test.pdf');
      expect(result.convertedAt).toBeDefined();
      expect(result.processingTime).toBeGreaterThanOrEqual(0);

      // Verify cleanup was called
      expect(fs.unlink).toHaveBeenCalledWith(mockHtmlPath);
    });

    it('should handle conversion with custom options', async () => {
      (exec as unknown as jest.Mock).mockImplementation((cmd, callback) => {
        // Verify the command includes custom options
        expect(cmd).toContain('--zoom 1.5');
        expect(cmd).toContain('--dpi 300');
        expect(cmd).toContain('--split-pages 1');
        callback(null, '', '');
      });

      (fs.readFile as jest.Mock).mockResolvedValue(mockHtmlContent);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await pdfConverter.convertToHtml(mockPdfPath, {
        splitPages: true,
        zoom: 1.5,
        dpi: 300,
        embedFonts: false,
        embedImages: false
      });

      expect(exec).toHaveBeenCalled();
    });

    it('should handle conversion errors', async () => {
      const errorMessage = 'PDF conversion failed';
      
      (exec as unknown as jest.Mock).mockImplementation((cmd, callback) => {
        callback(new Error(errorMessage), '', errorMessage);
      });

      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await expect(pdfConverter.convertToHtml(mockPdfPath))
        .rejects.toThrow(errorMessage);

      // Verify cleanup was attempted
      expect(fs.unlink).toHaveBeenCalled();
    });

    it('should handle file read errors', async () => {
      (exec as unknown as jest.Mock).mockImplementation((cmd, callback) => {
        callback(null, '', '');
      });

      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File read error'));
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await expect(pdfConverter.convertToHtml(mockPdfPath))
        .rejects.toThrow('File read error');

      // Verify cleanup was attempted
      expect(fs.unlink).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should successfully delete file', async () => {
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await pdfConverter.cleanup(mockPdfPath);

      expect(fs.unlink).toHaveBeenCalledWith(mockPdfPath);
    });

    it('should handle cleanup errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (fs.unlink as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await pdfConverter.cleanup(mockPdfPath);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to cleanup file'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('buildEmbedOptions', () => {
    it('should build correct embed flags', () => {
      const converter = new PdfConverter(uploadsDir);
      
      // Access private method through any type casting for testing
      const buildEmbedOptions = (converter as any).buildEmbedOptions;

      expect(buildEmbedOptions.call(converter, {}))
        .toBe('--embed fijoc');

      expect(buildEmbedOptions.call(converter, { 
        embedFonts: false,
        embedImages: false 
      }))
        .toBe('--embed joc');

      expect(buildEmbedOptions.call(converter, { 
        embedFonts: true,
        embedImages: true,
        embedJavascript: false,
        embedOutline: false
      }))
        .toBe('--embed fic');
    });
  });
});