import { chromium } from 'playwright';

export async function crawlHTML(url) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Set user-agent to mimic real browser
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Fastify-Playwright-Crawler/1.0'
    });

    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });

    // Extract full rendered HTML
    const html = await page.content();

    // Example: extract page title
    const title = await page.title();

    return {
      success: true,
      title,
      html
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
