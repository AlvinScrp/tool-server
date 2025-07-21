<template>
  <div class="container mx-auto p-4">
    <ContentExtractor />
    <VideoGenerator />
    <VideoStatusChecker />
  </div>
</template>

<script setup>
import ContentExtractor from '~/components/ContentExtractor.vue'
import VideoGenerator from '~/components/VideoGenerator.vue'
import VideoStatusChecker from '~/components/VideoStatusChecker.vue'
</script>