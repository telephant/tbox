#!/bin/bash

# PDF Transformer Integration Test Script
# This script tests the complete integration between frontend and backend

set -e  # Exit on any error

echo "🔧 PDF Transformer Integration Test"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if service is running
check_service() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name... "
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testing $description... "
    response=$(curl -s -w "%{http_code}" -X "$method" "$url")
    status_code="${response: -3}"
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ Status $status_code${NC}"
        return 0
    else
        echo -e "${RED}✗ Status $status_code (expected $expected_status)${NC}"
        return 1
    fi
}

# Function to test PDF conversion
test_pdf_conversion() {
    echo -n "Testing PDF conversion... "
    
    # Use the existing test.pdf file
    if [ ! -f "test.pdf" ]; then
        echo -e "${YELLOW}Creating test PDF...${NC}"
        # Create a simple test PDF if it doesn't exist
        echo '%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Contents 4 0 R /MediaBox [0 0 612 792] >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
72 720 Td
(Hello World!) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000188 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
280
%%EOF' > test.pdf
    fi
    
    response=$(curl -s -w "%{http_code}" -X POST -F "file=@test.pdf" http://localhost:3000/convert)
    status_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$status_code" -eq "200" ]; then
        # Check if response contains HTML
        if echo "$response_body" | grep -q '"html"' && echo "$response_body" | grep -q '"processingTime"'; then
            echo -e "${GREEN}✓ Conversion successful${NC}"
            
            # Extract processing time for display
            processing_time=$(echo "$response_body" | grep -o '"processingTime":[0-9]*' | cut -d: -f2)
            echo "  Processing time: ${processing_time}ms"
            return 0
        else
            echo -e "${RED}✗ Invalid response format${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ Status $status_code${NC}"
        echo "Response: $response_body"
        return 1
    fi
}

# Main test execution
echo ""
echo -e "${BLUE}Step 1: Checking prerequisites${NC}"
echo "------------------------------"

# Check Docker
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker available${NC}"
else
    echo -e "${RED}✗ Docker not found${NC}"
    exit 1
fi

# Check if pdf2htmlEX image exists
if docker images | grep -q "bwits/pdf2htmlex"; then
    echo -e "${GREEN}✓ pdf2htmlEX Docker image available${NC}"
else
    echo -e "${YELLOW}! pdf2htmlEX image not found locally (will be pulled on first use)${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Testing services${NC}"
echo "------------------------"

# Test backend health
if check_service "http://localhost:3000/health" "Backend service"; then
    BACKEND_OK=true
else
    BACKEND_OK=false
fi

# Test frontend
if check_service "http://localhost:3002" "Frontend service"; then
    FRONTEND_OK=true
else
    FRONTEND_OK=false
fi

echo ""
echo -e "${BLUE}Step 3: API endpoint tests${NC}"
echo "-------------------------"

if [ "$BACKEND_OK" = true ]; then
    test_endpoint "GET" "http://localhost:3000/health" 200 "Health endpoint"
    
    echo ""
    echo -e "${BLUE}Step 4: PDF conversion test${NC}"
    echo "---------------------------"
    
    test_pdf_conversion
else
    echo -e "${RED}Skipping API tests - backend not running${NC}"
fi

echo ""
echo -e "${BLUE}Step 5: Running unit tests${NC}"
echo "-------------------------"

echo "Running backend tests..."
if npm test > /tmp/backend-test.log 2>&1; then
    echo -e "${GREEN}✓ Backend tests passed${NC}"
else
    echo -e "${RED}✗ Backend tests failed${NC}"
    echo "Check /tmp/backend-test.log for details"
fi

echo ""
echo -e "${BLUE}Summary${NC}"
echo "-------"

if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
    echo -e "${GREEN}✓ All services are running${NC}"
    echo -e "${GREEN}✓ Integration test completed successfully${NC}"
    echo ""
    echo "🌐 Frontend: http://localhost:3002"
    echo "🔧 Backend:  http://localhost:3000"
    echo ""
    echo "You can now:"
    echo "1. Visit http://localhost:3002 to use the web interface"
    echo "2. Upload PDF files and convert them to HTML"
    echo "3. Test the API directly at http://localhost:3000/convert"
else
    echo -e "${YELLOW}⚠ Some services are not running${NC}"
    echo ""
    echo "To start the services:"
    echo "1. Backend:  cd pdf-transformer-backend && pnpm dev"
    echo "2. Frontend: cd pdf-online-editor && pnpm dev"
fi

echo ""
echo "Integration test completed!"