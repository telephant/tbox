'use client';

import { useState, useRef, useCallback } from 'react';
import { ConversionResult } from '../services/pdfConverter';
import { PrintToPdfService } from '../services/printToPdfService';
import { ManualPdfService } from '../services/manualPdfService';
import { ServerPdfService } from '../services/serverPdfService';
import RichTextEditor from './richtext/RichTextEditor';
import { InlineStyleConverter } from './richtext/utils/InlineStyleConverter';
import { ActiveFormats } from './richtext/types';

interface EditableHtmlViewerProps {
  result: ConversionResult;
  onBack: () => void;
}

interface EditingState {
  editableHtml: string;
  hasChanges: boolean;
  currentActiveFormats: ActiveFormats;
}

export default function EditableHtmlViewer({ result, onBack }: EditableHtmlViewerProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'code'>('edit'); // Default to edit mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingState, setEditingState] = useState<EditingState>({
    editableHtml: result.html,
    hasChanges: false,
    currentActiveFormats: {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      fontFamily: 'Arial',
      fontSize: '14px',
      textColor: '#000000',
      backgroundColor: '#ffffff',
      alignment: 'left',
      heading: 'p',
      listType: null
    }
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    paperSize: 'A4' as const,
    orientation: 'portrait' as const,
    margin: 10,
    scale: 2,
    quality: 0.95
  });
  
  const editableRef = useRef<HTMLDivElement>(null);
  const printToPdfService = new PrintToPdfService();
  const manualPdfService = new ManualPdfService();
  const serverPdfService = new ServerPdfService();

  // Rich text editor handlers
  const handleRichTextChange = useCallback((html: string) => {
    setEditingState(prev => ({
      ...prev,
      editableHtml: html,
      hasChanges: true
    }));
  }, []);

  const handleSelectionChange = useCallback((formats: ActiveFormats) => {
    setEditingState(prev => {
      // Only update if formats actually changed - deep comparison
      const currentFormats = prev.currentActiveFormats;
      let hasChanged = false;
      
      // Check each format property
      for (const key in formats) {
        if (formats[key as keyof ActiveFormats] !== currentFormats[key as keyof ActiveFormats]) {
          hasChanged = true;
          break;
        }
      }
      
      if (!hasChanged) {
        return prev;
      }
      
      return {
        ...prev,
        currentActiveFormats: formats
      };
    });
  }, []);



  const handleBrowserPrint = async () => {
    setIsExporting(true);
    try {
      const filename = `${result.originalFilename.replace('.pdf', '')}_edited.pdf`;
      
      const exportResult = await printToPdfService.printHtmlToPdf(
        editingState.editableHtml,
        { ...exportOptions, margin: `${exportOptions.margin}mm`, filename }
      );

      if (exportResult.success) {
        alert('Print dialog opened! Choose "Save as PDF" in the print dialog.');
      } else {
        throw new Error(exportResult.error || 'Print failed');
      }
    } catch (error) {
      console.error('Print error:', error);
      alert(`Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleServerPdfExport = async () => {
    setIsExporting(true);
    try {
      const filename = `${result.originalFilename.replace('.pdf', '')}_edited.pdf`;
      
      // Get the current iframe to extract content from
      const currentIframe = document.querySelector('iframe[title="PDF Preview"], iframe[title="Editable PDF"]') as HTMLIFrameElement;
      
      let exportResult;
      
      // Try iframe-specific export first (captures only PDF content)
      if (currentIframe && currentIframe.contentDocument) {
        console.log('Attempting server-side iframe PDF export...');
        exportResult = await serverPdfService.generatePdfFromIframe(
          currentIframe,
          {
            filename,
            format: exportOptions.paperSize as 'A4' | 'A3' | 'Letter' | 'Legal',
            orientation: exportOptions.orientation as 'portrait' | 'landscape',
            margin: exportOptions.margin,
            scale: exportOptions.scale,
          }
        );
      } else {
        // No iframe available, use stored HTML
        console.log('No iframe found, using stored HTML content for server-side export...');
        exportResult = await serverPdfService.generatePdf(
          editingState.editableHtml,
          {
            filename,
            format: exportOptions.paperSize as 'A4' | 'A3' | 'Letter' | 'Legal',
            orientation: exportOptions.orientation as 'portrait' | 'landscape',
            margin: exportOptions.margin,
            scale: exportOptions.scale,
          }
        );
      }

      if (exportResult.success) {
        alert('PDF downloaded successfully! Generated using server-side Puppeteer for clean, reliable output.');
      } else {
        throw new Error(exportResult.error || 'Server-side PDF generation failed');
      }
    } catch (error) {
      console.error('Server PDF export error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Server-side PDF export failed: ${errorMsg}\n\nTrying client-side fallback...`);
      
      // Fallback to client-side generation
      await handleManualPdfExport();
    } finally {
      setIsExporting(false);
    }
  };

  const handleManualPdfExport = async () => {
    setIsExporting(true);
    try {
      const filename = `${result.originalFilename.replace('.pdf', '')}_edited.pdf`;
      
      // Get the current iframe to extract content from
      const currentIframe = document.querySelector('iframe[title="PDF Preview"], iframe[title="Editable PDF"]') as HTMLIFrameElement;
      
      let exportResult: { success: boolean; error?: string };
      
      // Try iframe-specific export first (captures only PDF content)
      if (currentIframe && currentIframe.contentDocument) {
        try {
          console.log('Attempting iframe-based PDF export...');
          exportResult = await manualPdfService.convertIframeToPdf(
            currentIframe,
            { ...exportOptions, filename }
          );
          
          if (exportResult.success) {
            console.log('Iframe PDF export successful!');
          } else {
            throw new Error(exportResult.error || 'Iframe export failed');
          }
        } catch (iframeError) {
          console.warn('Iframe export failed, falling back to HTML export:', iframeError);
          
          // Fallback to HTML content export
          const iframeDoc = currentIframe.contentDocument;
          const htmlToExport = iframeDoc?.body?.innerHTML || editingState.editableHtml;
          
          exportResult = await manualPdfService.convertHtmlToPdf(
            htmlToExport,
            { ...exportOptions, filename }
          );
        }
      } else {
        // No iframe available, use stored HTML
        console.log('No iframe found, using stored HTML content...');
        exportResult = await manualPdfService.convertHtmlToPdf(
          editingState.editableHtml,
          { ...exportOptions, filename }
        );
      }

      if (exportResult.success) {
        alert('PDF downloaded successfully! The export contains only the PDF content (no website background).');
      } else {
        throw new Error(exportResult.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide helpful alternatives
      const alternatives = `PDF export failed: ${errorMsg}\n\nTry these alternatives:\n• 🖨️ Print to PDF (most reliable)\n• Printable HTML (download & print)\n• Open for Print (new tab & Ctrl+P)`;
      alert(alternatives);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPrintableHtml = () => {
    const filename = `${result.originalFilename.replace('.pdf', '')}_printable.html`;
    printToPdfService.downloadPrintableHtml(
      editingState.editableHtml,
      filename,
      { ...exportOptions, margin: `${exportOptions.margin}mm` }
    );
    alert('HTML file downloaded! Open it and press Ctrl+P to save as PDF.');
  };

  const handleOpenInNewTab = () => {
    printToPdfService.openInNewTabForPdf(editingState.editableHtml, { ...exportOptions, margin: `${exportOptions.margin}mm` });
    alert('Document opened in new tab. Press Ctrl+P to save as PDF.');
  };


  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className="w-full max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                PDF Editor {editingState.hasChanges && <span className="text-green-600">(Modified)</span>}
              </h2>
              <p className="text-gray-600">
                Edit your PDF content and export to PDF when ready
              </p>
            </div>
            
            <div className="flex space-x-2">
              {!isFullscreen && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Back
                </button>
              )}
              
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={handleBrowserPrint}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                🖨️ Print to PDF
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {viewMode === 'edit' ? (
            <div className="border">
              <div className="bg-blue-50 px-4 py-2 text-sm text-blue-700 border-b">
                📝 Edit your PDF content using the toolbar above. Click "Print to PDF" when finished.
              </div>
              <div 
                ref={editableRef}
                className="overflow-auto"
                style={{ 
                  height: isFullscreen ? 'calc(100vh - 200px)' : '70vh',
                  maxHeight: isFullscreen ? 'none' : '70vh'
                }}
              >
                <RichTextEditor
                  initialHtml={editingState.editableHtml}
                  onChange={handleRichTextChange}
                  onSelectionChange={handleSelectionChange}
                  className="h-full"
                />
              </div>
            </div>
          ) : (
            <div className="border">
              <div className="bg-purple-50 px-4 py-2 text-sm text-purple-700 border-b">
                🔍 View and edit the HTML source code of your PDF content
              </div>
              <div 
                className="overflow-auto"
                style={{ 
                  height: isFullscreen ? 'calc(100vh - 200px)' : '70vh',
                  maxHeight: isFullscreen ? 'none' : '70vh'
                }}
              >
                <pre className="p-4 text-sm font-mono bg-gray-50 overflow-auto">
                  <code className="language-html whitespace-pre-wrap">
                    {editingState.editableHtml}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Simple usage tip */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">💡</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-green-800 mb-1">How to use:</h3>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Edit your PDF content using the formatting toolbar</li>
                <li>Click "Print to PDF" button when finished</li>
                <li>Choose "Save as PDF" in your browser's print dialog</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}