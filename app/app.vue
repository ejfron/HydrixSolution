<!-- app.vue -->
<script setup lang="ts">
import SalesAssistant from './components/shared/SalesAssistant.vue';

const { plan, isLoading, checkSubscription } = useSubscription();

onMounted(() => {
  checkSubscription();
});


const canAccessSalesAssistant = computed(() => {
  return plan.value === 'standard' || plan.value === 'premium';
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    
      <SalesAssistant v-if="canAccessSalesAssistant && !isLoading" />
    </NuxtLayout>
  </div>
</template>