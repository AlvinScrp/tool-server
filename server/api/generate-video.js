import axios from 'axios';

export default defineEventHandler(async (event) => {
  try {
    console.log('----->generate-video');
    const body = await readBody(event);
    const { prompt, img_url,api_key,model } = body;
    console.log('----->generate-video',JSON.stringify(body));
    
    if (!prompt) {
      return {
        video_url: "",
        status: false,
        message: 'Prompt is required'
      };
    }

    if (!img_url) {
      return {
        video_url: "",
        status: false,
        message: 'Image URL is required'
      };
    }

 
    
    if (!api_key) {
      return {
        video_url: "",
        status: false,
        message: 'DASHSCOPE_API_KEY is not configured'
      };
    }

    const requestBody = {
      model: model || "wanx2.1-i2v-turbo",
      input: {
        prompt,
        img_url
      },
      parameters: {
        resolution: "720P",
        prompt_extend: true
      }
    };

    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
      requestBody,
      {
        headers: {
          'X-DashScope-Async': 'enable',
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data;
    console.log('----->generate-video result',JSON.stringify(result));
    
    
    if (result.code&&result.message) {
      return {
        video_url: "",
        status: false,
        message: result.message || 'Video generation failed'
      };
    }

    const task_id = result.output.task_id;
    
    return {
      task_id: task_id,
      status: true,
      message: "视频生成任务已提交"
    };
    
  } catch (error) {
    return {
      video_url: "",
      task_id: "",
      status: false,
      message: error.message
    };
  }
});