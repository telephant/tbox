import express, { Request, Response, Application } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import puppeteer from 'puppeteer';
import { PdfConverter, ConversionOptions } from './lib/pdf-converter';

interface ConvertRequest extends Request {
  file?: Express.Multer.File;
}

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json({ limit: '50mb' }));

// Initialize PDF converter
const uploadsDir = path.join(__dirname, '../uploads');
const pdfConverter = new PdfConverter(uploadsDir);

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}.pdf`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Asset serving endpoint
app.get('/assets/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const assetManager = pdfConverter.getAssetManager();
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const assetBuffer = await assetManager.getAsset(filename);
    
    if (!assetBuffer) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Set appropriate content type
    const mimeType = assetManager.getAssetMimeType(filename);
    res.setHeader('Content-Type', mimeType);
    
    // Set cache headers for static assets
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    
    res.send(assetBuffer);
    
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Asset serving error:', error);
    }
    res.status(500).json({ error: 'Failed to serve asset' });
  }
});

// PDF to HTML conversion endpoint
app.post('/convert', upload.single('file'), async (req: ConvertRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Converting PDF: ${req.file.filename}`);
    }
    
    const inputPath = req.file.path;
    
    // Parse conversion options from request body
    const options: ConversionOptions = {
      embedFonts: req.body.embedFonts !== 'false',
      embedImages: req.body.embedImages !== 'false',
      embedJavascript: req.body.embedJavascript !== 'false',
      embedOutline: req.body.embedOutline !== 'false',
      splitPages: req.body.splitPages === 'true',
      zoom: req.body.zoom ? parseFloat(req.body.zoom) : undefined,
      dpi: req.body.dpi ? parseInt(req.body.dpi) : undefined
    };

    // Convert PDF to HTML with proper base URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await pdfConverter.convertToHtml(inputPath, options, baseUrl);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Successfully converted PDF: ${req.file.filename} in ${result.processingTime}ms (${result.assetCount} assets)`);
    }
    
    // Return HTML content with asset info
    res.json(result);

    // Clean up uploaded file
    await pdfConverter.cleanup(inputPath);

  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Conversion error:', error);
    }
    
    // Clean up uploaded file if it exists
    if (req.file) {
      await pdfConverter.cleanup(req.file.path);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'PDF conversion failed',
      details: errorMessage
    });
  }
});

// HTML to PDF conversion endpoint with file-based storage
app.post('/generate-pdf', async (req: Request, res: Response) => {
  try {
    const { html, options = {} } = req.body;

    if (!html) {
      return res.status(400).json({ 
        success: false, 
        error: 'HTML content is required' 
      });
    }

    console.log('Generating PDF from HTML...');
    console.log('HTML length:', html.length);
    console.log('HTML preview (first 200 chars):', html.substring(0, 200));
    console.log('HTML preview (last 200 chars):', html.substring(html.length - 200));
    const startTime = Date.now();

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../pdf-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.round(Math.random() * 1000000);
    const filename = options.filename || `document-${timestamp}-${randomId}.pdf`;
    const pdfPath = path.join(outputDir, filename);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();

      // Set a large viewport to capture full content
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 1,
      });

      // Set the HTML content and wait for it to load
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000,
      });

      // Wait for content to stabilize
      await new Promise<void>(resolve => setTimeout(resolve, 2000));

      // Get content dimensions to ensure we capture everything
      const contentDimensions = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        
        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
        
        const width = Math.max(
          body.scrollWidth,
          body.offsetWidth,
          html.clientWidth,
          html.scrollWidth,
          html.offsetWidth
        );
        
        return { width, height };
      });

      console.log('Content dimensions:', contentDimensions);

      // Update viewport to match content if needed
      if (contentDimensions.width > 1200 || contentDimensions.height > 1600) {
        await page.setViewport({
          width: Math.max(1200, contentDimensions.width + 100),
          height: Math.max(1600, contentDimensions.height + 100),
          deviceScaleFactor: 1,
        });
        
        // Wait a bit more after viewport change
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
      }

      // Generate PDF directly to file with optimized settings
      const pdfOptions: any = {
        path: pdfPath,
        printBackground: true,
        margin: {
          top: `${options.margin || 10}mm`,
          right: `${options.margin || 10}mm`,
          bottom: `${options.margin || 10}mm`,
          left: `${options.margin || 10}mm`,
        },
      };

      // For pdf2htmlEX content, use custom dimensions
      if (html.includes('class="pf"') || html.includes('pdf2htmlEX')) {
        console.log('Detected pdf2htmlEX content, using custom sizing');
        pdfOptions.width = contentDimensions.width + 'px';
        pdfOptions.height = contentDimensions.height + 'px';
        pdfOptions.preferCSSPageSize = false;
        pdfOptions.scale = 1; // Keep original scale for pdf2htmlEX
      } else {
        // For regular content, use standard format
        pdfOptions.format = (options.format?.toLowerCase() as 'a4' | 'a3' | 'letter' | 'legal') || 'a4';
        pdfOptions.landscape = options.orientation === 'landscape';
        pdfOptions.preferCSSPageSize = true;
        pdfOptions.scale = 0.75; // Slightly smaller scale for better fit
      }

      console.log('PDF options:', pdfOptions);
      
      await page.pdf(pdfOptions);

      const processingTime = Date.now() - startTime;
      const fileSize = fs.statSync(pdfPath).size;

      console.log(`Successfully generated PDF: ${filename} (${fileSize} bytes) in ${processingTime}ms`);

      // Return download URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const downloadUrl = `${baseUrl}/download-pdf/${filename}`;

      res.json({
        success: true,
        downloadUrl,
        filename,
        fileSize,
        processingTime
      });

    } finally {
      await browser.close();
    }

  } catch (error) {
    console.error('PDF generation error:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'PDF generation failed',
    });
  }
});

