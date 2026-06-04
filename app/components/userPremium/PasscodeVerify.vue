<!-- components/user/PasscodeVerify.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
      <Transition name="scale">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="bg-linear-to-r from-green-600 to-emerald-600 px-6 py-5">
            <div class="flex items-center justify-center mb-3">
              <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Lock :size="32" class="text-white" />
              </div>
            </div>
            <h2 class="text-xl font-black text-white text-center">Enter Passcode</h2>
            <p class="text-green-100 text-xs text-center mt-1">This section is passcode protected</p>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Passcode</label>
              <div class="relative">
                <input 
                  v-model="passcodeInput" 
                  :type="showPasscode ? 'text' : 'password'" 
                  placeholder="Enter 4-digit passcode"
                  maxlength="4"
                  pattern="[0-9]{4}"
                  @keyup.enter="handleVerify"
                  class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-center tracking-widest"
                />
                <button 
                  @click="showPasscode = !showPasscode"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye :size="18" v-if="!showPasscode" />
                  <EyeOff :size="18" v-else />
                </button>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 mt-2">
              <button 
                v-for="num in [1,2,3,4,5,6,7,8,9,0]" 
                :key="num"
                @click="appendDigit(num)"
                class="h-14 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xl transition cursor-pointer"
              >
                {{ num }}
              </button>
              <button 
                @click="clearInput"
                class="h-14 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div v-if="error" class="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle :size="16" />
              {{ error }}
            </div>

            <div class="flex gap-3 pt-4">
              <button 
                @click="handleVerify" 
                :disabled="passcodeInput.length !== 4"
                class="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer"
              >
                Unlock
              </button>
              <button 
                @click="handleCancel"
                class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div class="text-center">
              <button 
                @click="handleForgot"
                class="text-xs text-yellow-600 hover:text-yellow-700 font-semibold transition cursor-pointer"
              >
                Forgot Passcode?
              </button>
            </div>
          </div>
        </div>
      </Transition>
      <div class="absolute inset-0 -z-10" @click="handleCancel" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Lock, Eye, EyeOff, AlertCircle } from '@lucide/vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  success: [passcode: string]
  cancel: []
  forgot: []
}>()

const passcodeInput = ref('')
const showPasscode = ref(false)
const error = ref('')

const appendDigit = (digit: number) => {
  if (passcodeInput.value.length < 4) {
    passcodeInput.value += digit.toString()
    error.value = ''
  }
}

const clearInput = () => {
  passcodeInput.value = ''
  error.value = ''
}

const handleVerify = () => {
  if (passcodeInput.value.length === 4) {
    emit('success', passcodeInput.value)
    passcodeInput.value = ''
    error.value = ''
  } else {
    error.value = 'Please enter a valid 4-digit passcode'
  }
}

const handleCancel = () => {
  emit('cancel')
  passcodeInput.value = ''
  error.value = ''
}

const handleForgot = () => {
  emit('forgot')
  passcodeInput.value = ''
  error.value = ''
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: all 0.2s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.95); }
</style>