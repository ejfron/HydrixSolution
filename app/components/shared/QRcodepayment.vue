<script setup lang="ts">
import { X, Copy, Check } from '@lucide/vue'

const props = defineProps<{
  open: boolean
  amount?: number
  qrImage?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)
const GCASH_NUMBER = '09277462797' 

const copyNumber = async () => {
  try {
    await navigator.clipboard.writeText(GCASH_NUMBER)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // clipboard not available, silently ignore
  }
}

const close = () => emit('close')

// close on ESC
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) close()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="close"
      >
        <Transition name="pop" appear>
          <div
            v-if="open"
            class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
          >
            <!-- Close button -->
            <button
              @click="close"
              class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition"
            >
              <X :size="16" class="text-white" />
            </button>

            <!-- Header -->
            <div class="bg-blue-600 px-6 py-5 text-center">
              <h3 class="text-white font-bold text-lg">Pay via GCash</h3>
              <p v-if="amount" class="text-blue-100 text-sm mt-1">
                ₱{{ Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}
              </p>
            </div>

            <!-- QR image -->
            <div class="p-6 flex flex-col items-center">
              <img
                :src="qrImage"
                alt="GCash QR Code"
                class="w-full max-w-65 rounded-2xl border border-slate-100"
              />

              <p class="text-xs text-slate-400 mt-4 text-center">
                Scan with your GCash app, or copy the number below to send manually.
              </p>

              <button
                @click="copyNumber"
                class="mt-3 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition"
              >
                <component :is="copied ? Check : Copy" :size="14" />
                {{ copied ? 'Copied!' : GCASH_NUMBER }}
              </button>
            </div>

            <!-- Footer instructions -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <p class="text-xs text-slate-500 font-semibold mb-1">After paying:</p>
              <p class="text-xs text-slate-400">
                Send a screenshot of your payment confirmation via Facebook Messenger.
                Admin will update your subscription within 24 hours.
              </p>
              <a
                href="https://web.facebook.com/profile.php?id=61590180851655"
                target="_blank"
                class="mt-3 block text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
              >
                Message us on Facebook
              </a>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: all 0.2s ease;
}
.pop-leave-active {
  transition: all 0.15s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>