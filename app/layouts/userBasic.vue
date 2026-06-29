<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <Navbar />
      <!--
        pb-32 on mobile reserves generous space below the fixed bottom nav
        (h-16 = 4rem/64px) so the last items in any page's content always
        have comfortable clearance, never feeling cramped against the nav.
        md:pb-0 removes this on desktop, where the bottom nav doesn't exist
        (it's md:hidden in Sidebar.vue) and the sidebar is shown instead.
      -->
      <main class="flex-1 overflow-y-auto bg-gray-100 pb-32 md:pb-0">
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