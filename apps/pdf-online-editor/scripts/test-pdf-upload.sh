#!/bin/bash

# Create a minimal valid PDF file for testing
echo "Creating test PDF..."
cat > test.pdf << 'EOF'
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Hello World!) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000229 00000 n 
0000000328 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
418
%%EOF
EOF

echo "Testing PDF upload to API..."
# Test the upload
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.pdf" \
  -F "embedFonts=true" \
  -F "embedImages=true" \
  -F "embedJavascript=true" \
  -F "embedOutline=true" \
  -F "splitPages=false" \
  | jq '.'

# Clean up
rm test.pdf

echo "Test complete!"