<template>
  <div class="container mx-auto p-4">
    <ContentExtractor />
   <div class="flex flex-row gap-4">
    <ImageGenerator class="w-1/2" />
    <ImageStatusChecker class="w-1/2" />
  </div>
    <div class="flex flex-row gap-4">
      <VideoGenerator class="w-1/2" />
    <VideoStatusChecker class="w-1/2" />
  </div>
</div>

</template>

<script setup>
import ContentExtractor from '~/components/ContentExtractor.vue'
import ImageGenerator from '~/components/ImageGenerator.vue'
import ImageStatusChecker from '~/components/ImageStatusChecker.vue'
import VideoGenerator from '~/components/VideoGenerator.vue'
import VideoStatusChecker from '~/components/VideoStatusChecker.vue'
</script>