import puppeteer from 'puppeteer';

class BrowserPool {
  constructor(poolSize = 2) {
    this.poolSize = poolSize;
    this.browsers = [];
    this.currentIndex = 0;
    this.requestCount = new Map();
    this.maxRequestsPerBrowser = 50;
    this.maxBrowserAge = 30 * 60 * 1000;
    this.browserCreationTime = new Map();
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      console.log(`[BrowserPool] Initializing pool with ${this.poolSize} browsers...`);

      for (let i = 0; i < this.poolSize; i++) {
        try {
          const browser = await this.createBrowser(i);
          this.browsers.push(browser);
          this.requestCount.set(browser, 0);
          this.browserCreationTime.set(browser, Date.now());
          console.log(`[BrowserPool] Browser ${i + 1}/${this.poolSize} created`);
        } catch (error) {
          console.error(`[BrowserPool] Failed to create browser ${i + 1}:`, error.message);
        }
      }

      this.isInitialized = true;
      console.log(`[BrowserPool] Pool initialized with ${this.browsers.length} browsers`);
    })();

    return this.initializationPromise;
  }

  async createBrowser(index) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    browser.poolIndex = index;
    return browser;
  }

  async getBrowser() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.browsers.length === 0) {
      throw new Error('No browsers available in pool');
    }

    const browser = this.browsers[this.currentIndex];
    const requestCount = this.requestCount.get(browser) || 0;
    const browserAge = Date.now() - (this.browserCreationTime.get(browser) || Date.now());

    if (requestCount >= this.maxRequestsPerBrowser || browserAge >= this.maxBrowserAge) {
      console.log(`[BrowserPool] Browser ${browser.poolIndex} needs refresh (requests: ${requestCount}, age: ${Math.round(browserAge / 1000)}s)`);
      await this.refreshBrowser(this.currentIndex);
    }

    this.currentIndex = (this.currentIndex + 1) % this.browsers.length;
    return browser;
  }

  async refreshBrowser(index) {
    const oldBrowser = this.browsers[index];

    try {
      await oldBrowser.close();
      console.log(`[BrowserPool] Closed old browser ${index}`);
    } catch (error) {
      console.error(`[BrowserPool] Error closing browser ${index}:`, error.message);
    }

    try {
      const newBrowser = await this.createBrowser(index);
      this.browsers[index] = newBrowser;
      this.requestCount.set(newBrowser, 0);
      this.browserCreationTime.set(newBrowser, Date.now());
      this.requestCount.delete(oldBrowser);
      this.browserCreationTime.delete(oldBrowser);
      console.log(`[BrowserPool] Browser ${index} refreshed successfully`);
    } catch (error) {
      console.error(`[BrowserPool] Failed to refresh browser ${index}:`, error.message);
      throw error;
    }
  }

  incrementRequestCount(browser) {
    const currentCount = this.requestCount.get(browser) || 0;
    this.requestCount.set(browser, currentCount + 1);
  }

  async fetchWithPuppeteer(url, options = {}) {
    const browser = await this.getBrowser();
    let page;

    try {
      page = await browser.newPage();

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      });

      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });

        window.navigator.chrome = {
          runtime: {},
        };

        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });

        Object.defineProperty(navigator, 'languages', {
          get: () => ['ja-JP', 'ja', 'en-US', 'en'],
        });
      });

      const timeout = options.timeout || 30000;
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout
      });

      const html = await page.content();
      const status = response.status();

      this.incrementRequestCount(browser);

      return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => html,
        headers: response.headers()
      };
    } finally {
      if (page) {
        await page.close().catch(err => {
          console.error('[BrowserPool] Error closing page:', err.message);
        });
      }
    }
  }

  async close() {
    console.log('[BrowserPool] Closing all browsers...');

    for (const browser of this.browsers) {
      try {
        await browser.close();
      } catch (error) {
        console.error('[BrowserPool] Error closing browser:', error.message);
      }
    }

    this.browsers = [];
    this.requestCount.clear();
    this.browserCreationTime.clear();
    this.isInitialized = false;
    this.initializationPromise = null;

    console.log('[BrowserPool] All browsers closed');
  }

  getStats() {
    return {
      poolSize: this.poolSize,
      activeBrowsers: this.browsers.length,
      requestCounts: Array.from(this.requestCount.entries()).map(([browser, count]) => ({
        index: browser.poolIndex,
        requests: count,
        age: Math.round((Date.now() - this.browserCreationTime.get(browser)) / 1000)
      }))
    };
  }
}

const browserPool = new BrowserPool(2);

export default browserPool;
