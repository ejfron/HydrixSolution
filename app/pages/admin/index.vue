// pages/admin/index.vue
<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })
import Navbar from '~/components/admin/Navbar.vue';
import SalesOverview from '~/components/admin/salesOverview.vue';
import Sidebar from '~/components/admin/Sidebar.vue';
import Statscard from '~/components/admin/statscard.vue';

import UsersData from '~/components/admin/usersData.vue';

const OpenSidebar = ref(true)

</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <Sidebar />
    <main class="flex-1 min-w-0 flex flex-col">
      <Navbar />
      <div class="p-6 space-y-6 flex-1">
        <Statscard />
        <SalesOverview />
        <UsersData />
      </div>
    </main>
  </div>
</template>