<template>
  <div class="flex h-screen bg-gray-100">
    <AdminSidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminNavbar />
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from '~/components/admin/Sidebar.vue'
import AdminNavbar from '~/components/admin/Navbar.vue'
</script>