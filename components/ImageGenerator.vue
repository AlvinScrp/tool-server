<template>
  <div class="mb-8 p-4 border border-gray-300 rounded">
    <h2 class="text-xl font-bold mb-4">图片生成测试</h2>
    
    <div class="mb-4">
      <input 
        v-model="imagePrompt" 
        type="text" 
        placeholder="请输入图片描述文本" 
        class="w-full p-2 border rounded mb-2"
      />
      <input 
        v-model="apiKey" 
        type="text" 
        placeholder="请输入DashScope API Key" 
        class="w-full p-2 border rounded mb-2"
      />
      <div class="flex space-x-2 mb-2">
        <select 
          v-model="selectedSize" 
          class="p-2 border rounded"
        >
          <option value="1024*1024">1024×1024</option>
          <option value="1920*1080">1920×1080</option>
          <option value="1080*1920">1080×1920</option>
          <option value="512*512">512×512</option>
        </select>
        <input 
          v-model="imageCount" 
          type="number" 
          min="1" 
          max="4" 
          placeholder="生成数量" 
          class="w-24 p-2 border rounded"
        />
      </div>
      <button 
        @click="generateImage" 
        :disabled="imageLoading"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 mr-2"
      >
        {{ imageLoading ? '生成中...' : '生成图片' }}
      </button>
      <button 
        v-if="currentTaskId"
        @click="checkStatus" 
        :disabled="statusLoading"
        class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400"
      >
        {{ statusLoading ? '查询中...' : '查询状态' }}
      </button>
    </div>

    <div v-if="imageLoading" class="text-center text-blue-600">
      正在生成图片，请耐心等待（最多5分钟）...
    </div>

    <div v-if="imageError" class="text-red-500 mb-4">
      {{ imageError }}
    </div>

    <div v-if="currentTaskId" class="mb-4 p-2 bg-gray-100 rounded">
      <p class="text-sm">任务ID: {{ currentTaskId }}</p>
    </div>

    <div v-if="imageResult" class="space-y-4">
      <div v-if="imageResult.status">
        <p class="font-bold text-green-600">{{ imageResult.message }}</p>
        <img 
          v-if="imageResult.image_url"
          :src="imageResult.image_url" 
          alt="Generated image"
          class="w-1/3 border rounded"
        />
      </div>
      <div v-else>
        <h3 class="font-bold text-red-600">图片生成失败</h3>
        <p>{{ imageResult.message }}</p>
      </div>
      <div class="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">
        <span v-if="typeof imageResult === 'object'">{{ JSON.stringify(imageResult, null, 2) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const imagePrompt = ref('一间有着精致窗户的花店，漂亮的木质门，摆放着花朵')
const apiKey = ref('')
const selectedSize = ref('1024*1024')
const imageCount = ref(1)
const imageLoading = ref(false)
const statusLoading = ref(false)
const imageError = ref('')
const imageResult = ref(null)
const currentTaskId = ref('')

async function generateImage() {
  if (!imagePrompt.value) {
    imageError.value = '请输入图片描述文本'
    return
  }
  
  if (!apiKey.value) {
    imageError.value = '请输入API Key'
    return
  }

  imageLoading.value = true
  imageError.value = ''
  imageResult.value = null

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imagePrompt.value,
        api_key: apiKey.value,
        size: selectedSize.value,
        n: imageCount.value
      })
    })
    
    const data = await response.json()
    imageResult.value = data
    if (data.task_id) {
      currentTaskId.value = data.task_id
    }
  } catch (e) {
    imageError.value = e.message
  } finally {
    imageLoading.value = false
  }
}

async function checkStatus() {
  if (!currentTaskId.value) {
    imageError.value = '没有可查询的任务ID'
    return
  }
  
  if (!apiKey.value) {
    imageError.value = '请输入API Key'
    return
  }

  statusLoading.value = true
  imageError.value = ''

  try {
    const response = await fetch('/api/image-status', {
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
    imageResult.value = data
  } catch (e) {
    imageError.value = e.message
  } finally {
    statusLoading.value = false
  }
}
</script>