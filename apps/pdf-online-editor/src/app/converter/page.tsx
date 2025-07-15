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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            PDF Online Editor
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Edit your PDF files directly in the browser with rich text editing capabilities.
            Perfect for quick document modifications and instant PDF export.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-red-800">
                    Processing Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError('')}
                    className="inline-flex bg-red-50 rounded-lg p-2 text-red-400 hover:bg-red-100 transition-colors"
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
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              Why Choose Our PDF Online Editor?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Lightning Fast</h3>
                <p className="text-slate-600 leading-relaxed">
                  Edit PDF files in seconds with our optimized processing engine.
                </p>
              </div>

              <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">High Quality</h3>
                <p className="text-slate-600 leading-relaxed">
                  Preserve fonts, images, and formatting with pixel-perfect editing quality.
                </p>
              </div>

              <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                <div className="w-14 h-14 bg-violet-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Secure & Private</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your files are processed securely and automatically deleted after editing.
                </p>
              </div>
            </div>

            <div className="mt-16 bg-slate-50 rounded-2xl p-10 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
                Advanced Editing Features
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Rich Text Features</h4>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>• Bold, italic, underline formatting</li>
                    <li>• Font family and size selection</li>
                    <li>• Text and background colors</li>
                    <li>• Paragraph alignment options</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Export Options</h4>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>• Direct PDF export via browser</li>
                    <li>• Maintains original formatting</li>
                    <li>• Instant preview and edit</li>
                    <li>• No software installation needed</li>
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