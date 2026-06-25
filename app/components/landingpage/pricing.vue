<template>
  <!-- Pricing Section -->
  <section id="pricing" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Heading -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 bg-primary-100 rounded-full px-4 py-1.5 shadow-sm mb-6">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>

          <span class="text-primary-700 font-semibold text-xs uppercase tracking-wide">
            Flexible Pricing
          </span>
        </div>

        <h2 class="text-3xl font-bold text-gray-900">
          Choose Your Water Station Plan
        </h2>

        <p class="mt-4 text-sm text-gray-600">
          Affordable packages designed for startups, businesses, and entrepreneurs.
        </p>
      </div>

      <!-- Cards -->
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        <!-- Starter Plan -->
        <div
          class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div class="p-6 text-center">
            <div class="text-2xl font-bold text-primary-600">
              Basic
            </div>

            <div class="mt-4">
              <span class="text-5xl font-extrabold text-gray-900">
                ₱449
              </span>

              <span class="text-gray-500">
                /Monthly
              </span>
            </div>

            <p class="mt-4 text-gray-600 text-sm">
              Ideal for small households and beginner entrepreneurs.
            </p>

            <div class="mt-6">
              <span class="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                 ₱599 Setup System Only
              </span>
            </div>
          </div>
        </div>

        <!-- Business Plan -->
        <div
          class="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-primary-300 transform scale-105 relative"
        >
          <!-- Badge -->
          <div
            class="absolute flex gap-1 items-center justify-center top-0 right-0 bg-primary-600 text-white px-4 py-1.5 text-xs font-bold rounded-bl-2xl"
          >
            <span>
              <Flame :size="20" />
            </span>

            <span>
              Best Seller
            </span>
          </div>

          <div class="p-6 text-center">
            <div class="text-2xl font-bold text-primary-600">
              Standard
            </div>

            <div class="mt-4">
              <span class="text-5xl font-extrabold text-gray-900">
                ₱649
              </span>

              <span class="text-gray-500">
                /Monthly
              </span>
            </div>

            <p class="mt-4 text-gray-600 text-sm">
              Complete vending system with automatic store gallon sales tracking and inventory management.
            </p>

            <div class="mt-6">
              <span
                class="text-xs bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full font-semibold"
              >
                ₱1,199 Setup System Only
              </span>
            </div>
          </div>
        </div>

        <!-- Premium Plan -->
        <div
          class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div class="p-6 text-center">
            <div class="text-2xl font-bold text-primary-600">
              Premium
            </div>

            <div class="mt-4">
              <span class="text-5xl font-extrabold text-gray-900">
                ₱499
              </span>

              <span class="text-gray-500">
                /Monthly
              </span>
            </div>

            <p class="mt-4 text-gray-600 text-sm">
              Full software + hardware integration for large-scale operations.
            </p>

            <div class="mt-6">
              <span class="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                Premium Support Included
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { Flame } from '@lucide/vue'
</script>