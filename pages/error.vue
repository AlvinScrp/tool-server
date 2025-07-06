<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">{{ error?.statusCode || '500' }}</h1>
      <p class="text-xl text-gray-600 mb-8">{{ error?.message || '服务器暂时不可用' }}</p>
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        @click="handleError"
      >
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  error: Object
})

function handleError() {
  navigateTo('/')
}
</script> 