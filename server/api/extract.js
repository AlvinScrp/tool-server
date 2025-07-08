import { extractXiaohongshuPuppeteer } from './utils/xhs-extract-puppeteer.js';
import { extractGeneralAxiosGet } from './utils/general-extract-axios-get.js';
import { extractXiaohongshuAxiosGet } from './utils/xhs-extract-axios-get.js';
const usePuppeteerForXhs = false;

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { url } = body;
    
    if (!url) {
      return {
        error: 'URL is required'
      };
    }

    const isXiaohongshuUrl =  url.includes('xiaohongshu.com') 
      || url.includes('xhs.cn') 
      || url.includes('xhslink.com');

    // 根据 URL 类型选择提取方法
    const extractFunction = isXiaohongshuUrl
      ? (usePuppeteerForXhs ? extractXiaohongshuPuppeteer : extractXiaohongshuAxiosGet) 
      : extractGeneralAxiosGet;

    return await extractFunction(url);
    
  } catch (error) {
    return {
      error: error.message
    };
  }
}); 