<template>
        <!-- Navigation -->
    <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
                            
<img src="/logo.svg" alt="Hydrix" class="h-13" />
            <div class="hidden md:ml-8 md:flex md:space-x-6">
              <a href="#home" class="text-gray-700 hover:text-primary-600 px-3 py-2 text-xs font-semibold transition-colors">Home</a>
              <a href="#features" class="text-gray-700 hover:text-primary-600 px-3 py-2 text-xs font-semibold transition-colors">Features</a>
              <a href="#pricing" class="text-gray-700 hover:text-primary-600 px-3 py-2 text-xs font-semibold transition-colors">Pricing</a>
              <a href="#contact" class="text-gray-700 hover:text-primary-600 px-3 py-2 text-xs font-semibold transition-colors">Contact</a>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <NuxtLink to="/loginpage" class="hidden sm:inline-block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-xs font-semibold transition-colors">
              Sign In
            </NuxtLink>
            <NuxtLink to="/registerpage" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md">
              Get Started
            </NuxtLink>
            <!-- Mobile menu button -->
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-expanded="false">
              <span class="sr-only">Open main menu</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <!-- Mobile menu panel -->
      <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
        <div v-if="mobileMenuOpen" class="md:hidden absolute top-16 inset-x-0 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 z-40">
          <div class="px-4 pt-2 pb-4 space-y-1">
            <a href="#home" @click="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">Home</a>
            <a href="#features" @click="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">Features</a>
            <a href="#pricing" @click="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">Pricing</a>
            <a href="#contact" @click="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">Contact</a>
            <div class="pt-4 space-y-2">
              <NuxtLink to="/loginpage" @click="mobileMenuOpen = false" class="block w-full text-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">Sign In</NuxtLink>
              <NuxtLink to="/registerpage" @click="mobileMenuOpen = false" class="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-base font-semibold">Get Started</NuxtLink>
            </div>
          </div>
        </div>
      </transition>
    </nav>
</template>


<script lang="ts" setup>

import { ref } from 'vue'
import { Droplets } from '@lucide/vue'

// Mobile menu state
const mobileMenuOpen = ref(false)

</script>