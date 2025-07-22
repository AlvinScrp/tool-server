<template>
  <div class="mb-8 p-4 border border-gray-300 rounded">
    <h2 class="text-xl font-bold mb-4">图片状态查询</h2>
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
        @click="checkImageStatus"
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
    <div v-if="statusResult" class="space-y-4">
      <div v-if="statusResult.status">
        <h3 class="font-bold text-green-600">图片生成完成！</h3>
        <img 
          v-if="statusResult.image_url"
          :src="statusResult.image_url" 
          alt="Generated image"
          class="w-1/3 border rounded"
        />
      </div>
      <div v-else>
        <h3 class="font-bold" :class="statusResult.task_status === 'PENDING' ? 'text-orange-600' : 'text-red-600'">
          {{ statusResult.task_status === 'PENDING' ? '图片生成中...' : '图片生成失败' }}
        </h3>
        <p>{{ statusResult.message }}</p>
        <p class="text-sm text-gray-600">任务状态: {{ statusResult.task_status }}</p>
      </div>
      <div class="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">
        <span v-if="typeof statusResult === 'object'">{{ JSON.stringify(statusResult, null, 2) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const statusTaskId = ref('')
const statusApiKey = ref('')
const statusResult = ref(null)
const statusLoading = ref(false)
const statusError = ref('')

async function checkImageStatus() {
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
    const response = await fetch('/api/image-status', {
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