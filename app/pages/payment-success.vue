<template>
  <div class="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
    <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
      <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle :size="32" class="text-green-600" />
      </div>
      <h2 class="text-xl font-black text-gray-800 mb-2">Payment Successful!</h2>
      <p class="text-sm text-slate-500 mb-6">
        Your ₱500 monthly subscription has been paid. Your account is now active for another month.
      </p>
      <div class="bg-green-50 rounded-2xl p-4 mb-6 border border-green-100">
        <p class="text-xs text-slate-500">Amount Paid</p>
        <p class="font-black text-green-600 text-2xl">₱500.00</p>
      </div>
      <NuxtLink
        :to="redirectPath"
        class="block w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition"
      >
        Back to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle } from '@lucide/vue'

const route = useRoute()
const client = useSupabaseClient()
const user = useSupabaseUser()

const redirectPath = ref('/userBasic')

onMounted(async () => {
  // Determine correct dashboard based on plan
  const { data: profile } = await (client.from('profiles') as any)
    .select('plan')
    .eq('id', user.value?.id)
    .single()

  if (profile?.plan === 'premium') redirectPath.value = '/userPremium'
  else if (profile?.plan === 'standard') redirectPath.value = '/userStandard'
  else redirectPath.value = '/userBasic'
})
</script>