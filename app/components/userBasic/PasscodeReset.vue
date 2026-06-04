<!-- components/user/PasscodeReset.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
      <Transition name="scale">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="bg-linear-to-r from-yellow-500 to-orange-500 px-6 py-5">
            <div class="flex items-center justify-center mb-3">
              <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <KeyRound :size="32" class="text-white" />
              </div>
            </div>
            <h2 class="text-xl font-black text-white text-center">Reset Passcode</h2>
            <p class="text-yellow-100 text-xs text-center mt-1">Enter your current passcode to reset</p>
          </div>

          <div class="p-6 space-y-4">
            <div v-if="step === 1">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Current Passcode</label>
                <div class="relative">
                  <input 
                    v-model="currentPasscode" 
                    :type="showCurrentPasscode ? 'text' : 'password'" 
                    placeholder="Enter your current 4-digit passcode"
                    maxlength="4"
                    pattern="[0-9]{4}"
                    @keyup.enter="verifyCurrentPasscode"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm text-center tracking-widest"
                  />
                  <button 
                    @click="showCurrentPasscode = !showCurrentPasscode"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye :size="18" v-if="!showCurrentPasscode" />
                    <EyeOff :size="18" v-else />
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 mt-2">
                <button 
                  v-for="num in [1,2,3,4,5,6,7,8,9,0]" 
                  :key="num"
                  @click="appendCurrentDigit(num)"
                  class="h-14 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xl transition cursor-pointer"
                >
                  {{ num }}
                </button>
                <button 
                  @click="clearCurrentInput"
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
                  @click="verifyCurrentPasscode" 
                  :disabled="currentPasscode.length !== 4"
                  class="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer"
                >
                  Verify & Continue
                </button>
                <button 
                  @click="handleCancel"
                  class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div v-else-if="step === 2">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">New Passcode</label>
                <div class="relative">
                  <input 
                    v-model="newPasscode" 
                    :type="showNewPasscode ? 'text' : 'password'" 
                    placeholder="Enter new 4-digit passcode"
                    maxlength="4"
                    pattern="[0-9]{4}"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm text-center tracking-widest"
                  />
                  <button 
                    @click="showNewPasscode = !showNewPasscode"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye :size="18" v-if="!showNewPasscode" />
                    <EyeOff :size="18" v-else />
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 mt-2">
                <button 
                  v-for="num in [1,2,3,4,5,6,7,8,9,0]" 
                  :key="num"
                  @click="appendNewDigit(num)"
                  class="h-14 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xl transition cursor-pointer"
                >
                  {{ num }}
                </button>
                <button 
                  @click="clearNewInput"
                  class="h-14 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <div class="flex gap-3 pt-4">
                <button 
                  @click="goToConfirm" 
                  :disabled="newPasscode.length !== 4"
                  class="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer"
                >
                  Next
                </button>
                <button 
                  @click="step = 1"
                  class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>

            <div v-else-if="step === 3">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Confirm New Passcode</label>
                <div class="relative">
                  <input 
                    v-model="confirmPasscode" 
                    :type="showConfirmPasscode ? 'text' : 'password'" 
                    placeholder="Confirm new 4-digit passcode"
                    maxlength="4"
                    pattern="[0-9]{4}"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm text-center tracking-widest"
                  />
                  <button 
                    @click="showConfirmPasscode = !showConfirmPasscode"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye :size="18" v-if="!showConfirmPasscode" />
                    <EyeOff :size="18" v-else />
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 mt-2">
                <button 
                  v-for="num in [1,2,3,4,5,6,7,8,9,0]" 
                  :key="num"
                  @click="appendConfirmDigit(num)"
                  class="h-14 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xl transition cursor-pointer"
                >
                  {{ num }}
                </button>
                <button 
                  @click="clearConfirmInput"
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
                  @click="resetPasscode" 
                  :disabled="confirmPasscode.length !== 4"
                  class="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer"
                >
                  Reset Passcode
                </button>
                <button 
                  @click="step = 2"
                  class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <div class="absolute inset-0 -z-10" @click="handleCancel" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { KeyRound, Eye, EyeOff, AlertCircle } from '@lucide/vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  success: [newPasscode: string]
  cancel: []
}>()

const step = ref(1)
const currentPasscode = ref('')
const newPasscode = ref('')
const confirmPasscode = ref('')
const error = ref('')

const showCurrentPasscode = ref(false)
const showNewPasscode = ref(false)
const showConfirmPasscode = ref(false)

const appendCurrentDigit = (digit: number) => {
  if (currentPasscode.value.length < 4) {
    currentPasscode.value += digit.toString()
    error.value = ''
  }
}

const clearCurrentInput = () => {
  currentPasscode.value = ''
  error.value = ''
}

const appendNewDigit = (digit: number) => {
  if (newPasscode.value.length < 4) {
    newPasscode.value += digit.toString()
    error.value = ''
  }
}

const clearNewInput = () => {
  newPasscode.value = ''
  error.value = ''
}

const appendConfirmDigit = (digit: number) => {
  if (confirmPasscode.value.length < 4) {
    confirmPasscode.value += digit.toString()
    error.value = ''
  }
}

const clearConfirmInput = () => {
  confirmPasscode.value = ''
  error.value = ''
}

const verifyCurrentPasscode = () => {
  if (currentPasscode.value.length !== 4) {
    error.value = 'Please enter a valid 4-digit passcode'
    return
  }
  
  const savedPasscode = localStorage.getItem('workers_passcode')
  if (currentPasscode.value === savedPasscode) {
    step.value = 2
    error.value = ''
    currentPasscode.value = ''
  } else {
    error.value = 'Invalid current passcode. Please try again.'
    currentPasscode.value = ''
  }
}

const goToConfirm = () => {
  if (newPasscode.value.length !== 4) {
    error.value = 'Please enter a valid 4-digit passcode'
    return
  }
  step.value = 3
  error.value = ''
}

const resetPasscode = () => {
  if (newPasscode.value !== confirmPasscode.value) {
    error.value = 'New passcodes do not match'
    confirmPasscode.value = ''
    return
  }
  
  if (newPasscode.value.length === 4 && /^\d+$/.test(newPasscode.value)) {
    emit('success', newPasscode.value)
    resetForm()
  } else {
    error.value = 'Please enter a valid 4-digit passcode'
  }
}

const resetForm = () => {
  step.value = 1
  currentPasscode.value = ''
  newPasscode.value = ''
  confirmPasscode.value = ''
  error.value = ''
  showCurrentPasscode.value = false
  showNewPasscode.value = false
  showConfirmPasscode.value = false
}

const handleCancel = () => {
  resetForm()
  emit('cancel')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: all 0.2s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.95); }
</style>