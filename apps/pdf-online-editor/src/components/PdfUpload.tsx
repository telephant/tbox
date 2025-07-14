'use client';

import { useState, useCallback } from 'react';
import { PdfConverterService, ConversionResult, ConversionOptions } from '../services/pdfConverter';

interface PdfUploadProps {
  onConversionComplete: (result: ConversionResult) => void;
  onError: (error: string) => void;
}

export default function PdfUpload({ onConversionComplete, onError }: PdfUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    embedFonts: true,
    embedImages: true,
    embedJavascript: true,
    embedOutline: true,
    splitPages: false,
  });

  const pdfService = new PdfConverterService();

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      onError('Please select a PDF file');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      onError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
  }, [onError]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleConvert = async () => {
    if (!selectedFile) {
      onError('Please select a PDF file first');
      return;
    }

    setIsUploading(true);
    
    try {
      const result = await pdfService.convertPdfToHtml(selectedFile, options);
      onConversionComplete(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Conversion failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOptionChange = (key: keyof ConversionOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        PDF to HTML Converter
      </h2>

      {/* File Upload Area */}
      <div
        data-testid="upload-area"
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          {selectedFile ? (
            <div className="text-green-600">
              <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
              </svg>
              <p className="text-lg font-medium mb-2">
                Drop your PDF file here or click to select
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: 50MB
              </p>
            </div>
          )}
        </div>

        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
        >
          Select PDF File
        </label>
      </div>

      {/* Conversion Options */}
      {selectedFile && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Conversion Options</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.embedFonts}
                onChange={(e) => handleOptionChange('embedFonts', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Embed Fonts</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.embedImages}
                onChange={(e) => handleOptionChange('embedImages', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Embed Images</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.embedJavascript}
                onChange={(e) => handleOptionChange('embedJavascript', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Embed JavaScript</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.embedOutline}
                onChange={(e) => handleOptionChange('embedOutline', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Embed Outline</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.splitPages}
                onChange={(e) => handleOptionChange('splitPages', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Split Pages</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zoom Level
              </label>
              <input
                type="number"
                min="0.5"
                max="3"
                step="0.1"
                value={options.zoom || ''}
                onChange={(e) => handleOptionChange('zoom', e.target.value ? parseFloat(e.target.value) : 1)}
                placeholder="Auto"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DPI
              </label>
              <input
                type="number"
                min="72"
                max="600"
                value={options.dpi || ''}
                onChange={(e) => handleOptionChange('dpi', parseInt(e.target.value) || undefined)}
                placeholder="Auto"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Convert Button */}
      {selectedFile && (
        <div className="mt-6 text-center">
          <button
            onClick={handleConvert}
            disabled={isUploading}
            className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
              isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Converting...</span>
              </div>
            ) : (
              'Convert to HTML'
            )}
          </button>
        </div>
      )}
    </div>
  );
}