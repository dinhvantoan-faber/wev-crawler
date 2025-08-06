import { browserManager } from './browserManager.js';

export async function crawlHTML(url) {
  let page;
  const startTime = Date.now();
  
  try {
    // Validate URL
    try {
      new URL(url);
    } catch {
      return {
        success: false,
        error: 'Invalid URL format'
      };
    }

    page = await browserManager.createPage();

    // Set reasonable timeouts and headers
    await page.setDefaultTimeout(60000);
    await page.setDefaultNavigationTimeout(60000);

    // Set user-agent to mimic real browser
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    });

    // Navigate to URL with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await page.goto(url, { 
          waitUntil: 'networkidle', 
          timeout: 30000 
        });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`Retrying navigation to ${url}, ${retries} attempts left`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Extract content
    const [html, title] = await Promise.all([
      page.content(),
      page.title()
    ]);

    const responseTime = Date.now() - startTime;

    return {
      success: true,
      title,
      html,
      url,
      responseTime,
      stats: browserManager.getStats()
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error.message,
      url,
      responseTime,
      stats: browserManager.getStats()
    };
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (error) {
        console.error('Error closing page:', error);
      }
    }
  }
}

export async function closeBrowser() {
  await browserManager.closeBrowser();
}

export function getBrowserStats() {
  return browserManager.getStats();
}
