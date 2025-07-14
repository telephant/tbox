const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('Testing Puppeteer configuration...');
  
  try {
    // Test 1: Default launch
    console.log('\n1. Testing default launch...');
    let browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent('<h1>Test PDF Generation</h1><p>This is a test document.</p>');
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });
    
    await browser.close();
    console.log('✅ Default launch successful, PDF generated:', pdf.length, 'bytes');
    
  } catch (error) {
    console.log('❌ Default launch failed:', error.message);
    
    // Test 2: Try with explicit Chrome path
    try {
      console.log('\n2. Testing with explicit Chrome path...');
      const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: chromePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent('<h1>Test PDF Generation</h1><p>This is a test document with explicit Chrome path.</p>');
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true
      });
      
      await browser.close();
      console.log('✅ Explicit Chrome path successful, PDF generated:', pdf.length, 'bytes');
      
    } catch (explicitError) {
      console.log('❌ Explicit Chrome path failed:', explicitError.message);
      
      // Test 3: Try with bundled Chromium
      try {
        console.log('\n3. Testing with bundled Chromium...');
        
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: puppeteer.executablePath(),
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent('<h1>Test PDF Generation</h1><p>This is a test document with bundled Chromium.</p>');
        
        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true
        });
        
        await browser.close();
        console.log('✅ Bundled Chromium successful, PDF generated:', pdf.length, 'bytes');
        
      } catch (bundledError) {
        console.log('❌ Bundled Chromium failed:', bundledError.message);
        console.log('\n🔍 Troubleshooting information:');
        console.log('   - Puppeteer version:', require('puppeteer/package.json').version);
        console.log('   - Expected Chromium path:', puppeteer.executablePath());
        console.log('   - System Chrome path: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
        
        process.exit(1);
      }
    }
  }
  
  console.log('\n✅ Puppeteer configuration test completed successfully!');
}

testPuppeteer().catch(console.error);