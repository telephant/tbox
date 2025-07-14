'use client';

import { useState } from 'react';
import { ConversionResult } from '../services/pdfConverter';
import EditableHtmlViewer from './EditableHtmlViewer';

interface HtmlDisplayProps {
  result: ConversionResult;
  onBack: () => void;
}

export default function HtmlDisplay({ result, onBack }: HtmlDisplayProps) {
  const [useEditor, setUseEditor] = useState(false);

  if (useEditor) {
    return <EditableHtmlViewer result={result} onBack={onBack} />;
  }

  const downloadHtml = () => {
    const blob = new Blob([result.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.originalFilename.replace('.pdf', '')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.html);
      alert('HTML code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Conversion Complete</h2>
            <p className="text-gray-600">
              {result.originalFilename} → HTML (processed in {result.processingTime}ms)
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setUseEditor(true)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              🖊️ Edit & Export PDF
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Copy HTML
            </button>
            <button
              onClick={downloadHtml}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Download HTML
            </button>
          </div>
        </div>
      </div>

      {/* Content Display */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border">
          <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b">
            HTML Preview - Click &quot;Edit &amp; Export PDF&quot; to make changes
          </div>
          <div 
            className="p-4 overflow-auto"
            style={{ height: '70vh' }}
          >
            <iframe
              srcDoc={result.html}
              className="w-full h-full border-0"
              title="PDF Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Conversion Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Original File:</span>
            <p className="text-gray-800">{result.originalFilename}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Processing Time:</span>
            <p className="text-gray-800">{result.processingTime}ms</p>
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
              {(new Blob([result.html]).size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}