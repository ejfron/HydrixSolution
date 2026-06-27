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
    
        <SalesAssistant v-if="canAccessSalesAssistant && !isLoading" class="md:bottom-5 bottom-17 "/>
        <SalesAssistant v-else-if="route.path === '/'" class="bottom-5"/>
    </NuxtLayout>
  </div>
</template>