<script lang="ts" setup>
import { UserPlus, Droplets, Timer, CreditCard, ShieldCheck, Zap } from '@lucide/vue'
</script>


<template>
  <!-- How It Works - Redesigned -->
  <section class="relative overflow-hidden bg-gradient-to-b from-white to-primary-50/30 py-24">
    <!-- Background decorative elements -->
    <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
    <div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
    
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 bg-primary-100 rounded-full px-4 py-1.5 shadow-sm mb-6">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          <span class="text-primary-700 font-semibold text-xs uppercase tracking-wide">Simple Process</span>
        </div>
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">
          Get Hydrated in
          <span class="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">3 Easy Steps</span>
        </h2>
        <p class="mt-4 text-sm text-gray-600 max-w-2xl mx-auto">Designed for simplicity, speed, and a seamless hydration experience.</p>
      </div>

      <!-- Steps with modern design -->
      <div class="relative">
        <!-- Connecting line (desktop) -->
        <div class="hidden lg:block absolute top-32 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-300 to-transparent"></div>
        
        <div class="grid lg:grid-cols-3 gap-8 lg:gap-6">
          <!-- Step 1 -->
          <div class="relative group">
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 group-hover:border-primary-200">
              <!-- Step number with animated background -->
              <div class="relative p-6 pb-4">
                <div class="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -translate-y-8 translate-x-8 transition-transform duration-500 group-hover:scale-150"></div>
                <div class="relative flex justify-between items-start">
                  <div class="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    1
                  </div>
                  <div class="text-primary-100 text-6xl font-black opacity-10 group-hover:opacity-20 transition-opacity">01</div>
                </div>
                
                <div class="mt-6">
                  <div class="flex items-center gap-2 mb-3">
                    <span class=" text-gray-800">
                      <UserPlus :size="30"/>
                    </span>
                    <h3 class="text-xl font-bold text-gray-800">Create Account</h3>
                  </div>
                  <p class="text-gray-600 leading-relaxed">Sign up for free and log in to access your personalized dashboard. Takes less than 2 minutes.</p>
                </div>
              </div>
              
              <!-- Step footer with stat -->
              <div class="bg-primary-50/50 px-6 py-3 border-t border-primary-100">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-primary-600 font-medium">Step 1</span>
                  <span class="text-gray-500 flex justify-center items-center gap-1">
                    <span>
                      <Zap :size="15"/>
                    </span>
                    <span>
                       Free registration
                    </span>
                   </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="relative group lg:mt-8">
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 group-hover:border-primary-200">
              <div class="relative p-6 pb-4">
                <div class="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -translate-y-8 translate-x-8 transition-transform duration-500 group-hover:scale-150"></div>
                <div class="relative flex justify-between items-start">
                  <div class="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    2
                  </div>
                  <div class="text-primary-100 text-6xl font-black opacity-10 group-hover:opacity-20 transition-opacity">02</div>
                </div>
                
                <div class="mt-6">
                  <div class="flex items-center gap-2 mb-3">
                    <span class=" text-gray-800">
                      <Droplets :size="30"/>
                    </span>
                    <h3 class="text-xl font-bold text-gray-800">Select Volume</h3>
                  </div>
                  <p class="text-gray-600 leading-relaxed">Choose 1, 3, or 5 gallons – auto timer starts automatically upon dispensing with smart shutoff.</p>
                </div>
              </div>
              
              <div class="bg-primary-50/50 px-6 py-3 border-t border-primary-100">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-primary-600 font-medium">Step 2</span>
                  <span class="text-gray-500 flex justify-center items-center gap-1"> 
                    <span>
                      <Timer :size="15"/>
                    </span>
                    <span>
                      Smart timer included
                    </span>
                    </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="relative group">
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 group-hover:border-primary-200">
              <div class="relative p-6 pb-4">
                <div class="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -translate-y-8 translate-x-8 transition-transform duration-500 group-hover:scale-150"></div>
                <div class="relative flex justify-between items-start">
                  <div class="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    3
                  </div>
                  <div class="text-primary-100 text-6xl font-black opacity-10 group-hover:opacity-20 transition-opacity">03</div>
                </div>
                
                <div class="mt-6">
                  <div class="flex items-center gap-2 mb-3">
                    <span class=" text-gray-800">
                      <CreditCard :size="30"/>
                    </span>
                    <h3 class="text-xl font-bold text-gray-800">Pay & Collect</h3>
                  </div>
                  <p class="text-gray-600 leading-relaxed">Cash or digital payment. Transaction recorded instantly in your history. No contact needed.</p>
                </div>
              </div>
              
              <div class="bg-primary-50/50 px-6 py-3 border-t border-primary-100">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-primary-600 font-medium">Step 3</span>
                  <span class="text-gray-500 flex justify-center items-center gap-1">
                    <span>
                      <ShieldCheck :size="15"/>
                    </span>
                    <span>
                      Secure payments
                    </span>
                    </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Bottom CTA hint -->
        <div class="text-center mt-12">
          <p class="text-gray-500 text-sm flex items-center justify-center gap-2">
            <span class="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
            Ready to start? 
            <NuxtLink to="/registerpage" class="text-primary-600 font-semibold hover:text-shadow-green-700">Create your account →</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Smooth animation for the connecting line */
.group:hover .group-hover\:scale-150 {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>