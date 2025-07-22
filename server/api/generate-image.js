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
    
    const checkTaskStatus = async () => {
      const statusResponse = await axios.get(`https://dashscope.aliyuncs.com/api/v1/tasks/${task_id}`, {
        headers: {
          'Authorization': `Bearer ${api_key}`
        }
      });

      return statusResponse.data;
    };

    await new Promise(resolve => setTimeout(resolve, 15000));

    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      console.log('----->checkTaskStatus', attempts);
      const statusResult = await checkTaskStatus();
      const status = statusResult.output.task_status;

      if (status === 'SUCCEEDED') {
        return {
          image_url: statusResult.output.results[0].url,
          actual_prompt: statusResult.output.results[0].actual_prompt,
          task_id: task_id,
          status: true,
          message: "图片生成成功"
        };
      }

      if (status === 'FAILED') {
        return {
          image_url: "",
          task_id: task_id,
          status: false,
          message: statusResult.output.message || "图片生成失败"
        };
      }

      if (attempts < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      attempts++;
    }

    return {
      image_url: "",
      task_id: task_id,
      status: false,
      message: "图片生成超时，请稍后重试"
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