const fs = require('fs');
const path = require('path');

async function testHtmlToPdf() {
  console.log('Testing HTML to PDF conversion...');
  
  const testHtml = `
    <html>
      <head>
        <title>Test Document</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; border-bottom: 2px solid #007acc; }
          p { line-height: 1.6; color: #555; }
          .editable { background: #f9f9f9; padding: 10px; border-left: 4px solid #007acc; }
        </style>
      </head>
      <body>
        <h1>Test PDF Document</h1>
        <p>This is a test of HTML to PDF conversion with styling.</p>
        <div class="editable">
          <p>This text block could be editable in the PDF editor.</p>
          <p>It has special styling to indicate it's an editable region.</p>
        </div>
        <p>The conversion should preserve all CSS styling and layout.</p>
      </body>
    </html>
  `;
  
  try {
    const response = await fetch('http://localhost:3000/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: testHtml,
        options: {
          filename: 'test-workflow.pdf',
          format: 'A4',
          margin: 20
        }
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ HTML to PDF conversion successful!');
      console.log(`📄 Generated PDF: ${result.filename}`);
      console.log(`⏱️  Processing time: ${result.processingTime}ms`);
      console.log(`📦 PDF data size: ${result.pdfData.length} characters (base64)`);
      
      // Save the PDF to file for verification
      const pdfBuffer = Buffer.from(result.pdfData, 'base64');
      const outputPath = path.join(__dirname, 'test-output.pdf');
      fs.writeFileSync(outputPath, pdfBuffer);
      console.log(`💾 PDF saved to: ${outputPath}`);
      
    } else {
      console.error('❌ HTML to PDF conversion failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testHtmlToPdf();