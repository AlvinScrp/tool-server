<template>
  <div class="mb-8 p-4 border border-gray-300 rounded">
    <h2 class="text-xl font-bold mb-4">视频状态查询</h2>
    <div class="mb-4">
      <input
        v-model="statusTaskId"
        type="text"
        placeholder="请输入 task_id"
        class="w-full p-2 border rounded mb-2"
      />
      <input
        v-model="statusApiKey"
        type="text"
        placeholder="请输入 DashScope API Key"
        class="w-full p-2 border rounded mb-2"
      />
      <button
        @click="checkVideoStatus"
        :disabled="statusLoading"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {{ statusLoading ? '查询中...' : '查询状态' }}
      </button>
    </div>
    <div v-if="statusLoading" class="text-center text-blue-600">
      正在查询，请稍候...
    </div>
    <div v-if="statusError" class="text-red-500 mb-4">
      {{ statusError }}
    </div>
    <div v-if="statusResult" class="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">
      <!-- {{ statusResult }}
      <br /> -->
      <span v-if="typeof statusResult === 'object'">{{ JSON.stringify(statusResult, null, 2) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusTaskId = ref('f7410cf4-b2a8-44d1-a88d-ec65a11bbccc')
const statusApiKey = ref('')
const statusResult = ref(null)
const statusLoading = ref(false)
const statusError = ref('')

// 从 localStorage 加载所有输入内容
onMounted(() => {
  const savedData = localStorage.getItem('videoStatusCheckerData')
  if (savedData) {
    try {
      const data = JSON.parse(savedData)
      statusTaskId.value = data.statusTaskId || statusTaskId.value
      statusApiKey.value = data.statusApiKey || ''
    } catch (e) {
      console.error('Error parsing saved video status checker data:', e)
    }
  }
})

// 保存所有输入内容到 localStorage
function saveToLocalStorage() {
  const dataToSave = {
    statusTaskId: statusTaskId.value,
    statusApiKey: statusApiKey.value
  }
  localStorage.setItem('videoStatusCheckerData', JSON.stringify(dataToSave))
}

async function checkVideoStatus() {
  if (!statusTaskId.value) {
    statusError.value = '请输入 task_id'
    return
  }
  if (!statusApiKey.value) {
    statusError.value = '请输入 API Key'
    return
  }
  
  // 保存所有输入内容到 localStorage
  saveToLocalStorage()
  
  statusLoading.value = true
  statusError.value = ''
  statusResult.value = null
  try {
    // 使用 POST 请求和 fetch
    const response = await fetch('/api/video-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: statusTaskId.value,
        api_key: statusApiKey.value
      })
    })
    
    const data = await response.json()
    statusResult.value = data
  } catch (e) {
    statusError.value = e.message
  } finally {
    statusLoading.value = false
  }
}
</script>