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
  const options: ConversionOptions = {
    embedFonts: true,
    embedImages: true,
    embedJavascript: true,
    embedOutline: true,
    splitPages: false,
  };

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


  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
        PDF Online Editor
      </h2>

      {/* File Upload Area */}
      <div
        data-testid="upload-area"
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-slate-400 bg-slate-50 scale-105'
            : selectedFile
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="mb-6">
          {selectedFile ? (
            <div className="text-emerald-600">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold text-lg text-slate-900">{selectedFile.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-semibold mb-2 text-slate-700">
                Drop your PDF file here or click to select
              </p>
              <p className="text-sm text-slate-500">
                Maximum file size: 50MB • Ready for editing
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
          className="inline-block px-8 py-3 bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-slate-800 transition-all duration-200 font-semibold transform hover:scale-105 shadow-lg"
        >
          Select PDF to Edit
        </label>
      </div>


      {/* Convert Button */}
      {selectedFile && (
        <div className="mt-8 text-center">
          <button
            onClick={handleConvert}
            disabled={isUploading}
            className={`px-10 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg transform hover:scale-105 ${
              isUploading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isUploading ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Start Editing'
            )}
          </button>
        </div>
      )}
    </div>
  );
}