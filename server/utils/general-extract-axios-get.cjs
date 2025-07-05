const axios = require('axios');
const { load } = require('cheerio');

const extractGeneralAxiosGet = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
    
    const $ = load(response.data);
    
    const title = $('title').text().trim();
    const bannerList = $('img').map((_, img) => $(img).attr('src')).get();
    const videoList = $('video').map((_, video) => $(video).attr('src')).get();
    
    // 尝试提取主要内容
    let content = '';
    const mainSelectors = ['article', 'main', '.content', '.article', '.post'];
    for (const selector of mainSelectors) {
      const element = $(selector);
      if (element.length) {
        content = element.text().trim();
        break;
      }
    }
    
    if (!content) {
      content = $('body').text().trim();
    }
    
    return {
      title,
      videoList,
      content,
      bannerList,
      errorMessage: ''
    };
  } catch (error) {
    return {
      title: '',
      content: '',
      bannerList: [],
      videoList: [],
      errorMessage: error.message
    };
  }
};

module.exports = { extractGeneralAxiosGet }; 