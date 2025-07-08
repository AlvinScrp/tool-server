import axios from 'axios';
import { load } from 'cheerio';

export const extractXiaohongshuAxiosGet = async (url) => {
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
    const $ = load(response.data);

    let noteDetailMap = null;
    $('script').each((index, element) => {
      const scriptContent = $(element).html();

      if (scriptContent && scriptContent.includes('window.__INITIAL_STATE__')) {
        noteDetailMap = extractNoteDetailMapPrecise(scriptContent, 'noteDetailMap')
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
  const startIndex = jsonString.indexOf(searchKey);

  if (startIndex === -1) return null;

  const colonIndex = jsonString.indexOf(':', startIndex);
  if (colonIndex === -1) return null;

  let valueStart = colonIndex + 1;
  while (valueStart < jsonString.length && /\s/.test(jsonString[valueStart])) {
    valueStart++;
  }

  const firstChar = jsonString[valueStart];

  if (firstChar === '{') {
    const extracted = extractObjectFromString(jsonString, valueStart);
    try {
      return JSON.parse(extracted);
    } catch (e) {
      return null;
    }
  } else if (firstChar === '[') {
    const extracted = extractArrayFromString(jsonString, valueStart);
    try {
      return JSON.parse(extracted);
    } catch (e) {
      return null;
    }
  } else if (firstChar === '"') {
    return extractStringFromString(jsonString, valueStart);
  } else {
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
  let i = startIndex + 1;
  let escaped = false;

  while (i < str.length) {
    const char = str[i];

    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '"') {
      return str.substring(startIndex + 1, i);
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

function extractNoteInfo(data) {
  try {
    const noteKey = Object.keys(data)[0];
    const noteData = data[noteKey];

    if (!noteData || !noteData.note) {
      return null;
    }

    const note = noteData.note;

    const result = {
      noteId: note.noteId || '',
      title: note.title || '',
      desc: note.desc || '',
      video: '',
      images: [],
    };

    if (note.video && note.video.media && note.video.media.stream) {
      const streams = note.video.media.stream;

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

    if (note.imageList && Array.isArray(note.imageList)) {
      const imageUrls = new Set();

      note.imageList.forEach(img => {
        imageUrls.add(img.urlDefault || img.urlPre || '')
      });

      result.images = Array.from(imageUrls).filter(url => url && url.trim() !== '');
    }

    return result;
  } catch (error) {
    console.error('Error extracting note info:', error);
    return null;
  }
} 