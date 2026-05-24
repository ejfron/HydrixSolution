<script setup lang="ts">
import { ref } from 'vue'
import { Droplets, SquareChevronLeft } from '@lucide/vue'

const client = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMsg.value = error.message
    loading.value = false
    return
  }

  
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    loading.value = false
    return
  }

  // Fix 2: type the profile result
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (profile?.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/user')
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-screen bg-[#f5faf6] flex relative">

    <NuxtLink
      to="/"
      class="absolute top-6 left-16 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gray-200 hover:bg-white transition"
    >
      <span class="text-xl">
        <SquareChevronLeft class="text-green-600" />
      </span>
      <span class="font-semibold text-green-700">Back to Home</span>
    </NuxtLink>

    <!-- LEFT SIDE -->
    <div class="hidden lg:flex w-1/2 bg-[#0ea44b] relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Droplets />
          </div>
          <h1 class="text-4xl font-black">Hydrix</h1>
        </div>

        <span class="bg-white/20 w-fit px-4 py-2 rounded-full text-sm font-semibold mb-6">
          Smart Water Station System
        </span>

        <h2 class="text-6xl font-black leading-tight mb-6">
          Pure Water, <br> On Demand
        </h2>

        <p class="text-lg text-green-100 leading-relaxed max-w-xl">
          Smart water station dispensing system with real-time analytics,
          automatic timer shutdown, cashless payment integration,
          and modern customer management.
        </p>

        <div class="flex gap-4 mt-10 flex-wrap">
          <div class="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-4">
            <p class="text-2xl font-bold">24/7</p>
            <p class="text-sm text-green-100">Smart Dispensing</p>
          </div>
          <div class="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-4">
            <p class="text-2xl font-bold">Auto</p>
            <p class="text-sm text-green-100">Timer Shutdown</p>
          </div>
          <div class="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-4">
            <p class="text-2xl font-bold">Live</p>
            <p class="text-sm text-green-100">Transaction Logs</p>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT SIDE -->
    <div class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-md">

        <div class="lg:hidden text-center mb-8">
          <h1 class="text-4xl font-black text-[#0ea44b]">💧 Hydrix</h1>
        </div>

        <div class="bg-white rounded-[32px] shadow-2xl border border-gray-100 p-8">
          <div class="mb-8">
            <h2 class="text-4xl font-black text-gray-800 mb-2">Welcome Back</h2>
            <p class="text-gray-500">Login to your Hydrix account</p>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMsg"
            class="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm"
          >
            {{ errorMsg }}
          </div>

          <form @submit.prevent="handleLogin">

            <div class="mb-5">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                v-model="email"
                type="email"
                placeholder="Enter your email"
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea44b]"
                required
              >
            </div>

            <div class="mb-5">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 pr-20 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea44b]"
                  required
                >
                <button
                  type="button"
                  class="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#0ea44b]"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between mb-6">
              <label class="flex items-center gap-2 text-sm text-gray-600">
                <input v-model="rememberMe" type="checkbox" class="rounded border-gray-300">
                Remember me
              </label>
              <a href="#" class="text-sm text-[#0ea44b] hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-[#0ea44b] hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2"
            >
              <span v-if="loading">Logging in...</span>
              <span v-else>Login Account</span>
            </button>

          </form>

          <div class="relative my-7">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="bg-white px-4 text-sm text-gray-400">OR CONTINUE</span>
            </div>
          </div>

          <button class="w-full border border-gray-200 py-4 rounded-2xl hover:bg-gray-50 transition font-semibold text-gray-700">
            Continue as Guest
          </button>

          <p class="text-center text-sm text-gray-600 mt-8">
            Don't have an account?
            <NuxtLink to="/registerpage" class="text-[#0ea44b] font-semibold hover:underline">
              Create Account
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>