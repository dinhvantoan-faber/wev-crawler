import { chromium } from 'playwright';

export class BrowserManager {
  constructor() {
    this.browser = null;
    this.browserPromise = null;
    this.activePagesCount = 0;
    this.maxPages = 10; // Limit concurrent pages
  }

  async getBrowser() {
    // If browser exists and is connected, return it
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    // If initialization is already in progress, wait for it
    if (this.browserPromise) {
      return await this.browserPromise;
    }

    // Start new initialization
    this.browserPromise = this._initializeBrowser();
    
    try {
      this.browser = await this.browserPromise;
      return this.browser;
    } catch (error) {
      // Reset promise on failure so next request can retry
      this.browserPromise = null;
      throw error;
    }
  }

  async _initializeBrowser() {
    try {
      console.log('Initializing browser...');
      const browser = await chromium.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      // Handle browser disconnect
      browser.on('disconnected', () => {
        console.log('Browser disconnected, resetting...');
        this.browser = null;
        this.browserPromise = null;
        this.activePagesCount = 0;
      });

      console.log('Browser initialized successfully');
      return browser;
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async createPage() {
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const retryInterval = 5000; // Check every 5 seconds
    const startTime = Date.now();

    // Retry loop for up to 5 minutes
    while (Date.now() - startTime < maxWaitTime) {
      if (this.activePagesCount < this.maxPages) {
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        
        this.activePagesCount++;
        
        // Track page close to update count
        page.on('close', () => {
          this.activePagesCount = Math.max(0, this.activePagesCount - 1);
        });

        return page;
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }

    // If we've waited 5 minutes and still can't create a page, throw error
    throw new Error(`Maximum number of pages (${this.maxPages}) reached. Waited 5 minutes for available slot.`);
  }

  async closeBrowser() {
    if (this.browser) {
      try {
        await this.browser.close();
        console.log('Browser closed successfully');
      } catch (error) {
        console.error('Error closing browser:', error);
      } finally {
        this.browser = null;
        this.browserPromise = null;
        this.activePagesCount = 0;
      }
    }
  }

  getStats() {
    return {
      isConnected: this.browser?.isConnected() || false,
      activePagesCount: this.activePagesCount,
      maxPages: this.maxPages
    };
  }
}

// Singleton instance
export const browserManager = new BrowserManager();
