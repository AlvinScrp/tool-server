export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { url } = query;
  
  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Video URL is required'
    });
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://www.xiaohongshu.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'video',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      }
    });
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch video: ${response.statusText}`
      });
    }
    
    // 设置响应头
    setHeaders(event, {
      'Content-Type': response.headers.get('content-type') || 'video/mp4',
      'Content-Length': response.headers.get('content-length'),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    });
    
    // 返回视频流
    return response.body;
    
  } catch (error) {
    console.error('Video proxy error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to proxy video'
    });
  }
}); 