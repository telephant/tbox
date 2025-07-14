const http = require('http');

// Simple test HTML content
const testHtml = `
  <div style="font-family: Arial; padding: 20px;">
    <h1>Server-side PDF Test</h1>
    <p>This is a test document generated using our fixed Puppeteer configuration.</p>
    <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background-color: #f0f0f0;">
        <th style="padding: 8px;">Feature</th>
        <th style="padding: 8px;">Status</th>
      </tr>
      <tr>
        <td style="padding: 8px;">Chrome Detection</td>
        <td style="padding: 8px; color: green;">✅ Fixed</td>
      </tr>
      <tr>
        <td style="padding: 8px;">PDF Generation</td>
        <td style="padding: 8px; color: green;">✅ Working</td>
      </tr>
      <tr>
        <td style="padding: 8px;">Clean Content Export</td>
        <td style="padding: 8px; color: green;">✅ Implemented</td>
      </tr>
    </table>
    <p style="margin-top: 20px; font-size: 14px; color: #666;">
      Generated on: ${new Date().toISOString()}
    </p>
  </div>
`;

const testData = JSON.stringify({
  html: testHtml,
  options: {
    filename: 'test-api-export.pdf',
    format: 'A4',
    orientation: 'portrait',
    margin: 10,
    scale: 1
  }
});

console.log('Testing PDF generation API...');
console.log('Server should be running on http://localhost:3000');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate-pdf',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\nAPI Response:');
      console.log('Success:', response.success);
      
      if (response.success) {
        console.log('✅ PDF generation successful!');
        console.log('Filename:', response.filename);
        console.log('PDF data length:', response.pdfData ? response.pdfData.length : 0, 'characters');
        
        if (response.pdfData) {
          console.log('PDF size:', Math.round(response.pdfData.length * 0.75), 'bytes (estimated)');
        }
      } else {
        console.log('❌ PDF generation failed:', response.error);
      }
    } catch (error) {
      console.log('❌ Failed to parse response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request failed:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Make sure the development server is running: pnpm run dev');
  console.log('2. Verify the server is accessible at http://localhost:3000');
  console.log('3. Check the API endpoint is available at /api/generate-pdf');
});

req.write(testData);
req.end();

console.log('Request sent. Waiting for response...');