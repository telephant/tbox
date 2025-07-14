# PDF Online Editor

A modern web application for converting PDF files to HTML using a powerful backend service. Built with Next.js and Tailwind CSS for a seamless user experience.

## Features

- **Drag & Drop Upload**: Easy PDF file upload with drag and drop support
- **Real-time Preview**: Preview converted HTML immediately in the browser
- **Download Options**: Download the converted HTML file or copy to clipboard
- **Conversion Options**: Configurable embedding settings, zoom, DPI, and more
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error messages and validation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend Communication**: Fetch API with FormData
- **File Handling**: Drag & Drop, File validation

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Backend service running on port 3000 (see `../pdf-transformer-backend`)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3002](http://localhost:3002) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── converter/
│   │   └── page.tsx          # PDF converter page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── PdfUpload.tsx         # PDF upload component
│   └── HtmlDisplay.tsx       # HTML display component
└── services/
    └── pdfConverter.ts       # Backend API service
```

## Usage

1. **Upload PDF**: 
   - Drag and drop a PDF file onto the upload area
   - Or click to select a file from your computer
   - Files up to 50MB are supported

2. **Configure Options**:
   - Choose embedding options (fonts, images, JavaScript, outline)
   - Set zoom level and DPI if needed
   - Enable page splitting if desired

3. **Convert & Preview**:
   - Click "Convert to HTML" to start the conversion
   - Preview the result in the browser
   - Switch between preview and source code view

4. **Download**:
   - Download the HTML file
   - Copy HTML source to clipboard

## API Integration

The frontend communicates with the PDF transformer backend via REST API:

- `GET /health` - Check backend status
- `POST /convert` - Convert PDF to HTML with multipart form data

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Features in Detail

### File Upload
- Drag and drop interface
- File type validation (PDF only)
- File size validation (50MB limit)
- Progress indicators

### Conversion Options
- **Embed Fonts**: Include fonts in HTML output
- **Embed Images**: Include images directly in HTML
- **Embed JavaScript**: Preserve interactive elements
- **Embed Outline**: Include document outline
- **Split Pages**: Generate separate HTML files for each page
- **Zoom Level**: Adjust rendering zoom (0.5x to 3x)
- **DPI Settings**: Custom DPI for image quality

### Display Features
- **Preview Mode**: Live HTML preview in iframe
- **Source Mode**: Syntax-highlighted HTML source
- **Fullscreen View**: Distraction-free preview
- **Download**: Save HTML file locally
- **Copy to Clipboard**: Quick copy for developers

## Error Handling

The application handles various error scenarios:
- Invalid file types
- File size exceeded
- Backend service unavailable
- Conversion failures
- Network errors

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## License

This project is part of the PDF transformer monorepo.
