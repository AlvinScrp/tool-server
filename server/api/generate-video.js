import axios from 'axios';

export default defineEventHandler(async (event) => {
  try {
    console.log('----->generate-video');
    const body = await readBody(event);
    const { prompt, img_url,api_key } = body;
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
      model: "wanx2.1-i2v-turbo",
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

    //步骤2：根据任务ID查询结果
    const task_id = result.output.task_id;
    
    const checkTaskStatus = async () => {
      const statusResponse = await axios.get(`https://dashscope.aliyuncs.com/api/v1/tasks/${task_id}`, {
        headers: {
          'Authorization': `Bearer ${api_key}`
        }
      });

      return statusResponse.data;
    };
    //先等待120秒
    await new Promise(resolve => setTimeout(resolve, 120000));

    // 轮询等待任务完成
    const maxAttempts = 20; // 最多轮询20次 (5分钟)
    let attempts = 0;

    while (attempts < maxAttempts) {
      console.log('----->checkTaskStatus',attempts);
      const statusResult = await checkTaskStatus();
      const status = statusResult.output.task_status;

      // 如果任务完成
      if (status === 'SUCCEEDED') {
        return {
          video_url: statusResult.output.video_url,
          status: true,
          message: "视频生成成功"
        };
      }

      // 如果任务失败
      if (status === 'FAILED') {
        return {
          video_url: "",
          status: false,
          message: statusResult.output.message || "视频生成失败"
        };
      }

      // 等待15秒后继续轮询
      if (attempts < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
      attempts++;
    }

    // 超时处理
    return {
      video_url: "",
      status: false,
      message: "视频生成超时，请稍后重试"
    };
    
  } catch (error) {
    return {
      video_url: "",
      status: false,
      message: error.message
    };
  }
});