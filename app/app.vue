<!-- app.vue -->
<script setup lang="ts">
import SalesAssistant from './components/shared/SalesAssistant.vue';

import {  useRoute } from 'vue-router'

const route = useRoute()



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
        <SalesAssistant v-else-if="route.path === '/'" />
    </NuxtLayout>
  </div>
</template>