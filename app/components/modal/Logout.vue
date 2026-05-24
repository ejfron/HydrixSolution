<script lang="ts" setup>

    const emit = defineEmits(['close', 'confirm'])

</script>

<template>
  <div
    class="fixed inset-0 bg-white/10 bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 w-96">
      <h2 class="text-xl font-bold mb-4">Confirm Logout</h2>
      <p class="mb-6">Are you sure you want to log out?</p>
      <div class="flex justify-end gap-4">
        <button
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          @click="emit('confirm')"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>