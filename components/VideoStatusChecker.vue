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
import { ref } from 'vue'

const statusTaskId = ref('f7410cf4-b2a8-44d1-a88d-ec65a11bbccc')
const statusApiKey = ref('sk-6490712486f94d5c95a0206f234a34b8')
const statusResult = ref(null)
const statusLoading = ref(false)
const statusError = ref('')

async function checkVideoStatus() {
  if (!statusTaskId.value) {
    statusError.value = '请输入 task_id'
    return
  }
  if (!statusApiKey.value) {
    statusError.value = '请输入 API Key'
    return
  }
  statusLoading.value = true
  statusError.value = ''
  statusResult.value = null
  try {
    const queryParams = new URLSearchParams({
      task_id: statusTaskId.value,
      api_key: statusApiKey.value
    })
    
    const response = await fetch(`/api/video-status?${queryParams}`)
    const data = await response.json()
    statusResult.value = data
  } catch (e) {
    statusError.value = e.message
  } finally {
    statusLoading.value = false
  }
}
</script>