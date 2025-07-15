import fs from 'fs/promises';
import path from 'path';

export interface AssetInfo {
  filename: string;
  path: string;
  type: 'css' | 'js' | 'font' | 'image' | 'other';
  size: number;
  exists: boolean;
}

export interface ConversionAssets {
  conversionId: string;
  htmlFile: string;
  assets: AssetInfo[];
  createdAt: Date;
}

export class AssetManager {
  private uploadsDir: string;
  private conversionAssets: Map<string, ConversionAssets> = new Map();

  constructor(uploadsDir: string) {
    this.uploadsDir = uploadsDir;
  }

  async detectAssets(htmlContent: string, conversionId: string): Promise<ConversionAssets> {
    const assets: AssetInfo[] = [];
    
    // Extract CSS files
    const cssMatches = htmlContent.match(/href="([^"]+\.css)"/g);
    if (cssMatches) {
      for (const match of cssMatches) {
        const filename = match.match(/href="([^"]+)"/)?.[1];
        if (filename) {
          assets.push(await this.getAssetInfo(filename, 'css'));
        }
      }
    }

    // Extract JS files
    const jsMatches = htmlContent.match(/src="([^"]+\.js)"/g);
    if (jsMatches) {
      for (const match of jsMatches) {
        const filename = match.match(/src="([^"]+)"/)?.[1];
        if (filename) {
          assets.push(await this.getAssetInfo(filename, 'js'));
        }
      }
    }

    // Extract font files from CSS content
    const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
    for (const ext of fontExtensions) {
      const fontFiles = await this.findFilesWithExtension(ext);
      for (const fontFile of fontFiles) {
        assets.push(await this.getAssetInfo(fontFile, 'font'));
      }
    }

    // Extract image files
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
    for (const ext of imageExtensions) {
      const imageFiles = await this.findFilesWithExtension(ext);
      for (const imageFile of imageFiles) {
        assets.push(await this.getAssetInfo(imageFile, 'image'));
      }
    }

    const conversionAssets: ConversionAssets = {
      conversionId,
      htmlFile: `${conversionId}.html`,
      assets,
      createdAt: new Date()
    };

    this.conversionAssets.set(conversionId, conversionAssets);
    return conversionAssets;
  }

  private async getAssetInfo(filename: string, type: AssetInfo['type']): Promise<AssetInfo> {
    const filePath = path.join(this.uploadsDir, filename);
    
    try {
      const stats = await fs.stat(filePath);
      return {
        filename,
        path: filePath,
        type,
        size: stats.size,
        exists: true
      };
    } catch {
      return {
        filename,
        path: filePath,
        type,
        size: 0,
        exists: false
      };
    }
  }

  private async findFilesWithExtension(extension: string): Promise<string[]> {
    try {
      const files = await fs.readdir(this.uploadsDir);
      return files.filter(file => file.endsWith(extension));
    } catch {
      return [];
    }
  }

  async getAsset(filename: string): Promise<Buffer | null> {
    const filePath = path.join(this.uploadsDir, filename);
    
    try {
      return await fs.readFile(filePath);
    } catch {
      return null;
    }
  }

  getAssetMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
      '.eot': 'application/vnd.ms-fontobject',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  modifyHtmlAssetPaths(htmlContent: string, baseUrl: string): string {
    let modifiedHtml = htmlContent;

    // Replace CSS href paths
    modifiedHtml = modifiedHtml.replace(
      /href="([^"]+\.css)"/g,
      `href="${baseUrl}/assets/$1"`
    );

    // Replace JS src paths
    modifiedHtml = modifiedHtml.replace(
      /src="([^"]+\.js)"/g,
      `src="${baseUrl}/assets/$1"`
    );

    // Replace image src paths in HTML
    modifiedHtml = modifiedHtml.replace(
      /src="([^"]+\.(png|jpg|jpeg|gif|svg))"/g,
      `src="${baseUrl}/assets/$1"`
    );

    // Replace background image URLs in CSS
    modifiedHtml = modifiedHtml.replace(
      /url\(['"]?([^'"]+\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|otf|eot))['"]?\)/g,
      `url("${baseUrl}/assets/$1")`
    );

    // Replace font URLs in CSS
    modifiedHtml = modifiedHtml.replace(
      /url\(['"]?([^'"]+\.(woff|woff2|ttf|otf|eot))['"]?\)/g,
      `url("${baseUrl}/assets/$1")`
    );

    // Add base tag to help with relative URLs
    if (modifiedHtml.includes('<head>')) {
      modifiedHtml = modifiedHtml.replace(
        '<head>',
        `<head><base href="${baseUrl}/">`
      );
    }

    return modifiedHtml;
  }

  getConversionAssets(conversionId: string): ConversionAssets | undefined {
    return this.conversionAssets.get(conversionId);
  }

  // Cleanup old conversions (call periodically)
  async cleanupOldAssets(maxAgeHours: number = 24): Promise<void> {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [conversionId, assets] of this.conversionAssets.entries()) {
      if (assets.createdAt < cutoffTime) {
        // Clean up files
        for (const asset of assets.assets) {
          try {
            await fs.unlink(asset.path);
          } catch {
            // Ignore cleanup errors
          }
        }
        
        this.conversionAssets.delete(conversionId);
      }
    }
  }
}