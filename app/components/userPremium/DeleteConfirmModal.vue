<script setup lang="ts">
import { Trash2 } from '@lucide/vue'

defineProps<{
  show: boolean
  title?: string
  message?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <Transition name="scale">
        <div
          class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <!-- Header -->
          <div
            class="bg-red-600 px-6 py-5 flex items-center gap-3"
          >
            <div
              class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
            >
              <Trash2 :size="22" class="text-white" />
            </div>

            <div>
              <h2 class="text-lg font-black text-white">
                {{ title || 'Delete Record' }}
              </h2>
              <p class="text-red-100 text-xs">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6">
            <p class="text-gray-700">
              {{
                message ||
                'Are you sure you want to delete this record?'
              }}
            </p>
          </div>

          <!-- Footer -->
          <div class="flex gap-3 p-6 border-t border-gray-100">
            <button
              @click="emit('cancel')"
              :disabled="loading"
              class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              @click="emit('confirm')"
              :disabled="loading"
              class="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer"
            >
              {{ loading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </Transition>

      <div
        class="absolute inset-0 -z-10"
        @click="emit('cancel')"
      />
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>