<template>
        <!-- Hero Section -->
    <section id="home" class="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-white py-16 md:py-24">
      <!-- Animated background blobs -->
      <div class="absolute top-0 -left-32 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div class="absolute bottom-0 -right-32 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div class="mb-12 lg:mb-0 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 bg-primary-100 rounded-full px-3 py-1 text-xs font-medium text-primary-700 mb-6">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Smart Water Station System
            </div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span class="text-gray-900">Pure Water,</span>
              <span class="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"> On Demand</span>
            </h1>
            <p class="mt-6 text-sm text-gray-600 max-w-lg mx-auto lg:mx-0">
              Smart water station dispensing system. Get clean, affordable drinking water 24/7. Quick, cashless, and eco-friendly.
            </p>
            <div class="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <NuxtLink to="/registerpage" class="group bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5">
                Start Dispensing
                <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
              </NuxtLink>
              <a href="#features" class="border-2 border-gray-300 hover:border-primary-600 text-gray-700 hover:text-primary-600 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-md">
                Learn More
              </a>
            </div>
            <div class="mt-10 flex items-center justify-center lg:justify-start gap-6">
              <div class="flex -space-x-2">
                <div class="w-10 h-10 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-bold text-primary-700">1k+</div>
                <div class="w-10 h-10 rounded-full bg-primary-50 border-2 border-white flex items-center justify-center text-xs font-bold text-primary-600">2k+</div>
              </div>
              <span class="text-sm text-gray-600">Trusted by over 2,000+ happy customers</span>
            </div>
          </div>
          
          <!-- Interactive Dispenser Card -->
          <div class="relative">
            <div class="absolute -top-6 -right-6 w-32 h-32 bg-primary-300 rounded-full opacity-30 blur-2xl animate-pulse"></div>
            <div class="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 transform transition-all hover:scale-[1.02] duration-300">
              <div class="flex justify-between items-center mb-5">
                <div>
                  <h3 class="font-bold text-gray-800 text-lg">Quick Dispense</h3>
                  <p class="text-xs text-gray-500">Simulate a transaction</p>
                </div>
                <span class="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Ready
                </span>
              </div>
              
              <!-- Gallon Selection -->
              <div class="grid grid-cols-3 gap-3 mb-5">
                <button
                  v-for="gallon in gallons"
                  :key="gallon.value"
                  @click="selectedGallon = gallon.value"
                  :class="[
                    'text-center cursor-pointer p-3 rounded-xl transition-all transform hover:scale-105',
                    selectedGallon === gallon.value 
                      ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-300' 
                      : 'bg-primary-50 text-gray-700 hover:bg-primary-100'
                  ]"
                >
                  <div class="text-xl py-4 font-bold">{{ gallon.value }} Gal</div>
                
                </button>
              </div>
              
              <!-- Price & Timer Info -->
              <div class="bg-gray-50 rounded-xl p-3 mb-5 flex justify-between text-sm">
                <div class="flex items-center gap-1 text-gray-600">
                  <span>
                    <Timer :size="20" class="text-gray-500 "/>
                  </span>
                  <span>{{ autoCloseTime }}</span>
                </div>
                <div class="flex items-center gap-1 text-gray-600">
                  <span>
                    <BadgeDollarSign :size="20" class="text-gray-500"/>
                  </span>
                  <span>{{ currentPrice }}</span>
                </div>
              </div>
              
              <!-- Dispense Button -->
              <button
                @click="simulateDispense"
                :disabled="isDispensing"
                class="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span v-if="!isDispensing" class="flex items-center gap-2 cursor-pointer">
                  <span>
                    <Droplets :size="20"/>
                  </span>
                  <span>
                    Dispense Now
                  </span>
                  </span>
                <span v-else class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Dispensing...
                </span>
              </button>
              
              <!-- Dispense Message -->
              <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 transform -translate-y-2" enter-to-class="opacity-100 transform translate-y-0" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="dispenseMessage" class="mt-3 p-2 rounded-lg flex items-center justify-center gap-1 text-center text-sm font-medium" :class="dispenseMessageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  
                  <span>
                    <Check />
                  </span>
                  <span>
                    {{ dispenseMessage }}
                  </span>
                  
                </div>
              </transition>
              
              <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <span>
                    <Zap :size="15"/>
                  </span>
                  <span>
                    Instant shutoff
                  </span>
                  </span>
                <span class="flex items-center gap-1">
                  <span>
                    <BanknoteArrowDown :size="15"/>
                  </span>
                  <span>
                    Cash or QR
                  </span>
                  </span>
                <span class="flex items-center gap-1">
                  <span>
                    <ChartNoAxesCombined :size="15" />
                  </span>
                  <span>
                    Real-time tracking
                  </span>
                  </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


</template>


<script setup lang="ts">
import { ref } from 'vue'
import { Timer, BadgeDollarSign, Droplets, BanknoteArrowDown, ChartNoAxesCombined, Zap, Check } from '@lucide/vue'

// Mobile menu state
const mobileMenuOpen = ref(false)

// Interactive dispenser state
const gallons = [
  { value: '1', price: 10, time: '30 sec' },
  { value: '2.5', price: 20, time: '1 min' },
  { value: '5', price: 30, time: '1 min 30 sec' }
]
const selectedGallon = ref('2.5')
const isDispensing = ref(false)
const dispenseMessage = ref('')
const dispenseMessageType = ref<'success' | 'error'>('success')
let messageTimeout: ReturnType<typeof setTimeout> | null = null

const currentPrice = computed(() => {
  const gallon = gallons.find(g => g.value === selectedGallon.value)
  return gallon?.price || 0
})

const autoCloseTime = computed(() => {
  const gallon = gallons.find(g => g.value === selectedGallon.value)
  return gallon?.time || '1 min'
})

const simulateDispense = () => {
  if (isDispensing.value) return
  
  isDispensing.value = true
  
  // Clear any existing message timeout
  if (messageTimeout) clearTimeout(messageTimeout)
  
  // Simulate dispensing process
  setTimeout(() => {
    isDispensing.value = false
    dispenseMessage.value = ` Success! ${selectedGallon.value} gallon dispensed. ₱${currentPrice.value} deducted.`
    dispenseMessageType.value = 'success'
    
    // Auto-hide message after 3 seconds
    messageTimeout = setTimeout(() => {
      dispenseMessage.value = ''
    }, 3000)
  }, 2000)
}

// Cleanup timeout on component unmount
onUnmounted(() => {
  if (messageTimeout) clearTimeout(messageTimeout)
})

useHead({
  title: 'WaterStation – Pure Water On Demand | Smart Water Dispensing System',
  meta: [
    { name: 'description', content: 'Smart water station dispensing system. Get clean, affordable drinking water 24/7 with auto-close timers and real-time analytics.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script>