import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              PDF Online Editor
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Edit your PDF documents directly in the browser with our powerful online editor. 
              Modify text, formatting, and layout, then export back to PDF instantly.
            </p>
          </div>

          <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
            <Link
              href="/converter"
              className="rounded-xl border border-solid border-transparent transition-all duration-200 flex items-center justify-center bg-slate-900 text-white gap-3 hover:bg-slate-800 hover:shadow-lg font-semibold text-lg h-14 px-10 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Start Editing
            </Link>
            <a
              className="rounded-xl border border-solid border-slate-300 transition-all duration-200 flex items-center justify-center hover:bg-white hover:shadow-md hover:border-slate-400 font-semibold text-lg h-14 px-10 text-slate-700"
              href="#features"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Lightning Fast</h3>
            <p className="text-slate-600 leading-relaxed">
              Edit PDF files in seconds with our optimized processing engine powered by pdf2htmlEX.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">High Quality</h3>
            <p className="text-slate-600 leading-relaxed">
              Preserve fonts, images, and formatting with pixel-perfect editing quality and embedded resources.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
            <div className="w-14 h-14 bg-violet-50 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure & Private</h3>
            <p className="text-slate-600 leading-relaxed">
              Your files are processed securely and automatically deleted after editing. No data is stored.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Upload PDF</h3>
              <p className="text-slate-600 leading-relaxed">
                Drag and drop your PDF file or click to select. Files up to 50MB are supported for editing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Edit Content</h3>
              <p className="text-slate-600 leading-relaxed">
                Use the rich text editor to modify text, formatting, fonts, and layout as needed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Export PDF</h3>
              <p className="text-slate-600 leading-relaxed">
                Export your edited document back to PDF format for sharing or printing.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-slate-900 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Edit Your PDFs?
          </h2>
          <p className="text-xl mb-8 text-slate-300">
            Join thousands of users who trust our PDF online editor for their document needs.
          </p>
          <Link
            href="/converter"
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-all duration-200 shadow-lg transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Start Editing Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <a
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              href="https://nextjs.org/learn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Documentation
            </a>
            <a
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              GitHub
            </a>
            <a
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />
              Powered by Next.js
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
