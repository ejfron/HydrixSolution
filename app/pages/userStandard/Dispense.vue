<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <!-- Subscription Expired Modal -->
      <Transition name="fade">
        <div v-if="isExpired" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle :size="32" class="text-red-600" />
            </div>
            <h2 class="text-xl font-black text-gray-800 mb-2">Subscription Expired</h2>
            <p class="text-sm text-slate-500 mb-4">Your monthly payment is overdue. Please contact admin to renew.</p>
            <div class="bg-red-50 rounded-2xl p-4 mb-4 border border-red-100">
              <p class="text-xs text-slate-500">Monthly Fee Due</p>
              <p class="font-black text-red-600 text-lg">₱500/month</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-3 mb-6 border border-slate-100">
              <p class="text-xs text-slate-500">Next Payment Date</p>
              <p class="font-bold text-slate-700 text-sm">{{ nextPaymentDate }}</p>
            </div>
            <a href="https://www.facebook.com/ej.fron16" target="_blank"
              class="block w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition">
              Contact Admin to Pay
            </a>
          </div>
        </div>
      </Transition>

      <!-- Transaction Type Modal -->
      <Transition name="fade">
        <div v-if="showTypeModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <Transition name="scale">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div class="bg-green-600 px-6 py-5 flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-black text-white">{{ selectedGallon?.name }}</h2>
                  <p class="text-green-100 text-xs mt-0.5">Select transaction type</p>
                </div>
                <button @click="closeDispenseModal" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                  <X :size="16" class="text-white" />
                </button>
              </div>
              <div class="p-6 space-y-3">
                <button @click="selectType('regular')"
                  class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-slate-200 hover:border-green-400 hover:bg-green-50/50 transition cursor-pointer text-left">
                  <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <Droplets :size="22" class="text-green-600" />
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">Regular Dispense</p>
                    <p class="text-xs text-slate-400 mt-0.5">Walk-in or rider — ₱{{ selectedGallon?.price }} per piece</p>
                  </div>
                </button>
                <button @click="selectType('reseller')"
                  class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 transition cursor-pointer text-left">
                  <div class="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Users :size="22" class="text-violet-600" />
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">Retailer / Reseller</p>
                    <p class="text-xs text-slate-400 mt-0.5">Bulk order — set custom quantity and price</p>
                  </div>
                </button>
              </div>
            </div>
          </Transition>
          <div class="absolute inset-0 -z-10" @click="closeDispenseModal" />
        </div>
      </Transition>

      <!-- Dispense Modal -->
      <Transition name="fade">
        <div v-if="showDispenseModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Transition name="scale">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden max-h-[90vh] flex flex-col">
              <div :class="['px-6 py-5 flex items-center justify-between shrink-0',
                selectedType === 'reseller' ? 'bg-violet-600' : 'bg-green-600']">
                <div>
                  <h2 class="text-lg font-black text-white">
                    {{ selectedType === 'reseller' ? 'Retailer / Reseller' : 'Regular Dispense' }}
                  </h2>
                  <p class="text-white/70 text-xs mt-0.5">{{ selectedGallon?.name }}</p>
                </div>
                <button @click="closeDispenseModal" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                  <X :size="16" class="text-white" />
                </button>
              </div>

              <div class="p-6 space-y-4 overflow-y-auto flex-1">

                <!-- Regular Mode -->
                <div v-if="selectedType === 'regular'">
                  <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img v-if="selectedGallon?.image_url" :src="selectedGallon.image_url" class="w-full h-full object-cover" />
                        <Droplets v-else :size="20" class="text-green-600" />
                      </div>
                      <div>
                        <p class="font-bold text-slate-800">{{ selectedGallon?.name }}</p>
                        <p class="text-xs text-slate-400">{{ selectedGallon?.size }} {{ selectedGallon?.unit }}</p>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <Hash :size="14" class="inline mr-1" />Number of Gallons
                      </label>
                      <input v-model.number="regularQty" type="number" min="1"
                        class="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                    </div>
                    <div v-if="isWalkIn" class="mb-3">
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <DollarSign :size="14" class="inline mr-1" />Walk-in Price per Gallon <span class="text-red-400">*</span>
                      </label>
                      <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                        <input v-model.number="walkInPrice" type="number" min="1" :placeholder="`e.g. ${selectedGallon?.price}`"
                          class="w-full bg-white border border-green-300 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                      </div>
                      <p class="text-xs text-slate-400 mt-1">Default rider price is ₱{{ selectedGallon?.price }}</p>
                    </div>
                    <div v-else class="mb-3 bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                      <p class="text-xs text-green-700">
                        <Tag :size="12" class="inline mr-1" />Using rider price: <strong>₱{{ selectedGallon?.price }}/gallon</strong>
                      </p>
                    </div>
                    <div class="flex items-center justify-between pt-3 border-t border-slate-200">
                      <span class="text-sm text-slate-500">{{ regularQty }} × ₱{{ actualPricePerPiece.toFixed(2) }}</span>
                      <span class="font-black text-green-600 text-lg">₱{{ regularTotal.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Reseller Mode -->
                <div v-else class="space-y-3">
                  <div class="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                    <p class="text-xs font-semibold text-violet-600 mb-1">
                      <Package :size="14" class="inline mr-1" />{{ selectedGallon?.name }}
                    </p>
                    <p class="text-xs text-slate-400">Regular price: ₱{{ selectedGallon?.price }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <Hash :size="14" class="inline mr-1" />Number of Gallons <span class="text-red-400">*</span>
                    </label>
                    <input v-model.number="resellerQty" type="number" min="1" placeholder="e.g. 12"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign :size="14" class="inline mr-1" />Price per Gallon <span class="text-red-400">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                      <input v-model.number="resellerPrice" type="number" min="1" placeholder="e.g. 20"
                        class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                    </div>
                  </div>
                  <div v-if="resellerQty && resellerPrice" class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-slate-500">{{ resellerQty }} × ₱{{ resellerPrice }}</span>
                      <span class="font-black text-violet-600 text-lg">₱{{ resellerTotal.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Rider Selector -->
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Bike :size="14" class="text-slate-400" />Delivery Rider
                    <span class="text-slate-400 font-normal text-xs">(optional)</span>
                  </label>
                  <div v-if="riders.length === 0" class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-xs">
                    <Truck :size="14" class="inline mr-1" />No riders added yet.
                    <NuxtLink to="/userBasic/riders" class="text-green-600 font-semibold underline">Add riders here</NuxtLink>
                  </div>
                  <div v-else class="space-y-2">
                    <button @click="selectedRiderId = null; selectedRiderName = ''; walkInPrice = null"
                      :class="['w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition cursor-pointer text-left',
                        !selectedRiderId ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50']">
                      <div :class="['w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0',
                        !selectedRiderId ? 'bg-green-600' : 'bg-slate-100']">
                        <User :size="14" :class="!selectedRiderId ? 'text-white' : 'text-slate-500'" />
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-semibold text-slate-800">Walk-in Customer</p>
                        <p class="text-xs text-slate-400">Custom price — enter amount above</p>
                      </div>
                      <CheckCircle v-if="!selectedRiderId" :size="16" class="text-green-500 shrink-0" />
                    </button>
                    <button v-for="rider in riders" :key="rider.id"
                      @click="selectedRiderId = rider.id; selectedRiderName = rider.name; walkInPrice = null"
                      :class="['w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition cursor-pointer text-left',
                        selectedRiderId === rider.id ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white hover:border-green-300 hover:bg-green-50/50']">
                      <div :class="['w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0',
                        selectedRiderId === rider.id ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700']">
                        {{ rider.name.charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-800">{{ rider.name }}</p>
                        <p class="text-xs text-slate-400">{{ rider.phone || `Uses ₱${selectedGallon?.price} per gallon` }}</p>
                      </div>
                      <CheckCircle v-if="selectedRiderId === rider.id" :size="16" class="text-green-500 shrink-0" />
                    </button>
                  </div>
                </div>

                <!-- Payment Status -->
                <div class="border-t border-slate-100 pt-4">
                  <label class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                    <CreditCard :size="14" class="text-slate-400" />Payment Status
                  </label>
                  <div class="grid grid-cols-3 gap-2 mb-3">
                    <button @click="setPaymentStatus('paid')"
                      :class="['py-3 px-2 rounded-2xl border-2 text-xs font-bold transition cursor-pointer text-center flex flex-col items-center gap-1',
                        paymentStatus === 'paid' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50']">
                      <CheckCircle :size="16" />Paid
                    </button>
                    <button @click="setPaymentStatus('unpaid')"
                      :class="['py-3 px-2 rounded-2xl border-2 text-xs font-bold transition cursor-pointer text-center flex flex-col items-center gap-1',
                        paymentStatus === 'unpaid' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50']">
                      <Ban :size="16" />Unpaid
                    </button>
                    <button @click="setPaymentStatus('partial')"
                      :class="['py-3 px-2 rounded-2xl border-2 text-xs font-bold transition cursor-pointer text-center flex flex-col items-center gap-1',
                        paymentStatus === 'partial' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50']">
                      <Clock :size="16" />Partial
                    </button>
                  </div>

                  <div v-if="paymentStatus === 'unpaid'" class="bg-red-50 rounded-xl px-3 py-2 border border-red-100">
                    <p class="text-xs text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle :size="14" />Buong ₱{{ totalAmount.toFixed(2) }} ay utang — walang binayad
                    </p>
                  </div>

                  <div v-if="paymentStatus === 'partial'" class="mb-3">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <Banknote :size="14" class="inline mr-1" />Amount Paid Now <span class="text-red-400">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                      <input v-model.number="partialAmount" type="number" min="1" :max="totalAmount - 1" placeholder="e.g. 50"
                        class="w-full bg-gray-50 border border-yellow-300 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
                    </div>
                    <div v-if="partialAmount && partialAmount > 0" class="mt-2 bg-yellow-50 rounded-xl px-3 py-2 border border-yellow-100 text-xs">
                      <div class="flex justify-between">
                        <span class="text-slate-500">Paid now</span>
                        <span class="font-bold text-green-600"><CheckCircle :size="12" class="inline mr-1" />₱{{ partialAmount.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between mt-1">
                        <span class="text-slate-500">Balance (utang)</span>
                        <span class="font-bold text-red-500"><AlertCircle :size="12" class="inline mr-1" />₱{{ (totalAmount - partialAmount).toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="paymentStatus === 'paid'" class="bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                    <p class="text-xs text-green-700 font-semibold flex items-center gap-1">
                      <CheckCircle :size="14" />Fully paid — ₱{{ totalAmount.toFixed(2) }}
                    </p>
                  </div>
                </div>

                <div v-if="errorMsg" class="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle :size="16" />{{ errorMsg }}
                </div>

                <button @click="dispense" :disabled="loading"
                  :class="['w-full py-4 rounded-2xl font-black text-sm text-white transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2',
                    paymentStatus === 'unpaid' ? 'bg-red-500 hover:bg-red-600' :
                    paymentStatus === 'partial' ? 'bg-yellow-500 hover:bg-yellow-600' :
                    selectedType === 'reseller' ? 'bg-violet-600 hover:bg-violet-700' :
                    'bg-green-600 hover:bg-green-700']">
                  <Loader v-if="loading" :size="16" class="animate-spin" />
                  <span v-else>
                    <template v-if="paymentStatus === 'unpaid'">
                      <FileText :size="16" class="inline mr-1" />Record as Unpaid (Utang)
                    </template>
                    <template v-else-if="paymentStatus === 'partial'">
                      <FileText :size="16" class="inline mr-1" />Record Partial Payment
                    </template>
                    <template v-else>
                      <CheckCircle :size="16" class="inline mr-1" />Confirm Paid Dispense
                    </template>
                  </span>
                </button>
              </div>
            </div>
          </Transition>
          <div class="absolute inset-0 -z-10" @click="closeDispenseModal" />
        </div>
      </Transition>

      <!-- Create Gallon Modal -->
      <Transition name="fade">
        <div v-if="showCreateModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <Transition name="scale">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
              <div class="bg-green-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 class="text-lg font-black text-white">Create Gallon Type</h2>
                  <p class="text-green-100 text-xs mt-0.5">Add a new product to your station</p>
                </div>
                <button @click="showCreateModal = false" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                  <X :size="16" class="text-white" />
                </button>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                  <div class="relative w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 hover:border-green-400 transition cursor-pointer overflow-hidden flex items-center justify-center bg-slate-50"
                    @click="($refs.imageInput as HTMLInputElement)?.click()">
                    <img v-if="newImagePreview" :src="newImagePreview" class="absolute inset-0 w-full h-full object-cover" />
                    <div v-else class="flex flex-col items-center gap-2 text-slate-400">
                      <ImagePlus :size="28" /><p class="text-xs">Click to upload image</p>
                    </div>
                    <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageSelect" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag :size="14" class="inline mr-1" />Gallon Name <span class="text-red-400">*</span>
                  </label>
                  <input v-model="newName" type="text" placeholder="e.g. Round 5 Gallon"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <Hash :size="14" class="inline mr-1" />Size <span class="text-red-400">*</span>
                    </label>
                    <input v-model.number="newSize" type="number" min="0.1" step="0.1" placeholder="e.g. 5"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <Ruler :size="14" class="inline mr-1" />Unit
                    </label>
                    <select v-model="newUnit" class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                      <option value="gallon">Gallon</option>
                      <option value="liter">Liter</option>
                      <option value="ml">mL</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign :size="14" class="inline mr-1" />Regular Price <span class="text-red-400">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                    <input v-model.number="newPrice" type="number" min="1" placeholder="e.g. 30"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  </div>
                </div>
                <div v-if="createError" class="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle :size="16" />{{ createError }}
                </div>
                <div class="flex gap-3 pt-2">
                  <button @click="createGallonType" :disabled="creating"
                    class="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2">
                    <Loader v-if="creating" :size="16" class="animate-spin" />
                    <Plus v-else :size="16" />
                    {{ creating ? 'Creating...' : 'Create Gallon' }}
                  </button>
                  <button @click="showCreateModal = false"
                    class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </Transition>
          <div class="absolute inset-0 -z-10" @click="showCreateModal = false" />
        </div>
      </Transition>

      <!-- Main Content -->
      <div class="p-4 sm:p-8 space-y-6 sm:space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Dispense Water</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-1">Manage your gallon types and dispense</p>
          </div>
          <button @click="showCreateModal = true"
            class="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm transition cursor-pointer">
            <Plus :size="16" />Add Gallon Type
          </button>
        </div>

        <div v-if="!isExpired && daysRemaining <= 7 && daysRemaining > 0"
          class="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <AlertTriangle :size="20" class="text-yellow-600" />
            <div>
              <p class="font-bold text-yellow-700 text-sm">Subscription Expiring Soon</p>
              <p class="text-xs text-yellow-600 mt-1">Expires in {{ daysRemaining }} day(s) — {{ nextPaymentDate }}</p>
            </div>
          </div>
          <a href="https://www.facebook.com/ej.fron16" target="_blank"
            class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition w-full sm:w-auto text-center">
            Pay Now
          </a>
        </div>

        <Transition name="fade">
          <div v-if="successMsg" class="px-5 py-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-semibold flex items-center gap-2">
            <CheckCircle :size="16" />{{ successMsg }}
          </div>
        </Transition>

        <div v-if="gallonTypes.length === 0" class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Droplets :size="28" class="text-green-600" />
          </div>
          <h3 class="font-bold text-slate-700 text-lg mb-2">No gallon types yet</h3>
          <p class="text-slate-400 text-sm mb-6">Create your first gallon type to start dispensing</p>
          <button @click="showCreateModal = true"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 mx-auto">
            <Plus :size="16" />Create First Gallon
          </button>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div v-for="g in gallonTypes" :key="g.id"
            class="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div class="absolute top-0 left-0 w-full h-0.5 bg-green-600" />
            <button @click.stop="openDeleteModal(g)" :disabled="deletingId === g.id"
              class="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-white/80 hover:bg-red-50 border border-slate-200 hover:border-red-200 flex items-center justify-center cursor-pointer transition opacity-0 group-hover:opacity-100">
              <Trash2 :size="14" :class="deletingId === g.id ? 'text-slate-300' : 'text-slate-400 hover:text-red-500'" />
            </button>
            <div class="h-32 bg-gradient-to-br from-green-50 to-slate-50 flex items-center justify-center overflow-hidden">
              <img v-if="g.image_url" :src="g.image_url" :alt="g.name" class="h-full w-full object-cover" />
              <div v-else class="flex flex-col items-center gap-2 text-slate-300">
                <Droplets :size="36" />
              </div>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-slate-800 text-base mb-0.5">{{ g.name }}</h3>
              <p class="text-xs text-slate-400 mb-4"><Ruler :size="12" class="inline mr-1" />{{ g.size }} {{ g.unit }}</p>
              <div class="flex items-center flex-wrap gap-2 mb-5">
                <span class="px-3 py-1.5 rounded-xl bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                  <Bike :size="12" />Rider ₱{{ g.price }}
                </span>
                <span class="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1">
                  <User :size="12" />Walk-in Custom
                </span>
                <span class="px-3 py-1.5 rounded-xl bg-violet-100 text-violet-700 text-xs font-bold flex items-center gap-1">
                  <Users :size="12" />Reseller
                </span>
              </div>
              <button @click="openDispense(g)" :disabled="isExpired"
                class="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2">
                <ShoppingCart :size="15" />Dispense
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Delete Gallon Modal -->
  <Transition name="fade">
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <Transition name="scale">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="bg-red-600 px-6 py-5 flex items-center gap-3">
            <AlertTriangle :size="24" class="text-white" />
            <h2 class="text-lg font-black text-white">Delete Gallon Type</h2>
          </div>
          <div class="p-6">
            <p class="text-slate-600 mb-2">Are you sure you want to delete <span class="font-bold text-slate-800">{{ gallonToDelete?.name }}</span>?</p>
            <p class="text-sm text-red-500 flex items-center gap-1"><AlertCircle :size="14" />This action cannot be undone.</p>
            <div class="flex gap-3 mt-6">
              <button @click="showDeleteModal = false"
                class="flex-1 py-3 border border-slate-200 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                Cancel
              </button>
              <button @click="confirmDelete" :disabled="Boolean(deletingId)"
                class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                <Loader v-if="deletingId" :size="16" class="animate-spin" />
                <Trash2 v-else :size="16" />
                {{ deletingId ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
      <div class="absolute inset-0 -z-10" @click="showDeleteModal = false" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useSupabaseClient, useSupabaseUser } from '#imports'
import {
  Plus, X, CheckCircle, Trash2, ImagePlus, Droplets, ShoppingCart, Users, Bike,
  User, CreditCard, Ban, Clock, AlertCircle, AlertTriangle, Loader,
  DollarSign, Hash, Tag, Package, Truck, FileText, Banknote, Ruler
} from '@lucide/vue'
import Navbar from '~/components/userStandard/Navbar.vue'
import Sidebar from '~/components/userStandard/Sidebar.vue'
import { useSubscription } from '~/composables/useSubscription'

const client = useSupabaseClient()
const user = useSupabaseUser()
const { isExpired, nextPaymentDate, daysRemaining, checkSubscription } = useSubscription()

type GallonType = {
  id: string
  name: string
  size: number
  unit: string
  price: number
  image_url: string | null
  is_active: boolean
}

type Rider = { id: string; name: string; phone: string | null }
type TransactionType = 'regular' | 'reseller'
type PaymentStatus = 'paid' | 'unpaid' | 'partial'

const gallonTypes = ref<GallonType[]>([])
const riders = ref<Rider[]>([])
const selectedRiderId = ref<string | null>(null)
const selectedRiderName = ref('')
const walkInPrice = ref<number | null>(null)

const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const newName = ref('')
const newSize = ref<number | null>(null)
const newUnit = ref('gallon')
const newPrice = ref<number | null>(null)
const newImageFile = ref<File | null>(null)
const newImagePreview = ref<string | null>(null)

const showDeleteModal = ref(false)
const gallonToDelete = ref<GallonType | null>(null)
const showDispenseModal = ref(false)
const selectedGallon = ref<GallonType | null>(null)
const showTypeModal = ref(false)
const selectedType = ref<TransactionType | null>(null)
const resellerQty = ref<number | null>(null)
const resellerPrice = ref<number | null>(null)
const regularQty = ref<number>(1)
const paymentStatus = ref<PaymentStatus>('unpaid')
const partialAmount = ref<number | null>(null)
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const deletingId = ref<string | null>(null)

const isWalkIn = computed(() => selectedRiderId.value === null)

const actualPricePerPiece = computed(() => {
  if (!selectedGallon.value) return 0
  if (isWalkIn.value && walkInPrice.value && walkInPrice.value > 0) return walkInPrice.value
  return selectedGallon.value.price
})

const resellerTotal = computed(() => {
  if (!resellerQty.value || !resellerPrice.value) return 0
  return resellerQty.value * resellerPrice.value
})

const regularTotal = computed(() => {
  if (!selectedGallon.value) return 0
  return (regularQty.value || 1) * actualPricePerPiece.value
})

const totalAmount = computed(() =>
  selectedType.value === 'reseller' ? resellerTotal.value : regularTotal.value
)

const balanceDue = computed(() => {
  if (paymentStatus.value === 'paid') return 0
  if (paymentStatus.value === 'unpaid') return totalAmount.value
  return Math.max(0, totalAmount.value - (partialAmount.value || 0))
})

const amountPaidNow = computed(() => {
  if (paymentStatus.value === 'paid') return totalAmount.value
  if (paymentStatus.value === 'unpaid') return 0
  return partialAmount.value || 0
})

const setPaymentStatus = (status: PaymentStatus) => {
  paymentStatus.value = status
  if (status !== 'partial') partialAmount.value = null
}

const fetchRiders = async () => {
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return
  const { data } = await (client.from('delivery_riders') as any)
    .select('id, name, phone')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (data) riders.value = data
}

const fetchGallonTypes = async () => {
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return
  const { data } = await client
    .from('gallon_types')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .returns<GallonType[]>()
  if (data) gallonTypes.value = data
}

const handleImageSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  newImageFile.value = file
  newImagePreview.value = URL.createObjectURL(file)
}

const uploadImage = async (userId: string): Promise<string | null> => {
  if (!newImageFile.value) return null
  const ext = newImageFile.value.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await client.storage.from('gallon-images').upload(path, newImageFile.value)
  if (error) return null
  const { data } = client.storage.from('gallon-images').getPublicUrl(path)
  return data.publicUrl
}

const createGallonType = async () => {
  if (!newName.value || !newSize.value || !newPrice.value) {
    createError.value = 'Please fill in all required fields.'
    return
  }
  const duplicate = gallonTypes.value.some(
    g => g.name.toLowerCase() === newName.value.toLowerCase() &&
         g.size === newSize.value && g.unit === newUnit.value
  )
  if (duplicate) {
    createError.value = 'A gallon with this name, size and unit already exists.'
    return
  }
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return
  creating.value = true
  createError.value = ''
  const imageUrl = await uploadImage(userId)
  const { error } = await (client.from('gallon_types') as any).insert({
    user_id: userId, name: newName.value, size: newSize.value,
    unit: newUnit.value, price: newPrice.value, image_url: imageUrl,
  })
  if (error) { createError.value = error.message; creating.value = false; return }
  newName.value = ''; newSize.value = null; newUnit.value = 'gallon'
  newPrice.value = null; newImageFile.value = null; newImagePreview.value = null
  creating.value = false; showCreateModal.value = false
  await fetchGallonTypes()
}

const deleteGallonType = async (id: string) => {
  deletingId.value = id
  await (client.from('gallon_types') as any).update({ is_active: false }).eq('id', id)
  gallonTypes.value = gallonTypes.value.filter(g => g.id !== id)
  deletingId.value = null
}

const openDeleteModal = (gallon: GallonType) => { gallonToDelete.value = gallon; showDeleteModal.value = true }
const confirmDelete = async () => {
  if (!gallonToDelete.value) return
  await deleteGallonType(gallonToDelete.value.id)
  showDeleteModal.value = false; gallonToDelete.value = null
}

const resetDispenseState = () => {
  selectedGallon.value = null; selectedType.value = null
  selectedRiderId.value = null; selectedRiderName.value = ''
  resellerQty.value = null; resellerPrice.value = null
  regularQty.value = 1; walkInPrice.value = null
  paymentStatus.value = 'unpaid'; partialAmount.value = null; errorMsg.value = ''
}

const openDispense = (gallon: GallonType) => {
  if (isExpired.value) return
  resetDispenseState()
  selectedGallon.value = gallon; successMsg.value = ''
  showTypeModal.value = true
}

const selectType = (type: TransactionType) => {
  selectedType.value = type; showTypeModal.value = false; showDispenseModal.value = true
}

const closeDispenseModal = () => {
  showDispenseModal.value = false; showTypeModal.value = false; resetDispenseState()
}

const dispense = async () => {
  if (!selectedGallon.value || !selectedType.value) return
  errorMsg.value = ''
  if (selectedType.value === 'reseller') {
    if (!resellerQty.value || !resellerPrice.value) { errorMsg.value = 'Please fill in quantity and price.'; return }
  } else {
    if (!regularQty.value || regularQty.value < 1) { errorMsg.value = 'Please enter a valid quantity (minimum 1).'; return }
    if (isWalkIn.value && (!walkInPrice.value || walkInPrice.value < 1)) { errorMsg.value = 'Please enter the walk-in price per gallon.'; return }
  }
  if (paymentStatus.value === 'partial') {
    if (!partialAmount.value || partialAmount.value <= 0) { errorMsg.value = 'Please enter the partial payment amount.'; return }
    if (partialAmount.value >= totalAmount.value) { errorMsg.value = 'Partial payment must be less than the total. Use "Paid" instead.'; return }
  }
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return
  loading.value = true
  const isReseller = selectedType.value === 'reseller'
  const quantity = isReseller ? resellerQty.value! : regularQty.value
  const pricePerPiece = isReseller ? resellerPrice.value! : actualPricePerPiece.value
  const total = isReseller ? resellerTotal.value : regularTotal.value
  const dbPaymentStatus = paymentStatus.value === 'unpaid' ? 'utang' : paymentStatus.value
  const { error } = await client.from('transactions').insert([{
    user_id: userId,
    gallon_type: selectedGallon.value.name,
    gallon_type_id: selectedGallon.value.id,
    quantity, price_per_piece: pricePerPiece, total_amount: total,
    status: 'completed', transaction_type: selectedType.value,
    reseller_qty: isReseller ? resellerQty.value : null,
    reseller_price: isReseller ? resellerPrice.value : null,
    rider_id: selectedRiderId.value || null,
    rider_name: selectedRiderName.value || null,
    payment_status: dbPaymentStatus,
    amount_paid: amountPaidNow.value,
    balance_due: balanceDue.value,
    debtor_name: null, debtor_phone: null,
    paid_at: paymentStatus.value === 'paid' ? new Date().toISOString() : null,
  }] as any)
  if (error) { errorMsg.value = error.message; loading.value = false; return }
  const label = isReseller ? 'Reseller' : isWalkIn.value ? 'Walk-in' : 'Regular'
  const debtLabel = paymentStatus.value === 'unpaid'
    ? ` — UNPAID ₱${total.toFixed(2)}`
    : paymentStatus.value === 'partial'
      ? ` — Partial ₱${amountPaidNow.value.toFixed(2)} paid, ₱${balanceDue.value.toFixed(2)} utang`
      : ` — PAID ₱${total.toFixed(2)}`
  successMsg.value = `${label} dispense recorded!${debtLabel}`
  loading.value = false
  closeDispenseModal()
}

onMounted(async () => {
  await checkSubscription()
  await fetchGallonTypes()
  await fetchRiders()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: all 0.2s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.95); }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>