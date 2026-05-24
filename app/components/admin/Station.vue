<script setup lang="ts">
import { Plus, Settings, Droplets, Trash2, X, AlertTriangle, MapPin } from '@lucide/vue'
import { useSupabaseClient } from '#imports'

const client = useSupabaseClient()

type Profile = {
  id: string
  full_name: string
  station_name: string
  email: string
  role: string
  location: string
  created_at: string
}

type Transaction = {
  user_id: string
  quantity: number
  total_amount: number
}

const users = ref<(Profile & { total_sales: number; total_gallons: number })[]>([])

const loading = ref(true)
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const createSuccess = ref('')

const showDeleteModal = ref(false)
const deletingId = ref<string | null>(null)
const deletingName = ref('')
const deleting = ref(false)

const newFullName = ref('')
const newStationName = ref('')
const newEmail = ref('')
const newLocation = ref('')
const newPassword = ref('')
const showPassword = ref(false)

const resetForm = () => {
  newFullName.value = ''
  newStationName.value = ''
  newEmail.value = ''
  newPassword.value = ''
  newLocation.value = ''
  createError.value = ''
  createSuccess.value = ''
  showPassword.value = false
}

const openModal = () => { resetForm(); showCreateModal.value = true }
const closeModal = () => { showCreateModal.value = false; resetForm() }

const fetchUsers = async () => {
  loading.value = true

  const { data: profiles } = await client
    .from('profiles')
    .select('id, full_name, station_name, email, role, location, created_at')
    .eq('role', 'user')
    .order('created_at', { ascending: false })
    .returns<Profile[]>()

  if (!profiles) { loading.value = false; return }

  const { data: transactions } = await client
    .from('transactions')
    .select('user_id, quantity, total_amount')
    .eq('status', 'completed')
    .returns<Transaction[]>()

  const totalsMap: Record<string, { sales: number; gallons: number }> = {}

  if (transactions) {
    for (const t of transactions) {
      if (!totalsMap[t.user_id]) totalsMap[t.user_id] = { sales: 0, gallons: 0 }
      totalsMap[t.user_id]!.sales += Number(t.total_amount)
      totalsMap[t.user_id]!.gallons += Number(t.quantity)
    }
  }

  users.value = profiles.map(p => ({
    ...p,
    total_sales: totalsMap[p.id]?.sales ?? 0,
    total_gallons: totalsMap[p.id]?.gallons ?? 0,
  }))

  loading.value = false
}

const createUser = async () => {
  if (!newEmail.value || !newPassword.value || !newStationName.value || !newLocation.value) {
    createError.value = 'Please fill in all required fields.'
    return
  }

  creating.value = true
  createError.value = ''
  createSuccess.value = ''

  const { data: signUpData, error } = await client.auth.signUp({
    email: newEmail.value,
    password: newPassword.value,
    options: {
      data: {
        full_name: newFullName.value,
        station_name: newStationName.value,
      }
    }
  })

  if (error) {
    createError.value = error.message
    creating.value = false
    return
  }

  if (signUpData.user?.id) {
    await (client.from('profiles') as any)
      .update({ location: newLocation.value })
      .eq('id', signUpData.user.id)
  }

  createSuccess.value = `Account for ${newStationName.value} created successfully!`
  creating.value = false

  setTimeout(async () => {
    await fetchUsers()
    closeModal()
  }, 1500)
}

const confirmDelete = (id: string, name: string) => {
  deletingId.value = id
  deletingName.value = name
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!deletingId.value) return
  deleting.value = true

  const { error } = await client.rpc('delete_user_by_id', { user_id: deletingId.value } as any)

  if (error) {
    console.error('Delete error:', error.message)
    deleting.value = false
    return
  }

  users.value = users.value.filter(u => u.id !== deletingId.value)
  showDeleteModal.value = false
  deletingId.value = null
  deletingName.value = ''
  deleting.value = false
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deletingId.value = null
  deletingName.value = ''
}

