<script setup lang="ts">
import { ref, onMounted } from 'vue'

import LoginContent from '~/components/auth/LoginContent.vue'
import LoginSkeleton from '~/components/skeleton/LoginSkeleton.vue'

const loading = ref(true)

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  loading.value = false
})
</script>

<template>
  <LoginSkeleton v-if="loading" />
  <LoginContent v-else />
</template>