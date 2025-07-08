import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

export const extractXiaohongshuPuppeteer = async (url) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer',
    ],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9',
    });
    await page.setViewport({ width: 1200, height: 800 });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForSelector('title');
    const data = await page.evaluate(() => {
      const title = document.title;
      const videoList = Array.from(document.querySelectorAll('video')).map(v => v.src).filter(Boolean);
      const sourceBannerList = Array.from(document.querySelectorAll('img')).map(img => img.src)
      .filter((src)=>src.includes('sns-webpic-qc.xhscdn.com'));
      const bannerList = [...new Set(sourceBannerList)];
      
      let content = '';
      let noteTitle = '';
      let noteDesc = '';
      
      const titleElement = document.querySelector('#detail-title');
      if (titleElement) {
        noteTitle = titleElement.textContent?.trim() || '';
      }
      
      const descElement = document.querySelector('#detail-desc');
      if (descElement) {
        noteDesc = descElement.textContent?.trim() || '';
      }
      
      if (noteTitle || noteDesc) {
        content = noteDesc.trim();
      }
      
      return {
        title: noteTitle || title,
        videoList,
        content,
        bannerList,
        errorMessage: ''
      };
    });
    return data;
  } catch (error) {
    return {
      title: '',
      videoList: [],
      bannerList: [],
      content: '',
      errorMessage: error.message
    };
  } finally {
    await browser.close();
  }
}; 