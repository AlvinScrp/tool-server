import { spawn } from 'child_process';

async function runExtract(url) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [
      './server/utils/extract-runner.cjs',
      url
    ]);
    let data = '';
    let error = '';
    child.stdout.on('data', chunk => data += chunk);
    child.stderr.on('data', chunk => error += chunk);
    child.on('close', code => {
      console.log('Child process stdout:', data);
      console.log('Child process stderr:', error);
      console.log('Child process exit code:', code);
      
      if (code === 0) {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          console.error('Failed to parse stdout as JSON:', e);
          console.error('Raw stdout data:', data);
          resolve({ error: '解析子进程输出失败', rawData: data });
        }
      } else {
        try {
          const errorResult = JSON.parse(error);
          resolve(errorResult);
        } catch (e) {
          console.error('Failed to parse stderr as JSON:', e);
          console.error('Raw stderr data:', error);
          resolve({ error: '子进程异常', rawError: error, exitCode: code });
        }
      }
    });
  });
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { url } = body;
    
    if (!url) {
      return {
        error: 'URL is required'
      };
    }
    
    return await runExtract(url);
    
  } catch (error) {
    return {
      error: error.message
    };
  }
}); 