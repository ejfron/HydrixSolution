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
  <div class="min-h-screen bg-[#f5f7fb] flex ">
    <Sidebar />

    <main class="flex-1 min-w-0 transition-all duration-300">
      <Navbar />

      <div class="p-8 space-y-8">
        <Statscard />

        <SalesOverview />
        <UsersData />


      </div>
    </main>
  </div>
</template>