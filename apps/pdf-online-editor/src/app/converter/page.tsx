'use client';

import { useState } from 'react';
import PdfUpload from '../../components/PdfUpload';
import HtmlDisplay from '../../components/HtmlDisplay';
import { ConversionResult } from '../../services/pdfConverter';

export default function ConverterPage() {
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleConversionComplete = (result: ConversionResult) => {
    setConversionResult(result);
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setConversionResult(null);
  };

  const handleBack = () => {
    setConversionResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            PDF to HTML Converter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Convert your PDF files to clean, responsive HTML with embedded fonts, images, and styling.
            Perfect for web publishing and document sharing.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Conversion Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError('')}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-400 hover:bg-red-100"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {conversionResult ? (
          <HtmlDisplay 
            result={conversionResult} 
            onBack={handleBack}
          />
        ) : (
          <PdfUpload 
            onConversionComplete={handleConversionComplete}
            onError={handleError}
          />
        )}

        {/* Features Section */}
        {!conversionResult && (
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
              Why Choose Our PDF to HTML Converter?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Convert PDF files to HTML in seconds with our optimized processing engine.
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">High Quality</h3>
                <p className="text-gray-600">
                  Preserve fonts, images, and formatting with pixel-perfect conversion quality.
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure & Private</h3>
                <p className="text-gray-600">
                  Your files are processed securely and automatically deleted after conversion.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-blue-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Advanced Conversion Options
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Embedding Options</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Embed fonts for consistent display</li>
                    <li>• Include images directly in HTML</li>
                    <li>• Preserve JavaScript interactions</li>
                    <li>• Maintain document outline</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Output Settings</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Adjustable zoom levels</li>
                    <li>• Custom DPI settings</li>
                    <li>• Single page or split pages</li>
                    <li>• Responsive HTML output</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}