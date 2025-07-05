const { extractXiaohongshuPuppeteer } = require('./xhs-extract-puppeteer.cjs');
const { extractGeneralAxiosGet } = require('./general-extract-axios-get.cjs');
const { extractXiaohongshuAxiosGet } = require('./xhs-extract-axios-get.cjs');

const url = process.argv[2];

if (!url) {
  console.error(JSON.stringify({ error: 'URL parameter is required' }));
  process.exit(1);
}

// 判断是否为小红书链接
const isXiaohongshuUrl = (url) => {
  return url.includes('xiaohongshu.com') 
  || url.includes('xhs.cn') 
  || url.includes('juejin.cn') 
  || url.includes('xhslink.com');
};

console.error(`Processing URL: ${url}`);
console.error(`URL type: ${isXiaohongshuUrl(url) ? 'Xiaohongshu' : 'General'}`);

const usePuppeteerForXhs = false;
// 根据 URL 类型选择提取方法
const extractFunction = isXiaohongshuUrl(url) 
? (usePuppeteerForXhs ? extractXiaohongshuPuppeteer : extractXiaohongshuAxiosGet) 
: extractGeneralAxiosGet;

extractFunction(url).then(result => {
  console.error('Extraction completed successfully');
  console.log(JSON.stringify(result));
  process.exit(0);
}).catch(err => {
  console.error('Extraction failed with error:');
  console.error(JSON.stringify({ 
    error: err.message, 
    stack: err.stack,
    url: url 
  }));
  process.exit(1);
}); 