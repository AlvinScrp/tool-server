const axios = require('axios');
const { load } = require('cheerio');

const extractXiaohongshuAxiosGet = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.xiaohongshu.com/',
      }
    });
    // console.log(response.data);
    const $ = load(response.data);

    // 查找包含 window.__INITIAL_STATE__ 的 script 标签
    let noteDetailMap = null;
    $('script').each((index, element) => {
      const scriptContent = $(element).html();

      if (scriptContent && scriptContent.includes('window.__INITIAL_STATE__')) {
        // console.log(`====>Found script with __INITIAL_STATE__`);
        noteDetailMap = extractNoteDetailMapPrecise(scriptContent, 'noteDetailMap')
        // noteDetailMap = noteDetailMapPrecise
        // console.log(`====>noteDetailMap: ${JSON.stringify(noteDetailMap)}`);
        return false

      }
    });

    if (noteDetailMap) {
      const fullResult = extractNoteInfo(noteDetailMap);
      return {
        title: fullResult?.title,
        content: fullResult?.desc,
        videoList: [fullResult?.video || ''].filter(item=>item&&item.trim()!=''),
        bannerList: [...new Set(fullResult?.images || [])],
        errorMessage: ''
      };
    } else {
      console.log('====>No noteDetailMap found');
    }
    

  } catch (error) {
    return {
      title: '',
      content: '',
      videoList: [],
      bannerList: [],
      errorMessage: error.message
    };
  }
};

function extractNoteDetailMapPrecise(jsonString, searchKey) {
  // const searchKey = '"noteDetailMap"';
  const startIndex = jsonString.indexOf(searchKey);

  if (startIndex === -1) return null;

  // 找到冒号位置
  const colonIndex = jsonString.indexOf(':', startIndex);
  if (colonIndex === -1) return null;

  // 跳过空白字符
  let valueStart = colonIndex + 1;
  while (valueStart < jsonString.length && /\s/.test(jsonString[valueStart])) {
    valueStart++;
  }

  // 确定值的类型并提取
  const firstChar = jsonString[valueStart];

  if (firstChar === '{') {
    // 对象类型，需要匹配括号
    const extracted = extractObjectFromString(jsonString, valueStart);
    try {
      return JSON.parse(extracted);
    } catch (e) {
      return null;
    }
  } else if (firstChar === '[') {
    // 数组类型
    const extracted = extractArrayFromString(jsonString, valueStart);
    try {
      return JSON.parse(extracted);
    } catch (e) {
      return null;
    }
  } else if (firstChar === '"') {
    // 字符串类型
    return extractStringFromString(jsonString, valueStart);
  } else {
    // 数字、布尔值、null
    return extractPrimitiveFromString(jsonString, valueStart);
  }
}

function extractObjectFromString(str, startIndex) {
  let braceCount = 0;
  let inString = false;
  let escaped = false;
  let i = startIndex;

  while (i < str.length) {
    const char = str[i];

    if (escaped) {
      escaped = false;
    } else if (char === '\\' && inString) {
      escaped = true;
    } else if (char === '"') {
      inString = !inString;
    } else if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          return str.substring(startIndex, i + 1);
        }
      }
    }
    i++;
  }
  return null;
}

function extractArrayFromString(str, startIndex) {
  let bracketCount = 0;
  let inString = false;
  let escaped = false;
  let i = startIndex;

  while (i < str.length) {
    const char = str[i];

    if (escaped) {
      escaped = false;
    } else if (char === '\\' && inString) {
      escaped = true;
    } else if (char === '"') {
      inString = !inString;
    } else if (!inString) {
      if (char === '[') {
        bracketCount++;
      } else if (char === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          return str.substring(startIndex, i + 1);
        }
      }
    }
    i++;
  }
  return null;
}

function extractStringFromString(str, startIndex) {
  let i = startIndex + 1; // 跳过开始的引号
  let escaped = false;

  while (i < str.length) {
    const char = str[i];

    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '"') {
      return str.substring(startIndex + 1, i); // 返回不含引号的字符串
    }
    i++;
  }
  return null;
}

function extractPrimitiveFromString(str, startIndex) {
  let i = startIndex;
  while (i < str.length && !/[,}\]\s]/.test(str[i])) {
    i++;
  }
  const value = str.substring(startIndex, i);
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}


// 方法1：完整解析JSON后提取（推荐）
function extractNoteInfo(data) {
  try {
    // const data = JSON.parse(jsonString);

    // 获取第一个笔记对象（因为外层是以ID为key的对象）
    const noteKey = Object.keys(data)[0];
    const noteData = data[noteKey];

    if (!noteData || !noteData.note) {
      return null;
    }

    const note = noteData.note;

    // 提取基本信息
    const result = {
      noteId: note.noteId || '',
      title: note.title || '',
      desc: note.desc || '',
      video: '',
      images: [],

    };

    // 提取视频URL（返回单个URL字符串）
    if (note.video && note.video.media && note.video.media.stream) {
      const streams = note.video.media.stream;

      // 优先级：h264 > h265 > h266 > av1
      let videoUrl = null;

      if (streams.h264 && streams.h264.length > 0) {
        videoUrl = streams.h264[0].masterUrl;
      } else if (streams.h265 && streams.h265.length > 0) {
        videoUrl = streams.h265[0].masterUrl;
      } else if (streams.h266 && streams.h266.length > 0) {
        videoUrl = streams.h266[0].masterUrl;
      } else if (streams.av1 && streams.av1.length > 0) {
        videoUrl = streams.av1[0].masterUrl;
      }

      result.video = videoUrl;
    }

    // 提取图片URL并去重
    if (note.imageList && Array.isArray(note.imageList)) {
      const imageUrls = new Set(); // 使用Set来去重

      note.imageList.forEach(img => {
        imageUrls.add(img.urlDefault || img.urlPre || '')
      });

      // 转换为数组并过滤空值
      result.images = Array.from(imageUrls).filter(url => url && url.trim() !== '');
    }



    return result;

  } catch (error) {
    console.error('JSON解析失败:', error);
    return null;
  }
}





module.exports = { extractXiaohongshuAxiosGet }; 