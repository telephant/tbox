import { Browser, PuppeteerLaunchOptions } from 'puppeteer';
import puppeteer from 'puppeteer';

export interface PuppeteerConfig {
  getBrowser(): Promise<Browser>;
  getDefaultLaunchOptions(): PuppeteerLaunchOptions;
}

class PuppeteerConfigImpl implements PuppeteerConfig {
  private static instance: PuppeteerConfigImpl;
  private browserInstance: Browser | null = null;

  public static getInstance(): PuppeteerConfigImpl {
    if (!PuppeteerConfigImpl.instance) {
      PuppeteerConfigImpl.instance = new PuppeteerConfigImpl();
    }
    return PuppeteerConfigImpl.instance;
  }

  public getDefaultLaunchOptions(): PuppeteerLaunchOptions {
    const isProduction = process.env.NODE_ENV === 'production';

    // Base options that work across environments
    const baseOptions: PuppeteerLaunchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
      ],
    };

    // Production-specific options (for deployment environments)
    if (isProduction) {
      baseOptions.args?.push(
        '--no-zygote',
        '--single-process', // Helps in container environments
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--metrics-recording-only',
        '--safebrowsing-disable-auto-update',
        '--disable-crash-reporter'
      );
    }

    return baseOptions;
  }

  public async getBrowser(): Promise<Browser> {
    if (this.browserInstance && this.browserInstance.isConnected()) {
      return this.browserInstance;
    }

    const launchOptions = this.getDefaultLaunchOptions();

    // Method 1: Try to find system Chrome first (most reliable)
    const executablePath = await this.findChromeExecutable();
    if (executablePath) {
      try {
        this.browserInstance = await puppeteer.launch({
          ...launchOptions,
          executablePath,
        });
        console.log(`✅ Puppeteer launched with system Chrome at: ${executablePath}`);
        return this.browserInstance;
      } catch (systemError) {
        console.log('⚠️ System Chrome launch failed, trying alternatives...', systemError);
      }
    }

    // Method 2: Try default launch (bundled Chromium)
    try {
      this.browserInstance = await puppeteer.launch(launchOptions);
      console.log('✅ Puppeteer launched with default configuration');
      return this.browserInstance;
    } catch (error) {
      console.log('⚠️ Default Puppeteer launch failed, trying bundled Chromium...');
      
      // Method 3: Try with explicit bundled Chromium executable
      try {
        const bundledPath = puppeteer.executablePath();
        console.log(`Trying bundled Chromium at: ${bundledPath}`);
        
        this.browserInstance = await puppeteer.launch({
          ...launchOptions,
          executablePath: bundledPath,
        });
        console.log('✅ Puppeteer launched with bundled Chromium');
        return this.browserInstance;
      } catch (bundledError) {
        console.log('⚠️ Bundled Chromium launch failed');
      }

      // Method 4: Try with minimal options
      try {
        this.browserInstance = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        console.log('✅ Puppeteer launched with minimal configuration');
        return this.browserInstance;
      } catch (minimalError) {
        console.log('❌ All Puppeteer launch methods failed');
      }

      throw new Error(
        `Failed to launch Puppeteer. Please ensure Chrome or Chromium is installed. ` +
        `You can also run 'npx puppeteer browsers install chrome' to install bundled Chromium. ` +
        `Original error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async findChromeExecutable(): Promise<string | null> {
    const { default: fs } = await import('fs');

    // Possible Chrome/Chromium paths for different platforms
    const possiblePaths = [
      // macOS
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      
      // Linux
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
      '/usr/bin/google-chrome-beta',
      '/usr/bin/google-chrome-unstable',
      
      // Windows
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Chromium\\Application\\chrome.exe',
      
      // Environment variable override
      process.env.PUPPETEER_EXECUTABLE_PATH,
      process.env.CHROME_BIN,
      process.env.CHROMIUM_BIN,
    ].filter(Boolean) as string[];

    for (const executablePath of possiblePaths) {
      try {
        if (fs.existsSync(executablePath)) {
          console.log(`Found Chrome executable: ${executablePath}`);
          return executablePath;
        }
      } catch (error) {
        // Continue checking other paths
        continue;
      }
    }

    console.log('No Chrome executable found in standard locations');
    return null;
  }

  public async closeBrowser(): Promise<void> {
    if (this.browserInstance) {
      await this.browserInstance.close();
      this.browserInstance = null;
      console.log('Browser closed');
    }
  }
}

// Export singleton instance
export const puppeteerConfig = PuppeteerConfigImpl.getInstance();