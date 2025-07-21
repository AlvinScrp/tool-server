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
import { ref } from 'vue'

const videoPrompt = ref('一只猫在草地上奔跑')
const imageUrl = ref('https://cdn.translate.alibaba.com/r/wanx-demo-1.png')
const apiKey = ref('sk-6490712486f94d5c95a0206f234a34b8')
const videoLoading = ref(false)
const videoError = ref('')
const videoResult = ref(null)

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

  videoLoading.value = true
  videoError.value = ''
  videoResult.value = null

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
    videoResult.value = data
  } catch (e) {
    videoError.value = e.message
  } finally {
    videoLoading.value = false
  }
}
</script>