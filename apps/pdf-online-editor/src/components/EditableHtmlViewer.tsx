'use client';

import { useState, useRef } from 'react';
import { ConversionResult } from '../services/pdfConverter';
import { PrintToPdfService } from '../services/printToPdfService';
import { ManualPdfService } from '../services/manualPdfService';
import { ServerPdfService, ServerPdfOptions } from '../services/serverPdfService';

interface EditableHtmlViewerProps {
  result: ConversionResult;
  onBack: () => void;
}

interface EditingState {
  isEditing: boolean;
  editableHtml: string;
  hasChanges: boolean;
}

export default function EditableHtmlViewer({ result, onBack }: EditableHtmlViewerProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'edit' | 'code'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    editableHtml: result.html,
    hasChanges: false
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

  // Parse HTML to extract text content and make it editable
  const makeHtmlEditable = (html: string): string => {
    // Add contenteditable to text elements
    const editableHtml = html
      .replace(/<p([^>]*)>/g, '<p$1 contenteditable="true" data-editable="text">')
      .replace(/<span([^>]*)>/g, '<span$1 contenteditable="true" data-editable="text">')
      .replace(/<div([^>]*)>/g, '<div$1 contenteditable="true" data-editable="text">')
      .replace(/<h([1-6])([^>]*)>/g, '<h$1$2 contenteditable="true" data-editable="text">')
      .replace(/<td([^>]*)>/g, '<td$1 contenteditable="true" data-editable="text">')
      .replace(/<th([^>]*)>/g, '<th$1 contenteditable="true" data-editable="text">');
    
    return editableHtml;
  };

  // Extract edited content from the editable div
  const extractEditedContent = (): string => {
    if (!editableRef.current) return editingState.editableHtml;
    
    const editableDiv = editableRef.current.querySelector('iframe');
    if (!editableDiv) return editingState.editableHtml;
    
    try {
      const iframeDoc = editableDiv.contentDocument || editableDiv.contentWindow?.document;
      if (iframeDoc) {
        return iframeDoc.documentElement.outerHTML;
      }
    } catch (error) {
      console.error('Error extracting edited content:', error);
    }
    
    return editingState.editableHtml;
  };

  const handleStartEditing = () => {
    const editableHtml = makeHtmlEditable(editingState.editableHtml);
    setEditingState(prev => ({
      ...prev,
      isEditing: true,
      editableHtml
    }));
    setViewMode('edit');
  };

  const handleSaveChanges = () => {
    const newHtml = extractEditedContent();
    setEditingState(prev => ({
      ...prev,
      isEditing: false,
      editableHtml: newHtml,
      hasChanges: true
    }));
    setViewMode('preview');
  };

  const handleDiscardChanges = () => {
    setEditingState(prev => ({
      ...prev,
      isEditing: false,
      editableHtml: result.html,
      hasChanges: false
    }));
    setViewMode('preview');
  };

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

  const downloadEditedHtml = () => {
    const blob = new Blob([editingState.editableHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.originalFilename.replace('.pdf', '')}_edited.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editingState.editableHtml);
      alert('HTML code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    }
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
                {result.originalFilename} → Editable HTML
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
                onClick={() => setViewMode('preview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('edit')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {editingState.isEditing ? 'Editing...' : 'Edit Text'}
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'code'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                HTML Code
              </button>
            </div>

            <div className="flex space-x-2">
              {editingState.isEditing && (
                <>
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleDiscardChanges}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Discard
                  </button>
                </>
              )}
              
              {!editingState.isEditing && (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Copy HTML
                  </button>
                  <button
                    onClick={downloadEditedHtml}
                    className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  >
                    Download HTML
                  </button>
                  <button
                    onClick={handleBrowserPrint}
                    disabled={isExporting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    🖨️ Print to PDF
                  </button>
                  <button
                    onClick={handleServerPdfExport}
                    disabled={isExporting}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    📄 Generate PDF
                  </button>
                  <button
                    onClick={handleManualPdfExport}
                    disabled={isExporting}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
                  >
                    📱 Client PDF
                  </button>
                  <button
                    onClick={handleDownloadPrintableHtml}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  >
                    Printable HTML
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                  >
                    Open for Print
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {viewMode === 'preview' ? (
            <div className="border">
              <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b flex justify-between items-center">
                <span>HTML Preview</span>
                {!editingState.isEditing && (
                  <button
                    onClick={handleStartEditing}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                  >
                    Start Editing
                  </button>
                )}
              </div>
              <div 
                className="p-4 overflow-auto"
                style={{ 
                  height: isFullscreen ? 'calc(100vh - 200px)' : '70vh',
                  maxHeight: isFullscreen ? 'none' : '70vh'
                }}
              >
                <iframe
                  srcDoc={editingState.editableHtml}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </div>
          ) : viewMode === 'edit' ? (
            <div className="border">
              <div className="bg-green-100 px-4 py-2 text-sm text-green-700 border-b">
                Editing Mode - Click on any text to edit. Changes are highlighted.
              </div>
              <div 
                ref={editableRef}
                className="p-4 overflow-auto"
                style={{ 
                  height: isFullscreen ? 'calc(100vh - 200px)' : '70vh',
                  maxHeight: isFullscreen ? 'none' : '70vh'
                }}
              >
                <iframe
                  srcDoc={editingState.editableHtml}
                  className="w-full h-full border-0"
                  title="Editable PDF"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </div>
          ) : (
            <div className="border">
              <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b">
                HTML Source Code
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

        {/* Export Options */}
        {viewMode === 'preview' && !editingState.isEditing && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">PDF Export Options</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
                <select
                  value={exportOptions.paperSize}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    paperSize: e.target.value as 'A4' | 'A3' | 'Letter' | 'Legal'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
                <select
                  value={exportOptions.orientation}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    orientation: e.target.value as 'portrait' | 'landscape'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Scale</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  step="0.5"
                  value={exportOptions.scale || 2}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    scale: parseFloat(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                <input
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={exportOptions.quality || 0.95}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    quality: parseFloat(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <h4 className="font-medium text-blue-800 mb-2">PDF Export Methods:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>🖨️ Print to PDF:</strong> Uses browser's print dialog (most reliable)</li>
                <li><strong>📄 Generate PDF:</strong> Server-side Puppeteer generation (best quality, no client-side issues)</li>
                <li><strong>📱 Client PDF:</strong> Client-side canvas rendering (fallback method)</li>
                <li><strong>Printable HTML:</strong> Downloads HTML optimized for printing</li>
                <li><strong>Open for Print:</strong> Opens in new tab ready for Ctrl+P</li>
              </ul>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Document Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Original File:</span>
              <p className="text-gray-800">{result.originalFilename}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Status:</span>
              <p className="text-gray-800">
                {editingState.hasChanges ? 'Modified' : 'Original'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Assets:</span>
              <p className="text-gray-800">{result.assetCount} files</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Converted At:</span>
              <p className="text-gray-800">
                {new Date(result.convertedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">HTML Size:</span>
              <p className="text-gray-800">
                {(new Blob([editingState.editableHtml]).size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}