<script setup lang="ts">
import RegisterContent from '~/components/auth/RegisterContent.vue';
import RegisterSkeleton from '~/components/skeleton/RegisterSkeleton.vue';



const loading = ref(true)

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  loading.value = false
})
</script>

<template>
  <RegisterSkeleton v-if="loading" />
  <RegisterContent v-else />
</template>