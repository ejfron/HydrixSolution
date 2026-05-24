<script lang="ts" setup>
import {Droplets, Timer, ChartNoAxesCombined} from '@lucide/vue'
</script>

<template>
        <!-- Features Section -->
    <section id="features" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- logo -->
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 bg-primary-100 rounded-full px-4 py-1.5 shadow-sm mb-6">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          <span class="text-primary-700 font-semibold text-xs uppercase tracking-wide">Why choose us</span>
        </div>
          <h2 class="text-2xl  font-bold text-gray-900 ">Smart Hydration, Smarter Living</h2>
          <p class="mt-4 text-sm text-gray-600 max-w-2xl mx-auto">Experience the future of water dispensing with advanced features designed for your convenience.</p>
        </div>
        <!-- cards -->
        <div class="grid md:grid-cols-3 gap-8">
          <div class="group text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-green-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-600 transition-colors duration-300">
              <span class="text-2xl text-green-600 group-hover:text-white transition-colors">
                <Droplets />
              </span>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-800">Different Plans</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
                Choose from flexible pricing options to fit your hydration needs, whether you're an individual or a business.
            </p>
          </div>
          <div class="group text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-green-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-600 transition-colors duration-300">
              <span class="text-2xl text-green-600 group-hover:text-white transition-colors">
                <Timer />
              </span>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-800">Smart Auto-Close</h3>
            <p class="text-gray-600 text-sm leading-relaxed">Set and forget – automatic shutoff prevents spills and waste with precision timing.</p>
          </div>
          <div class="group text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-green-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-600 transition-colors duration-300">
              <span class="text-2xl text-green-600 group-hover:text-white transition-colors">
                <ChartNoAxesCombined />
              </span>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-800">Real-Time Analytics</h3>
            <p class="text-gray-600 text-sm leading-relaxed">Track your usage, spending, and savings with our interactive dashboard and insights.</p>
          </div>
        </div>
      </div>
    </section>
</template>