// PDF download endpoint
app.get('/download-pdf/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    // Check if file has .pdf extension
    if (!filename.endsWith('.pdf')) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    const outputDir = path.join(__dirname, '../pdf-output');
    const filePath = path.join(outputDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('File streaming error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download file' });
      }
    });
    
    console.log(`PDF downloaded: ${filename}`);
    
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Download failed' });
    }
  }
});

// Cleanup old PDF files (older than specified hours)
async function cleanupOldPdfs(hoursOld = 1) {
  try {
    const outputDir = path.join(__dirname, '../pdf-output');
    if (!fs.existsSync(outputDir)) {
      return;
    }
    
    const files = fs.readdirSync(outputDir);
    const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000);
    let deletedCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.pdf')) {
        const filePath = path.join(outputDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🗑️  Cleaned up ${deletedCount} old PDF files`);
    }
  } catch (error) {
    console.error('PDF cleanup error:', error);
  }
}


// Error handling middleware
app.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large (max 50MB)' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: error.message });
  }
  
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unexpected error:', error);
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Schedule periodic cleanup of old assets and PDFs
if (process.env.NODE_ENV !== 'test') {
  // Clean up conversion assets every hour
  setInterval(async () => {
    try {
      await pdfConverter.cleanupOldAssets(24); // Clean up assets older than 24 hours
      if (process.env.NODE_ENV !== 'production') {
        console.log('🧹 Cleaned up old conversion assets');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Asset cleanup error:', error);
      }
    }
  }, 60 * 60 * 1000); // 1 hour

  // Clean up generated PDFs every 10 minutes
  setInterval(async () => {
    try {
      await cleanupOldPdfs(1); // Clean up PDFs older than 1 hour
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('PDF cleanup error:', error);
      }
    }
  }, 10 * 60 * 1000); // 10 minutes
}

// Start server only if not in test environment
let server: any;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 PDF Transformer Backend running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${path.join(__dirname, '../uploads')}`);
    console.log(`📄 Converted files directory: ${path.join(__dirname, '../converted')}`);
    console.log(`🔧 Using pdf2htmlEX for PDF processing`);
    console.log(`📄 Available endpoints:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /assets/:filename - Serve conversion assets`);
    console.log(`   GET  /download-pdf/:filename - Download generated PDF`);
    console.log(`   POST /convert - Convert PDF to HTML`);
    console.log(`   POST /generate-pdf - Convert HTML to PDF (returns download URL)`);
  });
}

// Export app for testing
export default app;
