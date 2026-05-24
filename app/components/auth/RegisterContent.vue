<script setup lang="ts">
import { ref, computed } from 'vue'
import { SquareChevronLeft, Droplets } from '@lucide/vue'
import ContactDeveloper from '../modal/ContactDeveloper.vue'

const fullName = ref('')
const stationName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showModal = ref(false)

const passwordMatch = computed(() => password.value === confirmPassword.value)
</script>

<template>
  <div class="min-h-screen bg-[#f5faf6] flex relative">

    <NuxtLink
      to="/"
      class="absolute top-6 left-16 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gray-200 hover:bg-white transition"
    >
      <SquareChevronLeft class="text-green-600" />
      <span class="font-semibold text-green-700">Back to Home</span>
    </NuxtLink>

    <!-- LEFT -->
    <div class="hidden lg:flex w-1/2 bg-[#07162d] relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-20 left-20 w-72 h-72 bg-green-400 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-20 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
      </div>
      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-[#0ea44b] flex items-center justify-center">
            <Droplets />
          </div>
          <h1 class="text-4xl font-black">Hydrix</h1>
        </div>
        <span class="bg-green-500/20 border border-green-400/30 w-fit px-4 py-2 rounded-full text-sm font-semibold mb-6 text-green-300">
          Create Your Account
        </span>
        <h2 class="text-6xl font-black leading-tight mb-6">
          Smart Water <br> Station System
        </h2>
        <p class="text-lg text-gray-300 leading-relaxed max-w-xl">
          Join thousands of users enjoying seamless smart water
          dispensing with real-time monitoring and analytics.
        </p>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-md">

        <div class="lg:hidden text-center mb-8">
          <h1 class="text-4xl font-black text-[#0ea44b]">💧 Hydrix</h1>
        </div>

        <div class="bg-white rounded-4xl shadow-2xl border border-gray-100 p-8">
          <div class="mb-8">
            <h2 class="text-4xl font-black text-gray-800 mb-2">Create Account</h2>
            <p class="text-gray-500">Register your Hydrix account</p>
          </div>

          <form @submit.prevent="showModal = true">

            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                v-model="fullName"
                type="text"
                placeholder="Enter your full name"
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea44b]"
              >
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Water Station Name</label>
              <input
                v-model="stationName"
                type="text"
                required
                placeholder="e.g. KRGM Water Station"
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea44b]"
              >
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                v-model="email"
                type="email"
                required
                placeholder="Enter your email"
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea44b]"
              >
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                placeholder="Minimum 6 characters"
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea44b]"
              >
            </div>

            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Confirm password"
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea44b]"
              >
              <p v-if="confirmPassword && !passwordMatch" class="text-red-500 text-sm mt-2">
                Password does not match
              </p>
            </div>

            <div class="mb-6">
              <label class="flex items-center gap-2 text-sm text-gray-600">
                <input v-model="showPassword" type="checkbox" class="rounded border-gray-300">
                Show Password
              </label>
            </div>

            <!-- Triggers modal instead of registering -->
            <button
              type="submit"
              class="w-full bg-[#0ea44b] hover:bg-green-700 text-white py-4 rounded-2xl font-bold transition"
            >
              Create Account
            </button>

          </form>

          <div class="relative my-7">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="bg-white px-4 text-sm text-gray-400">OR</span>
            </div>
          </div>

          <button
            @click="showModal = true"
            class="w-full border border-gray-200 py-4 rounded-2xl hover:bg-gray-50 transition font-semibold text-gray-700"
          >
            Continue as Guest
          </button>

          <p class="text-center text-sm text-gray-600 mt-8">
            Already have an account?
            <NuxtLink to="/loginpage" class="text-[#0ea44b] font-semibold hover:underline">
              Login Here
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>

    <ContactDeveloper v-model="showModal" />
  </div>
</template>