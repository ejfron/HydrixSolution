// pages/admin/index.vue
<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})
import Navbar from '~/components/admin/Navbar.vue';

import Sidebar from '~/components/admin/Sidebar.vue';



</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex overflow-hidden">
    <Sidebar />

    <main class="flex-1 overflow-y-auto">
      <Navbar />

      <div class="p-8 space-y-8">
        <div class="flex items-center justify-center text-2xl font-bold text-gray-800">
            This Feature Page Under Development
        </div>
      </div>
    </main>
  </div>
</template>