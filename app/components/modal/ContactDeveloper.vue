<!-- components/Modal/SystemAccessModal.vue -->
<script setup lang="ts">
import {Droplets, ChartArea, ChartNoAxesCombined, GlassWater} from '@lucide/vue'
defineProps<{
  modelValue: boolean
}>()



const emit = defineEmits(['update:modelValue'])

function closeModal() {
  emit('update:modelValue', false)
}
</script>

<template>

  <!-- Overlay -->
  <Transition name="fade">
    <div
       v-if="modelValue"
  class="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto"
    >

      <!-- Modal -->
      <Transition name="scale">
        <div
           class="relative w-full max-w-2xl my-10 bg-white rounded-[12px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto  no-scrollbar"
        >

          <!-- Top Banner -->
          <div class="bg-[#0ea44b] px-8 py-10 text-white relative overflow-hidden">

            <!-- Glow -->
            <div class="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

            <button
              class="absolute cursor-pointer top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
              @click="closeModal"
            >
              ✕
            </button>

            <div class="relative z-10">

              <span class="bg-white/20  px-4 py-2 rounded-full text-xs font-semibold">
                Premium Smart Water System
              </span>

              <h2 class="text-2xl font-black mt-5 leading-tight">
                System Login <br>
                Access Required
              </h2>

              <p class="mt-4 text-green-100 text-xs leading-relaxed max-w-xl">
                Contact the developer to avail the complete
                Hydrix Smart Water Station System and gain
                access to premium business automation tools.
              </p>

            </div>

          </div>

          <!-- Content -->
          <div class="p-8">

            <!-- Features -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

              <!-- Card -->
              <div class="border border-gray-200 rounded-2xl p-5">
                <div class="text-3xl mb-3">
                  <Droplets :size="30" class="text-green-600"/>
                </div>

                <h3 class="font-bold text-gray-800 text-lg mb-2">
                  Water Management
                </h3>

                <p class="text-xs text-gray-500 leading-relaxed">
                  Monitor water dispensing operations,
                  customer transactions, and daily usage reports.
                </p>
              </div>

              <!-- Card -->
              <div class="border border-gray-200 rounded-2xl p-5">
                <div class="text-3xl mb-3">
                  <ChartArea :size="30" class="text-green-600"/>
                </div>

                <h3 class="font-bold text-gray-800 text-lg mb-2">
                  Analytics Dashboard
                </h3>

                <p class="text-xs text-gray-500 leading-relaxed">
                  Access real-time insights, income tracking,
                  and system activity monitoring.
                </p>
              </div>

              <!-- Card -->
              <div class="border border-gray-200 rounded-2xl p-5">
                <div class="text-3xl mb-3">
                  <GlassWater :size="30" class="text-green-600"/>
                </div>

                <h3 class="font-bold text-gray-800 text-lg mb-2">
                  Smart Water Dispensing
                </h3>

                <p class="text-xs text-gray-500 leading-relaxed">
                  Automated dispensing system with timer shutdown
                  and smart control integration.
                </p>
              </div>

              <!-- Card -->
              <div class="border border-gray-200 rounded-2xl p-5">
                <div class="text-3xl mb-3">
                  <ChartNoAxesCombined :size="30" class="text-green-600"/>
                </div>

                <h3 class="font-bold text-gray-800 text-lg mb-2">
                  Real-Time Sales Tracking
                </h3>

                <p class="text-xs text-gray-500 leading-relaxed">
                  Track transactions, monitor sales,
                  and generate operational reports instantly.
                </p>
              </div>

            </div>

            <!-- Pricing -->
            <div class="bg-[#f5faf6] rounded-2xl p-5 border border-green-100 mb-8">

              <h3 class="font-bold text-gray-800 text-lg mb-3">
                Flexible Payment Plans
              </h3>

              <div class="flex flex-wrap gap-3">

                <span class="bg-white text-green-600 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
                  Weekly Plan
                </span>

                <span class="bg-white text-green-600 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
                  Monthly Subscription
                </span>

                <span class="bg-white  text-green-600 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
                  One-Time Lifetime Access
                </span>

              </div>

            </div>

            <!-- Buttons -->
            <div class="flex flex-col sm:flex-row gap-4">

              <button
                class="flex-1 bg-[#0ea44b] hover:bg-green-700 text-sm cursor-pointer text-white py-4 rounded-2xl font-bold transition"
              >
                Contact Developer
              </button>

              <button
                class="flex-1 border text-sm cursor-pointer border-gray-200 hover:bg-gray-50 text-gray-700 py-4 rounded-2xl font-semibold transition"
                @click="closeModal"
              >
                Maybe Later
              </button>

            </div>

          </div>

        </div>
      </Transition>

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
  transition: all 0.25s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>