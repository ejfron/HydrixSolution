<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <Navbar />
      <main class="flex-1 overflow-y-auto bg-gray-100">
        <div class="p-4 sm:p-6 lg:p-8">
          <slot />
        </div>
      </main>
    </div>
   
   
  </div>
</template>

<script setup lang="ts">
import Sidebar from '~/components/userBasic/Sidebar.vue';
import Navbar from '~/components/userBasic/Navbar.vue';

</script>