onMounted(() => fetchUsers())
</script>
<template>
  <div class="relative w-full overflow-hidden p-3">
    <div class="relative z-10">

      <div class="flex items-center justify-between max-w-full">
        <div>
          <h2 class="text-xl text-gray-700 font-bold">Water Stations</h2>
          <p class="text-sm text-slate-500 mt-1">{{ users.length }} station(s) registered</p>
        </div>
        <button
          @click="openModal"
          class="px-10 py-3 cursor-pointer rounded-sm bg-green-600 text-white hover:bg-green-700 hover:scale-105 transition-all duration-300 font-bold text-sm flex items-center gap-3"
        >
          <Plus class="w-5 h-5" />
          Create User
        </button>
      </div>

      <div class="mt-5 bg-green-200 w-full h-0.5" />

      <div v-if="loading" class="mt-10 text-center text-slate-400 text-sm">
        Loading stations...
      </div>

      <div v-else-if="users.length === 0" class="mt-10 text-center text-slate-400 text-sm">
        No stations registered yet.
      </div>

      <div v-else class="mt-5 grid grid-cols-3 gap-5">
        <div
          v-for="user in users"
          :key="user.id"
          class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div class="absolute top-0 left-0 w-full h-0.5 bg-green-600" />

          <div class="flex items-start justify-between mb-5">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                <Droplets class="text-green-600" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-slate-800">
                  {{ user.station_name || 'Unnamed Station' }}
                </h2>
                <p class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin :size="10" />
                  {{ user.location || 'No location' }}
                </p>
              </div>
            </div>

            <button
              @click="confirmDelete(user.id, user.station_name || 'this station')"
              class="w-10 h-10 cursor-pointer rounded-xl hover:bg-red-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition"
            >
              <Trash2 :size="18" />
            </button>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-500">Owner</span>
              <span class="text-sm text-slate-700">{{ user.full_name || '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-500">Email</span>
              <span class="text-sm text-slate-700 truncate max-w-40">{{ user.email }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-500">Status</span>
              <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                <div class="w-2 h-2 rounded-full bg-green-500" />
                Online
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-500">Joined</span>
              <span class="text-sm text-slate-700">
                {{ new Date(user.created_at).toLocaleDateString('en-PH', {
                  year: 'numeric', month: 'short', day: 'numeric'
                }) }}
              </span>
            </div>

            <!-- Real totals -->
            <div class="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p class="text-xs text-slate-500 mb-1">Total Sales</p>
              <h1 class="text-lg font-bold text-green-700">
                ₱{{ user.total_sales.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}
              </h1>
              <p class="text-xs text-green-400 mt-1">
                {{ user.total_gallons }} Gallons Sold
              </p>
            </div>
          </div>

          <div class="mt-6 flex items-center gap-3">
            <button class="flex-1 py-3 text-xs cursor-pointer rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition">
              View Station
            </button>
            <button class="w-12 h-12 cursor-pointer flex items-center justify-center rounded-2xl border border-slate-200 hover:bg-slate-100 transition">
              <Settings class="text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
        <Transition name="scale">
          <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle class="text-red-500" :size="28" />
            </div>
            <h2 class="text-xl font-black text-gray-800 mb-2">Delete Station</h2>
            <p class="text-sm text-slate-500 mb-6">
              Are you sure you want to delete
              <span class="font-bold text-gray-700">{{ deletingName }}</span>?
              This action cannot be undone.
            </p>
            <div class="flex gap-3">
              <button @click="deleteUser" :disabled="deleting"
                class="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm transition cursor-pointer">
                {{ deleting ? 'Deleting...' : 'Yes, Delete' }}
              </button>
              <button @click="cancelDelete"
                class="flex-1 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </Transition>
        <div class="absolute inset-0 -z-10" @click="cancelDelete" />
      </div>
    </Transition>

    <!-- Create User Modal -->
    <Transition name="fade">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
        <Transition name="scale">
          <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

            <div class="bg-green-600 px-8 py-6 text-white flex items-center justify-between">
              <div>
                <h2 class="text-xl font-black">Create New User</h2>
                <p class="text-green-100 text-sm mt-1">Register a new water station account</p>
              </div>
              <button @click="closeModal"
                class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                <X :size="18" />
              </button>
            </div>

            <div class="p-8">
              <div v-if="createError" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                {{ createError }}
              </div>
              <div v-if="createSuccess" class="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm">
                {{ createSuccess }}
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input v-model="newFullName" type="text" placeholder="Enter full name"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Water Station Name <span class="text-red-400">*</span>
                  </label>
                  <input v-model="newStationName" type="text" required placeholder="e.g. KRGM Water Station"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Station Location <span class="text-red-400">*</span>
                  </label>
                  <input v-model="newLocation" type="text" required placeholder="e.g. Taytay, Rizal"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span class="text-red-400">*</span>
                  </label>
                  <input v-model="newEmail" type="email" required placeholder="Enter email"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span class="text-red-400">*</span>
                  </label>
                  <div class="relative">
                    <input v-model="newPassword" :type="showPassword ? 'text' : 'password'" required minlength="6"
                      placeholder="Minimum 6 characters"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-16 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <button type="button" @click="showPassword = !showPassword"
                      class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-green-600">
                      {{ showPassword ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 mt-6">
                <button @click="createUser" :disabled="creating"
                  class="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-2xl font-bold text-sm transition">
                  {{ creating ? 'Creating...' : 'Create User' }}
                </button>
                <button @click="closeModal"
                  class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Transition>
        <div class="absolute inset-0 -z-10" @click="closeModal" />
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: all 0.25s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.95); }
</style>