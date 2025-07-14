import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ManualPdfOptions {
  filename?: string;
  format?: 'a4' | 'a3' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  scale?: number;
  margin?: number;
}

export interface ManualPdfResult {
  success: boolean;
  error?: string;
}

export class ManualPdfService {
  async convertHtmlToPdf(
    htmlContent: string,
    options: ManualPdfOptions = {}
  ): Promise<ManualPdfResult> {
    // Try advanced method first, fallback to simple if it fails
    try {
      return await this.convertHtmlToPdfAdvanced(htmlContent, options);
    } catch (error) {
      console.warn('Advanced PDF generation failed, trying simple method:', error);
      return await this.convertHtmlToPdfSimple(htmlContent, options);
    }
  }

  private async convertHtmlToPdfAdvanced(
    htmlContent: string,
    options: ManualPdfOptions = {}
  ): Promise<ManualPdfResult> {
    try {
      // Create a dedicated iframe for clean PDF rendering
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 210mm;
        height: 297mm;
        border: none;
        background: white;
      `;
      
      document.body.appendChild(iframe);
      
      // Wait for iframe to be ready
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        iframe.src = 'about:blank';
      });

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }

      // Create clean HTML document for PDF export
      const cleanHtml = this.createCleanPdfDocument(htmlContent);
      
      iframeDoc.open();
      iframeDoc.write(cleanHtml);
      iframeDoc.close();

      // Wait for content to load and render
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000); // Give time for fonts/images to load
      });

      // Get the actual content body
      const contentBody = iframeDoc.body;
      if (!contentBody) {
        throw new Error('No content body found in iframe');
      }

      // Wait for images to load in iframe
      await this.waitForImages(contentBody);

      // Set fixed dimensions for PDF export (A4 size)
      const pdfWidth = 794; // A4 width in pixels at 96 DPI
      const pdfHeight = 1123; // A4 height in pixels at 96 DPI

      // Get the full content height (including overflow)
      const contentHeight = Math.max(
        contentBody.scrollHeight,
        contentBody.offsetHeight,
        iframeDoc.documentElement?.scrollHeight || 0
      );

      console.log('Content dimensions for PDF:', {
        width: pdfWidth,
        contentHeight: contentHeight,
        bodyScrollHeight: contentBody.scrollHeight,
        bodyOffsetHeight: contentBody.offsetHeight
      });

      // Generate canvas from the iframe content body only
      const canvas = await html2canvas(contentBody, {
        scale: Math.min(options.scale || 2, 3),
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: pdfWidth,
        height: contentHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        windowWidth: pdfWidth,
        windowHeight: contentHeight
      });

      // Clean up DOM
      document.body.removeChild(iframe);

      // Validate canvas dimensions
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error(`Canvas generation failed - dimensions: ${canvas?.width || 0}x${canvas?.height || 0}`);
      }

      console.log('Generated canvas dimensions:', { 
        width: canvas.width, 
        height: canvas.height,
        expectedWidth: pdfWidth,
        expectedHeight: contentHeight
      });

      // Create PDF with proper dimension handling
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'a4',
        compress: true
      });

      let advancedPdfWidth = pdf.internal.pageSize.getWidth();
      let advancedPdfHeight = pdf.internal.pageSize.getHeight();
      
      // Validate PDF dimensions
      if (!isFinite(advancedPdfWidth) || advancedPdfWidth <= 0) {
        console.warn('Invalid PDF width, using A4 default:', advancedPdfWidth);
        advancedPdfWidth = 210; // A4 width in mm
      }
      if (!isFinite(advancedPdfHeight) || advancedPdfHeight <= 0) {
        console.warn('Invalid PDF height, using A4 default:', advancedPdfHeight);
        advancedPdfHeight = 297; // A4 height in mm
      }
      
      let advancedMargin = options.margin || 10;
      if (!isFinite(advancedMargin) || advancedMargin < 0) {
        advancedMargin = 10;
      }
      advancedMargin = Math.min(advancedMargin, 20); // Ensure margin is reasonable
      
      const advancedMaxContentWidth = advancedPdfWidth - (advancedMargin * 2);
      const advancedMaxContentHeight = advancedPdfHeight - (advancedMargin * 2);
      
      // Validate content dimensions
      if (!isFinite(advancedMaxContentWidth) || advancedMaxContentWidth <= 0) {
        throw new Error(`Invalid content width: ${advancedMaxContentWidth} (PDF: ${advancedPdfWidth}, margin: ${advancedMargin})`);
      }
      if (!isFinite(advancedMaxContentHeight) || advancedMaxContentHeight <= 0) {
        throw new Error(`Invalid content height: ${advancedMaxContentHeight} (PDF: ${advancedPdfHeight}, margin: ${advancedMargin})`);
      }
      
      // Calculate scaling to fit content properly
      const imgRatio = canvas.width / canvas.height;
      
      // Ensure ratio is valid
      if (!isFinite(imgRatio) || imgRatio <= 0) {
        throw new Error(`Invalid aspect ratio calculated: ${imgRatio} (canvas: ${canvas.width}x${canvas.height})`);
      }
      
      let advancedImgWidth = advancedMaxContentWidth;
      let advancedImgHeight = advancedImgWidth / imgRatio;
      
      // If height exceeds page, scale down
      if (advancedImgHeight > advancedMaxContentHeight) {
        advancedImgHeight = advancedMaxContentHeight;
        advancedImgWidth = advancedImgHeight * imgRatio;
      }
      
      // Final dimension validation with detailed error
      if (advancedImgWidth <= 0 || advancedImgHeight <= 0 || !isFinite(advancedImgWidth) || !isFinite(advancedImgHeight)) {
        throw new Error(`Invalid final dimensions - Width: ${advancedImgWidth}, Height: ${advancedImgHeight}, Canvas: ${canvas.width}x${canvas.height}, MaxContent: ${advancedMaxContentWidth}x${advancedMaxContentHeight}`);
      }
      
      // Ensure dimensions are reasonable (not too small or too large)
      if (advancedImgWidth < 1 || advancedImgHeight < 1) {
        throw new Error(`Dimensions too small - Width: ${advancedImgWidth}, Height: ${advancedImgHeight}`);
      }
      
      if (advancedImgWidth > 1000 || advancedImgHeight > 1000) {
        console.warn(`Large dimensions detected - Width: ${advancedImgWidth}, Height: ${advancedImgHeight}`);
        // Scale down if too large
        const scale = Math.min(1000 / advancedImgWidth, 1000 / advancedImgHeight);
        advancedImgWidth *= scale;
        advancedImgHeight *= scale;
      }

      console.log('PDF dimensions:', { advancedPdfWidth, advancedPdfHeight, advancedImgWidth, advancedImgHeight, advancedMargin });

      const imageData = canvas.toDataURL('image/jpeg', options.quality || 0.95);
      
      if (advancedImgHeight <= advancedMaxContentHeight) {
        // Single page - content fits
        pdf.addImage(
          imageData,
          'JPEG',
          advancedMargin,
          advancedMargin,
          advancedImgWidth,
          advancedImgHeight
        );
      } else {
        // Multiple pages needed
        let remainingHeight = advancedImgHeight;
        let sourceY = 0;
        let pageNum = 0;
        
        while (remainingHeight > 0) {
          if (pageNum > 0) {
            pdf.addPage();
          }
          
          const pageContentHeight = Math.min(remainingHeight, advancedMaxContentHeight);
          
          // Create a canvas section for this page
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          
          pageCanvas.width = canvas.width;
          pageCanvas.height = (pageContentHeight / advancedImgHeight) * canvas.height;
          
          if (pageCtx) {
            pageCtx.drawImage(
              canvas,
              0, sourceY * (canvas.height / advancedImgHeight),
              canvas.width, pageCanvas.height,
              0, 0,
              canvas.width, pageCanvas.height
            );
            
            const pageImageData = pageCanvas.toDataURL('image/jpeg', options.quality || 0.95);
            pdf.addImage(
              pageImageData,
              'JPEG',
              advancedMargin,
              advancedMargin,
              advancedImgWidth,
              pageContentHeight
            );
          }
          
          sourceY += pageContentHeight;
          remainingHeight -= pageContentHeight;
          pageNum++;
          
          // Prevent infinite loop
          if (pageNum > 50) {
            console.warn('Too many pages, stopping at 50');
            break;
          }
        }
      }

      // Save PDF
      pdf.save(options.filename || 'document.pdf');

      return { success: true };
    } catch (error) {
      console.error('Manual PDF generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF generation failed'
      };
    }
  }

  private async convertHtmlToPdfSimple(
    htmlContent: string,
    options: ManualPdfOptions = {}
  ): Promise<ManualPdfResult> {
    try {
      // Create simple PDF with text content only
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 6;
      const maxWidth = pdfWidth - (margin * 2);

      // Extract text content from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || 'PDF Content';

      // Add title
      pdf.setFontSize(16);
      pdf.text('PDF Export', margin, margin + 10);
      
      // Add content
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(textContent, maxWidth);
      
      let yPosition = margin + 25;
      
      for (const line of lines) {
        if (yPosition > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      }

      // Save PDF
      pdf.save(options.filename || 'document.pdf');

      return { success: true };
    } catch (error) {
      console.error('Simple PDF generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Simple PDF generation failed'
      };
    }
  }

  async convertIframeToPdf(
    iframe: HTMLIFrameElement,
    options: ManualPdfOptions = {}
  ): Promise<ManualPdfResult> {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) {
        throw new Error('Cannot access iframe content');
      }

      // Get the full content from iframe
      const iframeBody = iframeDoc.body;
      
      // Wait for images to load
      await this.waitForImages(iframeBody);

      // Set proper dimensions for PDF
      const pdfWidth = 794; // A4 width in pixels
      const contentHeight = Math.max(
        iframeBody.scrollHeight,
        iframeBody.offsetHeight,
        iframeDoc.documentElement?.scrollHeight || 0
      );

      console.log('Iframe content dimensions:', {
        width: pdfWidth,
        height: contentHeight,
        scrollHeight: iframeBody.scrollHeight,
        offsetHeight: iframeBody.offsetHeight
      });

      // Generate canvas from iframe body only
      const canvas = await html2canvas(iframeBody, {
        scale: Math.min(options.scale || 2, 3),
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: pdfWidth,
        height: contentHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        windowWidth: pdfWidth,
        windowHeight: contentHeight
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error(`Canvas generation failed - dimensions: ${canvas?.width || 0}x${canvas?.height || 0}`);
      }

      return await this.generatePdfFromCanvas(canvas, options);
      
    } catch (error) {
      console.error('Iframe to PDF conversion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Iframe PDF generation failed'
      };
    }
  }

  async convertElementToPdf(
    element: HTMLElement,
    options: ManualPdfOptions = {}
  ): Promise<ManualPdfResult> {
    try {
      // Clone the element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Style the cloned element for PDF
      clonedElement.style.cssText = `
        background: white;
        color: black;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        width: 794px;
        box-sizing: border-box;
        padding: 20px;
      `;

      // Temporarily add to DOM for rendering
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      document.body.appendChild(clonedElement);

      // Wait for images to load
      await this.waitForImages(clonedElement);

      // Ensure element has valid dimensions
      let elementWidth = clonedElement.offsetWidth;
      let elementHeight = clonedElement.offsetHeight;
      
      if (elementWidth === 0 || elementHeight === 0 || !isFinite(elementWidth) || !isFinite(elementHeight)) {
        clonedElement.style.width = '794px !important';
        clonedElement.style.height = '1123px !important';
        clonedElement.style.minHeight = '1123px !important';
        // Force a reflow
        clonedElement.offsetHeight;
        
        // Re-check dimensions
        elementWidth = clonedElement.offsetWidth;
        elementHeight = clonedElement.offsetHeight;
        
        if (elementWidth === 0 || elementHeight === 0) {
          throw new Error(`Element dimensions still invalid after forced sizing: ${elementWidth}x${elementHeight}`);
        }
      }

      // Generate canvas
      const canvas = await html2canvas(clonedElement, {
        scale: Math.min(options.scale || 2, 3),
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        logging: false
      });

      // Clean up DOM
      document.body.removeChild(clonedElement);

      // Validate canvas dimensions
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error(`Canvas generation failed - dimensions: ${canvas?.width || 0}x${canvas?.height || 0}`);
      }

      // Use the shared PDF generation method
      return await this.generatePdfFromCanvas(canvas, options);
    } catch (error) {
      console.error('Element to PDF conversion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF generation failed'
      };
    }
  }

  private createCleanPdfDocument(htmlContent: string): string {
    // Remove problematic elements and create a clean document
    const cleanContent = this.cleanHtmlForPdf(htmlContent);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          html, body {
            width: 210mm !important;
            max-width: 210mm !important;
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            overflow-x: hidden;
          }
          
          body {
            padding: 10mm;
            min-height: 297mm;
          }
          
          /* Ensure images fit within page */
          img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            page-break-inside: avoid;
          }
          
          /* Table styling */
          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
            margin: 5px 0;
          }
          
          th, td {
            border: 1px solid #ccc;
            padding: 4px;
            text-align: left;
            font-size: 11px;
          }
          
          /* Typography */
          h1, h2, h3, h4, h5, h6 {
            margin: 10px 0 5px 0;
            page-break-after: avoid;
            font-weight: bold;
          }
          
          h1 { font-size: 18px; }
          h2 { font-size: 16px; }
          h3 { font-size: 14px; }
          h4, h5, h6 { font-size: 12px; }
          
          p, div {
            margin: 3px 0;
            orphans: 3;
            widows: 3;
          }
          
          /* Remove any absolute positioning */
          * {
            position: static !important;
          }
          
          /* Ensure proper text rendering */
          .ff0, .ff1, .ff2, .ff3, .ff4, .ff5, .ff6, .ff7, .ff8, .ff9 {
            font-family: Arial, Helvetica, sans-serif !important;
          }
          
          /* Page breaks */
          .page-break {
            page-break-before: always;
          }
          
          /* Hide any UI elements that might be in the HTML */
          .no-print,
          [data-testid],
          button,
          .btn,
          .button {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${cleanContent}
      </body>
      </html>
    `;
  }

  private cleanHtmlForPdf(html: string): string {
    // Remove problematic elements and attributes
    let cleanHtml = html;
    
    // Remove script tags
    cleanHtml = cleanHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove style tags that might interfere (keep inline styles)
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove problematic attributes
    cleanHtml = cleanHtml.replace(/contenteditable="[^"]*"/gi, '');
    cleanHtml = cleanHtml.replace(/data-editable="[^"]*"/gi, '');
    
    // Remove iframe and embed elements that can cause issues
    cleanHtml = cleanHtml.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    cleanHtml = cleanHtml.replace(/<embed[^>]*>/gi, '');
    cleanHtml = cleanHtml.replace(/<object[^>]*>.*?<\/object>/gi, '');
    
    // Ensure images have proper styling
    cleanHtml = cleanHtml.replace(/<img([^>]*)>/gi, (match, attrs) => {
      if (!attrs.includes('style=')) {
        return `<img${attrs} style="max-width: 100%; height: auto; display: block;">`;
      }
      return match;
    });

    // Add basic styling to ensure proper rendering
    if (!cleanHtml.includes('<style>') && !cleanHtml.includes('font-family')) {
      cleanHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.4; color: black; background: white;">
          ${cleanHtml}
        </div>
      `;
    }

    return cleanHtml;
  }

  private waitForImages(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img');
    const promises: Promise<void>[] = [];

    images.forEach((img) => {
      if (img.complete) {
        return;
      }
      
      promises.push(
        new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails
          // Timeout after 5 seconds
          setTimeout(() => resolve(), 5000);
        })
      );
    });

    return Promise.all(promises).then(() => {});
  }

  private async generatePdfFromCanvas(
    canvas: HTMLCanvasElement,
    options: ManualPdfOptions = {}
  ): Promise<ManualPdfResult> {
    try {
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'a4',
        compress: true
      });

      let canvasPdfWidth = pdf.internal.pageSize.getWidth();
      let canvasPdfHeight = pdf.internal.pageSize.getHeight();
      
      // Validate PDF dimensions
      if (!isFinite(canvasPdfWidth) || canvasPdfWidth <= 0) {
        console.warn('Invalid PDF width, using A4 default:', canvasPdfWidth);
        canvasPdfWidth = 210;
      }
      if (!isFinite(canvasPdfHeight) || canvasPdfHeight <= 0) {
        console.warn('Invalid PDF height, using A4 default:', canvasPdfHeight);
        canvasPdfHeight = 297;
      }
      
      let canvasMargin = options.margin || 10;
      if (!isFinite(canvasMargin) || canvasMargin < 0) {
        canvasMargin = 10;
      }
      canvasMargin = Math.min(canvasMargin, 20);
      
      const canvasMaxContentWidth = canvasPdfWidth - (canvasMargin * 2);
      const canvasMaxContentHeight = canvasPdfHeight - (canvasMargin * 2);
      
      // Validate content dimensions
      if (!isFinite(canvasMaxContentWidth) || canvasMaxContentWidth <= 0) {
        throw new Error(`Invalid content width: ${canvasMaxContentWidth}`);
      }
      if (!isFinite(canvasMaxContentHeight) || canvasMaxContentHeight <= 0) {
        throw new Error(`Invalid content height: ${canvasMaxContentHeight}`);
      }

      // Calculate scaling to fit content properly
      const imgRatio = canvas.width / canvas.height;
      
      if (!isFinite(imgRatio) || imgRatio <= 0) {
        throw new Error(`Invalid aspect ratio: ${imgRatio}`);
      }
      
      let imgWidth = canvasMaxContentWidth;
      let imgHeight = imgWidth / imgRatio;
      
      if (imgHeight > canvasMaxContentHeight) {
        imgHeight = canvasMaxContentHeight;
        imgWidth = imgHeight * imgRatio;
      }
      
      // Final validation
      if (imgWidth <= 0 || imgHeight <= 0 || !isFinite(imgWidth) || !isFinite(imgHeight)) {
        throw new Error(`Invalid final dimensions - Width: ${imgWidth}, Height: ${imgHeight}`);
      }
      
      if (imgWidth < 1 || imgHeight < 1) {
        throw new Error(`Dimensions too small - Width: ${imgWidth}, Height: ${imgHeight}`);
      }
      
      if (imgWidth > 1000 || imgHeight > 1000) {
        const scale = Math.min(1000 / imgWidth, 1000 / imgHeight);
        imgWidth *= scale;
        imgHeight *= scale;
      }

      console.log('Final PDF layout:', {
        pdfSize: `${canvasPdfWidth}x${canvasPdfHeight}mm`,
        contentArea: `${canvasMaxContentWidth}x${canvasMaxContentHeight}mm`,
        imageSize: `${imgWidth.toFixed(1)}x${imgHeight.toFixed(1)}mm`,
        canvasSize: `${canvas.width}x${canvas.height}px`
      });

      const imageData = canvas.toDataURL('image/jpeg', options.quality || 0.95);
      
      // Check if content fits on single page
      if (imgHeight <= canvasMaxContentHeight) {
        // Single page
        pdf.addImage(
          imageData,
          'JPEG',
          canvasMargin,
          canvasMargin,
          imgWidth,
          imgHeight
        );
      } else {
        // Multiple pages - split the canvas
        const pageHeight = canvasMaxContentHeight;
        const totalPages = Math.ceil(imgHeight / pageHeight);
        
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
          }
          
          const sourceY = (page * pageHeight * canvas.height) / imgHeight;
          const sourceHeight = Math.min(
            (pageHeight * canvas.height) / imgHeight,
            canvas.height - sourceY
          );
          
          // Create canvas for this page
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          
          const pageCtx = pageCanvas.getContext('2d');
          if (pageCtx) {
            pageCtx.drawImage(
              canvas,
              0, sourceY,
              canvas.width, sourceHeight,
              0, 0,
              canvas.width, sourceHeight
            );
            
            const pageImageData = pageCanvas.toDataURL('image/jpeg', options.quality || 0.95);
            const pageImgHeight = (sourceHeight * imgHeight) / canvas.height;
            
            pdf.addImage(
              pageImageData,
              'JPEG',
              canvasMargin,
              canvasMargin,
              imgWidth,
              pageImgHeight
            );
          }
        }
      }

      pdf.save(options.filename || 'document.pdf');
      return { success: true };
      
    } catch (error) {
      console.error('PDF generation from canvas error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF generation failed'
      };
    }
  }
}