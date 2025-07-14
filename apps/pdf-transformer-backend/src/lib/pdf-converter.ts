import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { AssetManager } from './asset-manager';

const execAsync = promisify(exec);

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

export class PdfConverter {
  private uploadsDir: string;
  private assetManager: AssetManager;

  constructor(uploadsDir: string) {
    this.uploadsDir = uploadsDir;
    this.assetManager = new AssetManager(uploadsDir);
  }

  async convertToHtml(
    inputPath: string,
    options: ConversionOptions = {},
    baseUrl: string = 'http://localhost:3000'
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    const filename = path.basename(inputPath);
    
    // Generate unique conversion ID
    const conversionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const outputFilename = `${conversionId}.html`;
    const outputHtmlPath = path.join(this.uploadsDir, outputFilename);

    try {
      // Build pdf2htmlEX command with options
      const embedOptions = this.buildEmbedOptions(options);
      const additionalOptions = this.buildAdditionalOptions(options);
      
      const cmd = `docker run --platform linux/amd64 --rm -v "${this.uploadsDir}:/pdf" bwits/pdf2htmlex pdf2htmlEX ${embedOptions} ${additionalOptions} --dest-dir "/pdf" --page-filename "${outputFilename}" "/pdf/${filename}"`;

      // Execute conversion
      const { stdout, stderr } = await execAsync(cmd);
      
      // Check for actual errors vs warnings
      if (stderr) {
        const isWarningOnly = stderr.includes('WARNING:') || 
                             stderr.includes('Processing') || 
                             stderr.includes('Preprocessing') ||
                             stderr.includes('Working:') ||
                             stderr.includes('platform') ||
                             stderr.includes('ToUnicode CMap');
        
        if (!isWarningOnly) {
          throw new Error(`PDF conversion failed: ${stderr}`);
        }
        
        // Log warnings but don't fail
        if (process.env.NODE_ENV !== 'test') {
          console.warn('PDF conversion warning:', stderr);
        }
      }

      // Find the actual generated HTML file (pdf2htmlEX might not respect our filename)
      const files = await fs.readdir(this.uploadsDir);
      const htmlFiles = files.filter(file => file.endsWith('.html'));
      const actualHtmlFile = htmlFiles.find(file => file.includes(path.parse(filename).name));
      
      const actualOutputPath = actualHtmlFile 
        ? path.join(this.uploadsDir, actualHtmlFile)
        : outputHtmlPath;

      // Read the converted HTML file
      let htmlContent = await fs.readFile(actualOutputPath, 'utf-8');

      // Detect and track assets
      const conversionAssets = await this.assetManager.detectAssets(htmlContent, conversionId);
      
      // Modify HTML to use absolute asset URLs
      htmlContent = this.assetManager.modifyHtmlAssetPaths(htmlContent, baseUrl);

      // Clean up the original HTML file (we'll serve it through the API)
      await fs.unlink(actualOutputPath);

      const processingTime = Date.now() - startTime;

      return {
        html: htmlContent,
        originalFilename: filename,
        convertedAt: new Date().toISOString(),
        processingTime,
        conversionId,
        assetCount: conversionAssets.assets.length
      };
    } catch (error) {
      // Clean up output file if it exists
      try {
        // Try to clean up both possible filenames
        await fs.unlink(outputHtmlPath);
      } catch {}
      
      try {
        // Also try to clean up files that might have been generated with original naming
        const files = await fs.readdir(this.uploadsDir);
        const htmlFiles = files.filter(file => file.endsWith('.html') && file.includes(path.parse(filename).name));
        for (const htmlFile of htmlFiles) {
          await fs.unlink(path.join(this.uploadsDir, htmlFile));
        }
      } catch {}
      
      throw error;
    }
  }

  private buildEmbedOptions(options: ConversionOptions): string {
    const embedFlags = [];
    
    // More aggressive embedding for better frontend compatibility
    embedFlags.push('c'); // Always embed CSS
    
    if (options.embedFonts !== false) {
      embedFlags.push('f'); // Embed fonts
    }
    
    if (options.embedImages !== false) {
      embedFlags.push('i'); // Embed images
    }
    
    if (options.embedJavascript !== false) {
      embedFlags.push('j'); // Embed JavaScript
    }
    
    if (options.embedOutline !== false) {
      embedFlags.push('o'); // Embed outline
    }
    
    // Add additional embedding flags for better compatibility
    if (embedFlags.length === 5) { // If all flags are enabled
      return '--embed cfijo';
    }
    
    return embedFlags.length > 0 ? `--embed ${embedFlags.join('')}` : '';
  }

  private buildAdditionalOptions(options: ConversionOptions): string {
    const additionalOptions = [];
    
    if (options.splitPages) {
      additionalOptions.push('--split-pages 1');
    }
    
    if (options.zoom) {
      additionalOptions.push(`--zoom ${options.zoom}`);
    }
    
    // Note: pdf2htmlEX doesn't support --dpi option directly
    // DPI is handled through other options or document settings
    
    return additionalOptions.join(' ');
  }

  async cleanup(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error(`Failed to cleanup file ${filePath}:`, error);
      }
    }
  }

  getAssetManager(): AssetManager {
    return this.assetManager;
  }

  async cleanupOldAssets(maxAgeHours: number = 24): Promise<void> {
    await this.assetManager.cleanupOldAssets(maxAgeHours);
  }
}