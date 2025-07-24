<template>
  <div class="mb-8 p-4 border border-gray-300 rounded">
    <h2 class="text-xl font-bold mb-4">视频生成测试</h2>
    
    <div class="mb-4">
      <input 
        v-model="videoPrompt" 
        type="text" 
        placeholder="请输入视频描述文本" 
        class="w-full p-2 border rounded mb-2"
      />
      <input 
        v-model="imageUrl" 
        type="text" 
        placeholder="请输入图片URL" 
        class="w-full p-2 border rounded mb-2"
      />
      <input 
        v-model="apiKey" 
        type="text" 
        placeholder="请输入DashScope API Key" 
        class="w-full p-2 border rounded mb-2"
      />
      <button 
        @click="generateVideo" 
        :disabled="videoLoading"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
      >
        {{ videoLoading ? '生成中...' : '生成视频' }}
      </button>
    </div>

    <div v-if="videoLoading" class="text-center text-blue-600">
      正在生成视频，请耐心等待（最多8分钟）...
    </div>

    <div v-if="videoError" class="text-red-500 mb-4">
      {{ videoError }}
    </div>

    <div v-if="currentTaskId" class="mb-4 p-2 bg-gray-100 rounded">
      <p class="text-sm">任务ID: {{ currentTaskId }}</p>
    </div>

    <div v-if="videoResult" class="space-y-4">
      <div v-if="videoResult.status">
        <h3 class="font-bold text-green-600">视频生成成功！</h3>
        <p class="mb-2">{{ videoResult.message }}</p>
        <video 
          v-if="videoResult.video_url"
          :src="videoResult.video_url" 
          controls 
          class="w-full max-w-md"
        ></video>
      </div>
      <div v-else>
        <h3 class="font-bold text-red-600">视频生成失败</h3>
        <p>{{ videoResult.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const videoPrompt = ref('一只猫在草地上奔跑')
const imageUrl = ref('https://cdn.translate.alibaba.com/r/wanx-demo-1.png')
const apiKey = ref('')
const videoLoading = ref(false)
const videoError = ref('')
const videoResult = ref(null)
const currentTaskId = ref('')
const pollingInterval = ref(null)

// 从 localStorage 加载所有输入内容
onMounted(() => {
  const savedData = localStorage.getItem('videoGeneratorData')
  if (savedData) {
    try {
      const data = JSON.parse(savedData)
      videoPrompt.value = data.videoPrompt || videoPrompt.value
      imageUrl.value = data.imageUrl || imageUrl.value
      apiKey.value = data.apiKey || ''
      currentTaskId.value = data.currentTaskId || ''
    } catch (e) {
      console.error('Error parsing saved video generator data:', e)
    }
  }
})

// 保存所有输入内容到 localStorage
function saveToLocalStorage() {
  const dataToSave = {
    videoPrompt: videoPrompt.value,
    imageUrl: imageUrl.value,
    apiKey: apiKey.value,
    currentTaskId: currentTaskId.value
  }
  localStorage.setItem('videoGeneratorData', JSON.stringify(dataToSave))
}

async function generateVideo() {
  if (!videoPrompt.value) {
    videoError.value = '请输入视频描述文本'
    return
  }
  
  if (!imageUrl.value) {
    videoError.value = '请输入图片URL'
    return
  }
  
  if (!apiKey.value) {
    videoError.value = '请输入API Key'
    return
  }

  // 保存所有输入内容到 localStorage
  saveToLocalStorage()

  videoLoading.value = true
  videoError.value = ''
  videoResult.value = null
  
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }

  try {
    const response = await fetch('/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: videoPrompt.value,
        img_url: imageUrl.value,
        api_key: apiKey.value
      })
    })
    
    const data = await response.json()
    if (data.task_id) {
      currentTaskId.value = data.task_id
      startPolling()
    } else {
      videoError.value = data.message || '生成失败'
      videoLoading.value = false
    }
  } catch (e) {
    videoError.value = e.message
    videoLoading.value = false
  }
}

function startPolling() {
  setTimeout(() => {
    pollingInterval.value = setInterval(async () => {
      if (!currentTaskId.value || !apiKey.value) {
        return
      }
      
      try {
        const response = await fetch('/api/video-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: currentTaskId.value,
            api_key: apiKey.value
          })
        })
        
        const data = await response.json()
        
        if (data.task_status) {
          const taskStatus = data.task_status
          
          if (taskStatus === 'SUCCEEDED') {
            videoResult.value = {
              status: true,
              video_url: data.video_url,
              message: '视频生成成功'
            }
            videoLoading.value = false
            if (pollingInterval.value) {
              clearInterval(pollingInterval.value)
              pollingInterval.value = null
            }
          } else if (taskStatus === 'FAILED') {
            videoResult.value = {
              status: false,
              message: data.message || '视频生成失败'
            }
            videoLoading.value = false
            if (pollingInterval.value) {
              clearInterval(pollingInterval.value)
              pollingInterval.value = null
            }
          }
        }
      } catch (e) {
        videoError.value = e.message
        videoLoading.value = false
        if (pollingInterval.value) {
          clearInterval(pollingInterval.value)
          pollingInterval.value = null
        }
      }
    }, 10000)
  }, 900000)
}
</script>