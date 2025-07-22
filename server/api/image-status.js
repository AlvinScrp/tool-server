import axios from 'axios';

export default defineEventHandler(async (event) => {
  try {
    console.log('----->image-status');
    const body = await readBody(event);
    const { task_id, api_key } = body;
    console.log('----->image-status', JSON.stringify(body));
    
    if (!task_id) {
      return {
        image_url: "",
        status: false,
        task_status: "",
        message: 'Task ID is required'
      };
    }

    if (!api_key) {
      return {
        image_url: "",
        status: false,
        task_status: "",
        message: 'DASHSCOPE_API_KEY is not configured'
      };
    }

    const response = await axios.get(`https://dashscope.aliyuncs.com/api/v1/tasks/${task_id}`, {
      headers: {
        'Authorization': `Bearer ${api_key}`
      }
    });

    const result = response.data;
    console.log('----->image-status result', JSON.stringify(result));
    
    if (result.code && result.message) {
      return {
        image_url: "",
        status: false,
        task_status: "FAILED",
        message: result.message || 'Failed to get image status'
      };
    }

    const task_status = result.output.task_status;

    if (task_status === 'SUCCEEDED') {
      return {
        actual_prompt: result.output.results[0].actual_prompt,
        image_url: result.output.results[0].url,
        status: true,
        task_status: task_status,
        message: "图片生成成功"
      };
    }

    if (task_status === 'FAILED') {
      return {
        image_url: "",
        status: false,
        task_status: task_status,
        message: result.output.message || "图片生成失败"
      };
    }

    return {
      image_url: "",
      status: false,
      task_status: task_status,
      message: task_status === 'PENDING' ? "图片生成中..." : "未知状态"
    };
    
  } catch (error) {
    return {
      image_url: "",
      status: false,
      task_status: "ERROR",
      message: error.message
    };
  }
});