<template>
  <div class="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
    <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
      <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <XCircle :size="32" class="text-red-600" />
      </div>
      <h2 class="text-xl font-black text-gray-800 mb-2">Payment Failed</h2>
      <p class="text-sm text-slate-500 mb-6">
        Your GCash payment was not completed. Please try again.
      </p>
      <NuxtLink
        :to="redirectPath"
        class="block w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition"
      >
        Try Again
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XCircle } from '@lucide/vue'

const client = useSupabaseClient()
const user = useSupabaseUser()
const redirectPath = ref('/userBasic/subscription')

onMounted(async () => {
  const { data: profile } = await (client.from('profiles') as any)
    .select('plan')
    .eq('id', user.value?.id)
    .single()

  if (profile?.plan === 'premium') redirectPath.value = '/userPremium/Subscription'
  else if (profile?.plan === 'standard') redirectPath.value = '/userStandard/Subscription'
  else redirectPath.value = '/userBasic/subscription'
})
</script>