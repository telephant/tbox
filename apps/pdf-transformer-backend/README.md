# PDF Transformer Backend

A Node.js backend service that converts PDF files to HTML using pdf2htmlEX in a Docker container.

## Features

- Convert PDF files to HTML with embedded resources
- Configurable conversion options (fonts, images, JavaScript, outline)
- Docker-based pdf2htmlEX integration
- RESTful API with file upload support
- Comprehensive error handling
- Unit and integration tests
- File type validation (PDF only)
- File size limits (50MB max)
- Automatic cleanup of temporary files
- CORS support for frontend integration
- TypeScript support

## Prerequisites

- Node.js 18+
- Docker
- pnpm (or npm/yarn)

Before running this service, you need to have **Docker** installed on your system:

### macOS
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop/
# Or using Homebrew
brew install --cask docker
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

### Other systems
Please refer to the [Docker documentation](https://docs.docker.com/get-docker/) for installation instructions.

The service will automatically pull the `bwits/pdf2htmlex` Docker image on first use.

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Build the TypeScript code:
```bash
pnpm build
```

## Running the Service

### Development Mode

```bash
pnpm dev
```

### Production Mode with Docker Compose

```bash
docker-compose up
```

This will start both the Node.js backend and pdf2htmlEX services.

### Production Mode (standalone)

```bash
pnpm start
```

Note: Make sure Docker is running as the service uses Docker to run pdf2htmlEX.

## API Endpoints

### Health Check
```
GET /health
```

Returns server status and timestamp.

### Convert PDF to HTML
```
POST /convert
```

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: PDF file (required, max 50MB)
  - `embedFonts`: boolean (optional, default: true)
  - `embedImages`: boolean (optional, default: true)
  - `embedJavascript`: boolean (optional, default: true)
  - `embedOutline`: boolean (optional, default: true)
  - `splitPages`: boolean (optional, default: false)
  - `zoom`: number (optional)
  - `dpi`: number (optional)

**Response:**
```json
{
  "html": "<html>...</html>",
  "originalFilename": "document.pdf",
  "convertedAt": "2024-01-01T00:00:00.000Z",
  "processingTime": 1500
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Usage Examples

### Using curl
```bash
# Basic conversion
curl -X POST \
  -F "file=@/path/to/your/document.pdf" \
  http://localhost:3000/convert

# With custom options
curl -X POST \
  -F "file=@/path/to/your/document.pdf" \
  -F "splitPages=true" \
  -F "zoom=1.5" \
  -F "dpi=300" \
  http://localhost:3000/convert
```

### Using JavaScript (Frontend)
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

fetch('http://localhost:3000/convert', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Converted HTML:', data.html);
})
.catch(error => {
  console.error('Error:', error);
});
```

## Testing

Run unit tests:
```bash
pnpm test
```

Run tests with coverage:
```bash
pnpm test:coverage
```

Run tests in watch mode:
```bash
pnpm test:watch
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `FRONTEND_URL`: CORS allowed origin (default: *)

## Docker Integration

The service uses the `bwits/pdf2htmlex` Docker image for PDF conversion. The Docker setup includes:

- **Dockerfile**: Builds the Node.js application
- **docker-compose.yml**: Orchestrates the backend and pdf2htmlEX services

## Project Structure

```
pdf-transformer-backend/
├── src/
│   ├── lib/
│   │   ├── pdf-converter.ts      # PDF conversion service
│   │   └── __tests__/
│   │       └── pdf-converter.test.ts
│   ├── __tests__/
│   │   └── server.test.ts        # API integration tests
│   └── server.ts                 # Express server
├── uploads/                      # Temporary PDF storage
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── tsconfig.json
└── package.json
```

## Notes

- Uploaded PDF files are automatically deleted after conversion
- The service embeds fonts, CSS, and images into the HTML output
- Maximum file size is 50MB
- Only PDF files are accepted 