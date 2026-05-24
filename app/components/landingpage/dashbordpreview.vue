<script lang="ts" setup>
  import { ChartArea } from '@lucide/vue'
</script>

<template>
    <!-- Dashboard Preview -->
    <section class="relative overflow-hidden bg-gradient-to-r from-primary-700 to-primary-800 py-20 text-white">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:flex lg:items-center lg:justify-between">
          <div class="mb-10 lg:mb-0 lg:w-1/2 text-center lg:text-left">
            <h2 class="text-3xl font-extrabold">Smart Dashboard</h2>
            <p class="mt-4 text-lg text-primary-100">Get real-time insights on your consumption, spending, and history – all from your personal dashboard.</p>
            <div class="mt-8">
              <NuxtLink to="/registerpage" class="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:-translate-y-0.5">
                Create Account
                <span>→</span>
              </NuxtLink>
            </div>
          </div>
          <div class="lg:w-1/2 flex justify-center">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 w-full max-w-md border border-white/20 shadow-xl">
              <div class="bg-white rounded-xl p-5 text-gray-800">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <div class="text-sm text-gray-500 font-medium">Today's Sales</div>
                    <div class="text-3xl font-bold text-gray-900">₱1,250</div>
                    <div class="text-xs text-gray-400">125 gallons dispensed</div>
                  </div>
                  <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span class="text-xl text-green-600">
                      <ChartArea />
                    </span>
                  </div>
                </div>
                <div class="space-y-3">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Recent transactions:</span>
                    <span class="font-medium">1 Gal · ₱10</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Peak hour:</span>
                    <span class="font-medium">8:00 AM - 3:00 PM</span>
                  </div>
                  <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-500 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
</template>