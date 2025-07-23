import axios from 'axios';

export default defineEventHandler(async (event) => {
  try {
    console.log('----->generate-image');
    const body = await readBody(event);
    const { prompt, api_key, model, size, n } = body;
    console.log('----->generate-image', JSON.stringify(body));
    
    if (!prompt) {
      return {
        image_url: "",
        task_id: "",
        status: false,
        message: 'Prompt is required'
      };
    }

    if (!api_key) {
      return {
        image_url: "",
        task_id: "",
        status: false,
        message: 'DASHSCOPE_API_KEY is not configured'
      };
    }

    const requestBody = {
      model: model || "wanx2.1-t2i-turbo",
      input: {
        prompt
      },
      parameters: {
        size: size || "1024*1024",
        n: n || 1
      }
    };

    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
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
    console.log('----->generate-image result', JSON.stringify(result));
    
    if (result.code && result.message) {
      return {
        image_url: "",
        task_id: "",
        status: false,
        message: result.message || 'Image generation failed'
      };
    }

    const task_id = result.output.task_id;
    
    return {
      task_id: task_id,
      status: true,
      message: "图片生成任务已提交"
    };
    
  } catch (error) {
    return {
      image_url: "",
      task_id: "",
      status: false,
      message: error.message
    };
  }
});