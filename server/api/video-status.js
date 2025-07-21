import axios from 'axios';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { task_id, api_key } = query;
    
    if (!task_id) {
      return {
        error: 'Task ID is required'
      };
    }

    if (!api_key) {
      return {
        error: 'DASHSCOPE_API_KEY is not configured'
      };
    }

    const checkTaskStatus = async () => {
      try {
        const response = await axios.get(`https://dashscope.aliyuncs.com/api/v1/tasks/${task_id}`, {
          headers: {
            'Authorization': `Bearer ${api_key}`
          }
        });
        
        return response.data;
      } catch (error) {
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || 'Failed to get task status');
        }
        throw error;
      }
    };

    // 只保留单次查询模式
    const result = await checkTaskStatus();
    return {
      success: true,
      data: {
        task_id: result.output.task_id,
        task_status: result.output.task_status,
        submit_time: result.output.submit_time,
        scheduled_time: result.output.scheduled_time,
        end_time: result.output.end_time,
        video_url: result.output.video_url,
        code: result.output.code,
        message: result.output.message,
        request_id: result.request_id,
        usage: result.usage
      }
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
});