// pages/admin/index.vue
<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})
import { ref } from 'vue'
import Navbar from '~/components/admin/Navbar.vue'
import Sidebar from '~/components/admin/Sidebar.vue'

const OpenSidebar = ref(true)

</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />

    <main class="flex-1 min-w-0 transition-all duration-300">
      <Navbar />

      <div class="p-8 space-y-8">
        <div class="flex items-center justify-center text-2xl font-bold text-gray-800">
            This Feature Page Under Development
        </div>
      </div>
    </main>
  </div>
</template>