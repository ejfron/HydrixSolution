<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <div class="p-4 sm:p-8 space-y-6">
        <!-- Show upgrade message for Basic users -->
        <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 text-center">
          <div class="w-20 h-20 rounded-full bg-yellow-200 flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">Subscription Required</h3>
          <p class="text-yellow-700 mb-6 max-w-md mx-auto">
            The Chat System feature requires a Standard or Premium subscription to access. 
            Upgrade your plan to unlock this and many more features!
          </p>
          <div class="flex gap-4 justify-center">
            <button 
              @click="router.push('/userBasic/Subscription')"
              class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition shadow-sm"
            >
              Upgrade Now
            </button>
            <button 
              @click="router.push('/userBasic/dashboard')"
              class="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        <!-- Feature Preview for Basic Users -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6">
          <h4 class="font-semibold text-gray-800 mb-3">✨ Premium Feature Preview</h4>
          <div class="space-y-3 opacity-50">
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div class="w-10 h-10 rounded-full bg-slate-200"></div>
              <div class="flex-1">
                <div class="h-3 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div class="h-2 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div class="w-10 h-10 rounded-full bg-slate-200"></div>
              <div class="flex-1">
                <div class="h-3 bg-slate-200 rounded w-1/4 mb-2"></div>
                <div class="h-2 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          <p class="text-sm text-slate-400 mt-4 text-center">
            Upgrade to Standard or Premium to access the complete chat system
          </p>
        </div>
      </div>
    </main>
  </div>
</template>


<script setup lang="ts">
definePageMeta({ 
  middleware: 'auth'
})

import { useRouter } from 'vue-router'
import Sidebar from '~/components/userBasic/Sidebar.vue'
import Navbar from '~/components/userBasic/Navbar.vue'

const router = useRouter()
const supabase = useSupabaseClient()

interface Profile {
  subscription_plan?: string
  plan?: string
}

// Check if user is premium/standard and redirect if needed
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single()
      
      const userPlan = (profile as unknown as Profile)?.subscription_plan || (profile as unknown as Profile)?.plan || 'basic'
      
      // Redirect premium users to premium version
      if (userPlan === 'premium') {
        router.replace('/userPremium/chatuser')
      } 
      // Redirect standard users to standard version
      else if (userPlan === 'standard') {
        router.replace('/userStandard/chatuser')
      }
      // Basic users stay here
    }
  } catch (error) {
    console.error('Error checking subscription:', error)
  }
})
</script>