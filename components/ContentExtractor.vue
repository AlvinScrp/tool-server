<template>
  <div class="mb-8 p-4 border border-gray-300 rounded">
    <h1 class="text-2xl font-bold mb-4">内容提取</h1>
    
    <div class="mb-4">
      <input 
        v-model="url" 
        type="text" 
        placeholder="请输入网页URL" 
        class="w-full p-2 border rounded"
        @keyup.enter="extract"
      />
      <button 
        @click="extract" 
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        提取内容✅
      </button>
    </div>

    <div v-if="loading" class="text-center">
      正在提取内容...
    </div>

    <div v-if="error" class="text-red-500 mb-4">
      {{ error }}
    </div>

    <div v-if="result" class="space-y-4">
      <div>
        <h2 class="font-bold">标题：</h2>
        <p>{{ result.title }}</p>
      </div>

      <div v-if="result.videoList?.length>0">
        <h2 class="font-bold">视频列表：</h2>
        <div class="space-y-4">
          <video 
            v-for="(video, index) in result.videoList" 
            :key="index" 
            :src="`/api/proxy-video?url=${encodeURIComponent(video)}`" 
            controls 
            class="h-[200px]"
          ></video>
        </div>
      </div>
      <div v-else>
        <h2 class="font-bold">视频列表：</h2>
        <p>无视频</p>
      </div>

      <div v-if="result.bannerList?.length">
        <h2 class="font-bold">图片列表：</h2>
        <div class="flex flex-wrap flex-row gap-4">
          <img 
            v-for="(img, index) in result.bannerList" 
            :key="index" 
            :src="img" 
            class="w-[80px]"
          />
        </div>
      </div>

      <div>
        <h2 class="font-bold">内容：</h2>
        <p class="whitespace-pre-wrap">{{ result.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const url = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref('')

async function extract() {
  if (!url.value) {
    error.value = '请输入URL'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url.value }),
    })

    const data = await response.json()
    
    if (data.error) {
      error.value = data.error
    } else {
      result.value = data
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>