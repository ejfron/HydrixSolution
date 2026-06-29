<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0 pb-32 ">
      <Navbar />

      <div class="p-4 sm:p-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Transactions</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-1">All dispense records sorted by rider</p>
          </div>
          <button @click="fetchAll"
            class="flex items-center gap-2 px-4 py-2.5 border border-green-200 text-green-600 hover:bg-green-50 rounded-2xl text-sm font-semibold transition cursor-pointer">
            <RefreshCw :size="14" />
            Refresh
          </button>
        </div>

        <!-- Tabs + Date Filters -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
            <button @click="activeTab = 'all'"
              :class="['flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition cursor-pointer shrink-0',
                activeTab === 'all' ? 'bg-green-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50']">
              <LayoutGrid :size="14" /> All Transactions
              <span :class="['px-2 py-0.5 rounded-lg text-[11px] font-bold', activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600']">{{ getTabCount('all') }}</span>
            </button>
            <button v-for="rider in riders" :key="rider.id" @click="activeTab = rider.id"
              :class="['flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition cursor-pointer shrink-0',
                activeTab === rider.id ? 'bg-green-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50']">
              <Bike :size="14" /> {{ rider.name }}
              <span :class="['px-2 py-0.5 rounded-lg text-[11px] font-bold', activeTab === rider.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600']">{{ getTabCount(rider.id) }}</span>
            </button>
            <button v-if="transactions.some(t => !t.rider_id)" @click="activeTab = 'unassigned'"
              :class="['flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition cursor-pointer shrink-0',
                activeTab === 'unassigned' ? 'bg-slate-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50']">
              <UserX :size="14" /> No Rider
              <span :class="['px-2 py-0.5 rounded-lg text-[11px] font-bold', activeTab === 'unassigned' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600']">{{ getTabCount('unassigned') }}</span>
            </button>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <input v-model="startDate" type="date" class="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-600" />
            <span class="text-slate-400 text-sm">to</span>
            <input v-model="endDate" type="date" class="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-gray-900" />
            <button @click="() => { startDate = ''; endDate = '' }" class="px-3 text-gray-600 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-medium transition flex items-center gap-1">
              <X :size="14" /> Clear
            </button>
          </div>
        </div>

        <!-- Tab Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-white rounded-2xl border border-green-100 px-6 py-4">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle :size="16" class="text-green-600" />
              </div>
              <p class="text-xs text-slate-400 font-medium uppercase tracking-wide">
                {{ activeTab === 'all' ? 'Total Revenue (Paid)' : activeTab === 'unassigned' ? 'Unassigned Revenue (Paid)' : `${riders.find(r => r.id === activeTab)?.name}'s Revenue (Paid)` }}
              </p>
            </div>
            <p class="text-2xl font-black text-green-600 mt-1">{{ formatPeso(getTabPaidTotal(activeTab)) }}</p>
            <p class="text-xs text-slate-400 mt-1 flex items-center gap-1"><CheckCircle :size="12" /> {{ getTabPaidCount(activeTab) }} fully paid · counted on date collected</p>
          </div>
          <div :class="['rounded-2xl border px-6 py-4', getTabUnpaidTotal(activeTab) > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100']">
            <div class="flex items-center gap-2 mb-1">
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', getTabUnpaidTotal(activeTab) > 0 ? 'bg-red-100' : 'bg-slate-100']">
                <AlertCircle :size="16" :class="getTabUnpaidTotal(activeTab) > 0 ? 'text-red-600' : 'text-slate-400'" />
              </div>
              <p class="text-xs text-slate-400 font-medium uppercase tracking-wide">Unpaid Utang</p>
            </div>
            <p :class="['text-2xl font-black mt-1', getTabUnpaidTotal(activeTab) > 0 ? 'text-red-600' : 'text-slate-400']">{{ formatPeso(getTabUnpaidTotal(activeTab)) }}</p>
            <p class="text-xs text-slate-400 mt-1 flex items-center gap-1"><Ban :size="12" /> {{ getTabUnpaidCount(activeTab) }} transactions with debt</p>
          </div>
        </div>

        <!-- Overall Debt Alert -->
        <div v-if="getTabUnpaidTotal(activeTab) > 0" class="bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <AlertTriangle :size="20" class="text-red-500" />
              <div>
                <p class="text-sm font-semibold text-red-700">Outstanding Balance</p>
                <p class="text-xs text-red-500">These amounts are not yet collected and won't be counted in revenue</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-xs text-red-400">Total Utang</p>
                <p class="text-lg font-black text-red-600">{{ formatPeso(getTabUnpaidTotal(activeTab)) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-red-400">Debtors</p>
                <p class="text-lg font-black text-red-600">{{ getTabUnpaidCount(activeTab) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-16 text-slate-400 text-sm flex items-center justify-center gap-2">
          <Loader :size="16" class="animate-spin" /> Loading...
        </div>

        <!-- Empty -->
        <div v-else-if="filteredTransactions.length === 0" class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Inbox :size="28" class="text-slate-400" />
          </div>
          <p class="text-slate-400 text-sm">No transactions found for this filter.</p>
        </div>

        <!-- Transactions Display -->
        <div v-else>
          <!-- MOBILE CARD VIEW -->
          <div class="space-y-3 sm:hidden">
            <div v-for="tx in filteredTransactions" :key="tx.id"
              :class="['bg-white rounded-2xl border p-4 space-y-3 transition',
                tx.payment_status === 'utang' ? 'border-red-200 bg-red-50/30' : '',
                tx.payment_status === 'partial' ? 'border-yellow-200 bg-yellow-50/30' : 'border-slate-100']">
              
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Droplets :size="20" class="text-green-600" />
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">{{ tx.gallon_type }}</p>
                    <p class="text-xs text-slate-500">{{ tx.quantity }} gallons</p>
                  </div>
                </div>
                <button @click.stop="openActionModal(tx)" class="p-2 rounded-full hover:bg-gray-100">
                  <EllipsisVertical :size="18" class="text-gray-600" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <span :class="['px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 w-fit',
                  tx.transaction_type === 'reseller' ? 'bg-violet-100 text-violet-700' : 'bg-green-100 text-green-700']">
                  <component :is="tx.transaction_type === 'reseller' ? Users : User" :size="12" />
                  {{ tx.transaction_type === 'reseller' ? 'Reseller' : 'Regular' }}
                </span>
                <span class="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar :size="12" /> {{ formatDate(tx.created_at) }}
                </span>
              </div>

              <div class="border-t border-slate-100 pt-3">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="text-xs text-slate-500">Total Amount</p>
                    <p class="text-lg font-bold" :class="tx.payment_status === 'paid' ? 'text-green-600' : 'text-slate-700'">
                      {{ formatPeso(tx.total_amount) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-slate-500">Payment Status</p>
                    <span :class="['px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1',
                      tx.payment_status === 'paid' ? 'bg-green-100 text-green-700' : tx.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700']">
                      <component :is="tx.payment_status === 'paid' ? CheckCircle : tx.payment_status === 'partial' ? Clock : Ban" :size="12" />
                      {{ tx.payment_status === 'paid' ? 'Paid' : tx.payment_status === 'partial' ? 'Partial' : 'Utang' }}
                    </span>
                  </div>
                </div>

                <div v-if="tx.payment_status === 'partial'" class="mt-2">
                  <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="bg-yellow-500 h-2 rounded-full" :style="{ width: `${(Number(tx.amount_paid) / Number(tx.total_amount)) * 100}%` }"></div>
                  </div>
                  <p class="text-xs text-slate-500 mt-1">{{ formatPeso(tx.amount_paid) }} paid of {{ formatPeso(tx.total_amount) }}</p>
                </div>

                <div v-if="tx.payment_status !== 'paid'" class="mt-2 space-y-1">
                  <p class="text-xs text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle :size="11" /> Balance: {{ formatPeso(tx.balance_due) }}
                  </p>
                  <p v-if="tx.amount_paid > 0" class="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle :size="11" /> Collected: {{ formatPeso(tx.amount_paid) }}
                  </p>
                </div>
              </div>

              <div class="border-t border-slate-100 pt-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Bike :size="14" class="text-green-600" />
                    </div>
                    <div>
                      <p class="text-xs text-slate-500">Rider</p>
                      <p class="text-sm font-semibold text-slate-700">{{ tx.rider_name || '—' }}</p>
                    </div>
                  </div>
                  <button @click.stop="openDebtorsList(tx)" class="text-xs text-blue-600 hover:text-blue-800 underline">
                    View Debtors
                  </button>
                </div>
              </div>

              <div v-if="tx.payment_status === 'utang' || tx.payment_status === 'partial'" class="flex gap-2 pt-2">
                <button @click.stop="openDebtSetup(tx)"
                  class="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">
                  <Users :size="12" /> Debtors
                </button>
                <button @click.stop="openQuickPayModal(tx)"
                  class="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">
                  <Banknote :size="12" /> Pay Now
                </button>
              </div>
            </div>
          </div>

          <!-- DESKTOP TABLE VIEW -->
          <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hidden sm:block">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Gallon Type</th>
                    <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Type</th>
                    <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Qty</th>
                    <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total</th>
                    <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Rider</th>
                    <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Date</th>
                    <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Payment</th>
                    <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Debtors</th>
                    <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="tx in filteredTransactions" :key="tx.id" 
                    :class="['hover:bg-slate-50/50 transition',
                      tx.payment_status === 'utang' ? 'bg-red-50/30' : '',
                      tx.payment_status === 'partial' ? 'bg-yellow-50/30' : '']">
                    <td class="px-6 py-4 text-sm font-medium text-slate-700">{{ tx.gallon_type }}</td>
                    <td class="px-6 py-4">
                      <span :class="['px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 w-fit',
                        tx.transaction_type === 'reseller' ? 'bg-violet-100 text-violet-700' : 'bg-green-100 text-green-700']">
                        <component :is="tx.transaction_type === 'reseller' ? Users : User" :size="12" />
                        {{ tx.transaction_type === 'reseller' ? 'Reseller' : 'Regular' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ tx.quantity }}</td>
                    <td class="px-6 py-4">
                      <div>
                        <p class="text-sm font-bold" :class="tx.payment_status === 'paid' ? 'text-green-600' : 'text-slate-600'">
                          {{ formatPeso(tx.total_amount) }}
                        </p>
                        <div v-if="tx.payment_status === 'partial'" class="mt-1">
                          <div class="w-full bg-slate-200 rounded-full h-1.5">
                            <div class="bg-yellow-500 h-1.5 rounded-full" :style="{ width: `${(Number(tx.amount_paid) / Number(tx.total_amount)) * 100}%` }"></div>
                          </div>
                          <p class="text-xs text-slate-400 mt-0.5">{{ formatPeso(tx.amount_paid) }} / {{ formatPeso(tx.total_amount) }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span v-if="tx.rider_name" class="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <div class="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-black text-[10px]">{{ tx.rider_name.charAt(0) }}</div>
                        {{ tx.rider_name }}
                      </span>
                      <span v-else class="text-xs text-slate-300 flex items-center gap-1"><Minus :size="12" /> —</span>
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-400"><Calendar :size="12" class="inline mr-1" />{{ formatDate(tx.created_at) }}</td>
                    <td class="px-6 py-4">
                      <div class="space-y-1.5">
                        <span :class="['px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1',
                          tx.payment_status === 'paid' ? 'bg-green-100 text-green-700' : tx.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700']">
                          <component :is="tx.payment_status === 'paid' ? CheckCircle : tx.payment_status === 'partial' ? Clock : Ban" :size="12" />
                          {{ tx.payment_status === 'paid' ? 'Paid' : tx.payment_status === 'partial' ? 'Partial' : 'Utang' }}
                        </span>
                        <div v-if="tx.payment_status !== 'paid'" class="space-y-0.5">
                          <p class="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertCircle :size="11" /> Balance: {{ formatPeso(tx.balance_due) }}</p>
                          <p v-if="tx.amount_paid > 0" class="text-xs text-green-600 flex items-center gap-1"><CheckCircle :size="11" /> Collected: {{ formatPeso(tx.amount_paid) }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <button @click.stop="openDebtorsList(tx)" class="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1">
                        <Users :size="11" /> View Debtors
                      </button>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-1">
                        <button v-if="tx.payment_status === 'utang' || tx.payment_status === 'partial'"
                          @click.stop="openDebtSetup(tx)"
                          class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1">
                          <Users :size="12" /> Debtors
                        </button>
                        <button v-if="tx.payment_status === 'utang' || tx.payment_status === 'partial'"
                          @click.stop="openQuickPayModal(tx)"
                          class="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1">
                          <Banknote :size="12" /> Pay
                        </button>
                        <button @click.stop="openActionModal(tx)" class="text-gray-600 transition p-2 rounded-full hover:bg-gray-100">
                          <EllipsisVertical :size="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Choose Action Modal -->
    <ChooseEdit v-if="showActionModal" :is-open="showActionModal" :transaction="selectedTransaction" @close="showActionModal = false" @edit="requestEdit" @delete="requestDelete" />

    <!-- Edit Transaction Modal -->
    <EditTransactionModal v-if="showEditModal" :is-open="showEditModal" :transaction="selectedTransaction" :riders="riders" @close="showEditModal = false" @saved="onTransactionSaved" />

    <!-- DEBTOR SETUP MODAL -->
    <Transition name="fade">
      <div v-if="showDebtModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <Transition name="scale">
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 flex items-center justify-between shrink-0">
              <div>
                <h2 class="text-lg font-black text-white flex items-center gap-2"><Users :size="20" /> Manage Debtors</h2>
                <p class="text-blue-100 text-xs mt-0.5">Assign remaining balance to debtors</p>
              </div>
              <button @click="showDebtModal = false" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                <X :size="16" class="text-white" />
              </button>
            </div>

            <div class="p-5 space-y-4 overflow-y-auto flex-1">
              <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Total Amount</span>
                  <span class="font-semibold text-slate-700">{{ formatPeso(selectedDebtTx?.total_amount ?? 0) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Already Collected</span>
                  <span class="font-semibold text-green-600">{{ formatPeso(selectedDebtTx?.amount_paid ?? 0) }}</span>
                </div>
                <div class="flex justify-between text-sm border-t border-slate-200 pt-2">
                  <span class="font-bold text-slate-700">Remaining Balance</span>
                  <span class="font-bold text-red-600">{{ formatPeso(selectedDebtTx?.balance_due ?? 0) }}</span>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Users :size="14" class="text-slate-400" /> Assigned Debtors</label>
                  <span class="text-xs text-slate-400">{{ savedDebtors.length + allDebtors.length }} debtor(s)</span>
                </div>

                <div class="space-y-2 max-h-48 overflow-y-auto mb-3">
                  <div v-for="(debtor, idx) in savedDebtors" :key="'saved-'+idx" 
                    :class="['border rounded-xl p-3 transition', debtor.payment_status === 'paid' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-slate-300']">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <div :class="['w-7 h-7 rounded-full flex items-center justify-center', debtor.payment_status === 'paid' ? 'bg-green-100' : 'bg-blue-100']">
                          <User :size="12" :class="debtor.payment_status === 'paid' ? 'text-green-600' : 'text-blue-600'" />
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-slate-700">{{ debtor.debtor_name }}</p>
                          <p class="text-xs text-slate-400">{{ debtor.gallons }} gallons · {{ formatPeso(debtor.amount) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span :class="['px-2 py-0.5 rounded-lg text-[10px] font-bold', debtor.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                          {{ debtor.payment_status === 'paid' ? 'Paid' : 'Unpaid' }}
                        </span>
                        <button v-if="debtor.payment_status !== 'paid'" @click="removeSavedDebtor(idx)" class="text-red-400 hover:text-red-600 p-1"><X :size="14" /></button>
                      </div>
                    </div>
                    <button v-if="debtor.payment_status !== 'paid' && debtor.balance_due > 0"
                      @click="paySavedDebtor(idx)"
                      class="w-full py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1">
                      <Banknote :size="12" /> Pay ₱{{ formatPeso(debtor.balance_due) }}
                    </button>
                  </div>
                  
                  <div v-for="(debtor, idx) in allDebtors" :key="'new-'+idx" 
                    class="bg-white border border-amber-200 rounded-xl p-3 hover:border-amber-300 transition">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                          <User :size="12" class="text-amber-600" />
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-slate-700">{{ debtor.name }} <span class="text-[10px] text-amber-500 font-normal">(new)</span></p>
                          <p class="text-xs text-slate-400">{{ debtor.gallons }} gallons · {{ formatPeso(debtor.amount) }}</p>
                        </div>
                      </div>
                      <button @click="removeNewDebtor(idx)" class="text-red-400 hover:text-red-600 p-1"><X :size="14" /></button>
                    </div>
                    <button @click="payNewDebtor(idx)" 
                      class="w-full py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1">
                      <Banknote :size="12" /> Pay ₱{{ formatPeso(debtor.amount) }}
                    </button>
                  </div>

                  <div v-if="savedDebtors.length === 0 && allDebtors.length === 0" class="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <UserPlus :size="20" class="mx-auto text-slate-300 mb-1" />
                    <p class="text-xs text-slate-400">No debtors assigned yet</p>
                    <p class="text-xs text-slate-400">Add debtors to split the remaining balance</p>
                  </div>
                </div>

                <div v-if="savedDebtors.length > 0 || allDebtors.length > 0" class="bg-blue-50 rounded-xl px-3 py-2 border border-blue-100 text-xs mb-3">
                  <div class="flex justify-between">
                    <span class="text-slate-500">Total Unpaid Assigned</span>
                    <span class="font-bold text-blue-600">{{ formatPeso(totalUnpaidAssigned) }} / {{ formatPeso(selectedDebtTx?.balance_due ?? 0) }}</span>
                  </div>
                  <div v-if="remainingToAssign > 0" class="flex justify-between mt-1">
                    <span class="text-slate-500">Remaining to Assign</span>
                    <span class="font-bold text-green-600">{{ formatPeso(remainingToAssign) }}</span>
                  </div>
                </div>

                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p class="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1"><Plus :size="12" /> Add Debtor</p>
                  <div class="space-y-2">
                    <input v-model="newDebtorName" type="text" placeholder="Debtor name"
                      class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                    <div class="grid grid-cols-2 gap-2">
                      <input v-model.number="newDebtorGallons" type="number" min="1" placeholder="Gallons"
                        class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                      <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₱</span>
                        <input v-model.number="newDebtorAmount" type="number" min="1" :max="remainingToAssign" placeholder="Amount"
                          class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pl-6 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                      </div>
                    </div>
                    <p v-if="remainingToAssign > 0" class="text-xs text-slate-400">Max: {{ formatPeso(remainingToAssign) }}</p>
                    <p v-else-if="(selectedDebtTx?.balance_due ?? 0) > 0" class="text-xs text-red-400">All balance has been assigned</p>
                    <button @click="addNewDebtor" :disabled="!newDebtorName || !newDebtorGallons || !newDebtorAmount || remainingToAssign <= 0"
                      class="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1">
                      <Plus :size="14" /> Add Debtor
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><FileText :size="14" class="text-slate-400" /> Note (optional)</label>
                <input v-model="debtPayNote" type="text" placeholder="e.g. Debtor assignment"
                  class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
              </div>
            </div>

            <div class="p-5 pt-0 flex gap-3 shrink-0">
              <button @click="saveNewDebtors" :disabled="payingDebt || allDebtors.length === 0"
                class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2">
                <Loader v-if="payingDebt" :size="16" class="animate-spin" />
                <Save v-else :size="16" />
                {{ payingDebt ? 'Saving...' : 'Save New Debtors' }}
              </button>
              <button @click="showDebtModal = false"
                class="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-2xl font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2">
                <X :size="16" /> Close
              </button>
            </div>
          </div>
        </Transition>
        <div class="absolute inset-0 -z-10" @click="showDebtModal = false" />
      </div>
    </Transition>

    <!-- QUICK PAY MODAL -->
    <Transition name="fade">
      <div v-if="showQuickPayModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <Transition name="scale">
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-5 flex items-center justify-between shrink-0">
              <div>
                <h2 class="text-lg font-black text-white flex items-center gap-2"><Banknote :size="20" /> Quick Pay</h2>
                <p class="text-green-100 text-xs mt-0.5">{{ quickPayTx?.gallon_type }} — {{ quickPayTx?.quantity }} gallons</p>
              </div>
              <button @click="showQuickPayModal = false" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                <X :size="16" class="text-white" />
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Total Amount</span>
                  <span class="font-semibold text-slate-700">{{ formatPeso(quickPayTx?.total_amount ?? 0) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Already Collected</span>
                  <span class="font-semibold text-green-600">{{ formatPeso(quickPayTx?.amount_paid ?? 0) }}</span>
                </div>
                <div class="flex justify-between text-sm border-t border-slate-200 pt-2">
                  <span class="font-bold text-slate-700">Remaining Balance</span>
                  <span class="font-bold text-red-600">{{ formatPeso(quickPayTx?.balance_due ?? 0) }}</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Amount to Pay <span class="text-red-400">*</span></label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                  <input v-model.number="quickPayAmount" type="number" min="1" :max="quickPayTx?.balance_due"
                    class="w-full bg-gray-50 border-2 border-gray-200 focus:border-green-400 rounded-2xl px-4 py-3 pl-8 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-100 transition text-sm">
                </div>
                <div class="flex gap-2 mt-2">
                  <button @click="quickPayAmount = Number(quickPayTx?.balance_due)"
                    class="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold transition border border-green-200">
                    Pay Full ({{ formatPeso(quickPayTx?.balance_due ?? 0) }})
                  </button>
                  <button @click="quickPayAmount = Math.min(50, Number(quickPayTx?.balance_due ?? 0))"
                    class="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200">
                    ₱50
                  </button>
                  <button @click="quickPayAmount = Math.min(100, Number(quickPayTx?.balance_due ?? 0))"
                    class="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200">
                    ₱100
                  </button>
                </div>
                <div v-if="quickPayAmount && quickPayTx?.balance_due" class="mt-2 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100 text-xs">
                  <div class="flex justify-between">
                    <span class="text-slate-500">After this payment:</span>
                    <span :class="(quickPayTx.balance_due - quickPayAmount) <= 0 ? 'text-green-600 font-bold flex items-center gap-1' : 'text-blue-600 font-bold'">
                      <CheckCircle v-if="(quickPayTx.balance_due - quickPayAmount) <= 0" :size="12" />
                      {{ (quickPayTx.balance_due - quickPayAmount) <= 0 ? 'Fully Paid!' : `Balance: ${formatPeso(quickPayTx.balance_due - quickPayAmount)}` }}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <User :size="14" class="text-slate-400" /> Debtor Name (optional)
                </label>
                <input v-model="quickPayDebtorName" type="text" placeholder="e.g. Juan Dela Cruz"
                  class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent">
              </div>
            </div>
            <div class="p-5 pt-0 flex gap-3">
              <button @click="processQuickPay" :disabled="payingDebt || !quickPayAmount"
                class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2">
                <Loader v-if="payingDebt" :size="16" class="animate-spin" />
                <Banknote v-else :size="16" />
                {{ payingDebt ? 'Processing...' : 'Pay Now' }}
              </button>
              <button @click="showQuickPayModal = false"
                class="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-2xl font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2">
                <X :size="16" /> Cancel
              </button>
            </div>
          </div>
        </Transition>
        <div class="absolute inset-0 -z-10" @click="showQuickPayModal = false" />
      </div>
    </Transition>

    <!-- Debtors List Modal -->
    <Transition name="fade">
      <div v-if="showDebtorsListModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
        <Transition name="scale">
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col">
            <div class="bg-blue-600 px-6 py-5 flex items-center justify-between shrink-0">
              <h2 class="text-lg font-black text-white flex items-center gap-2"><Users :size="20" /> All Debtors</h2>
              <button @click="showDebtorsListModal = false" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                <X :size="16" class="text-white" />
              </button>
            </div>
            <div class="p-5 space-y-3 overflow-y-auto flex-1">
              <div v-if="debtorsListView.length === 0" class="text-center py-8 text-slate-400">
                <Users :size="32" class="mx-auto mb-2 opacity-50" />
                <p class="text-sm">No debtors found for this transaction</p>
              </div>
              <div v-for="(debtor, index) in debtorsListView" :key="index" class="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition">
                <div class="flex items-center justify-between mb-3">
                  <span class="font-semibold text-slate-800 flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><User :size="14" class="text-slate-500" /></div>
                    {{ debtor.debtor_name }}
                  </span>
                  <span :class="['px-2.5 py-1 rounded-lg text-[11px] font-bold',
                    debtor.payment_status === 'paid' ? 'bg-green-100 text-green-700' : debtor.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700']">
                    {{ debtor.payment_status === 'paid' ? 'Paid' : debtor.payment_status === 'partial' ? 'Partial' : 'Utang' }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div class="bg-slate-50 rounded-lg p-2"><p class="text-slate-400 mb-0.5">Gallons</p><p class="font-bold text-slate-700">{{ debtor.gallons }}</p></div>
                  <div class="bg-slate-50 rounded-lg p-2"><p class="text-slate-400 mb-0.5">Total Amount</p><p class="font-bold text-slate-700">{{ formatPeso(debtor.amount) }}</p></div>
                  <div class="bg-green-50 rounded-lg p-2"><p class="text-green-600 mb-0.5">Amount Paid</p><p class="font-bold text-green-700">{{ formatPeso(debtor.amount_paid) }}</p></div>
                  <div class="bg-red-50 rounded-lg p-2"><p class="text-red-500 mb-0.5">Balance Due</p><p class="font-bold text-red-600">{{ formatPeso(debtor.balance_due) }}</p></div>
                </div>
                <button v-if="debtor.payment_status !== 'paid' && debtor.balance_due > 0"
                  @click="payDebtorFromList(debtor)"
                  class="w-full mt-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1">
                  <Banknote :size="12" /> Pay ₱{{ formatPeso(debtor.balance_due) }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
        <div class="absolute inset-0 -z-10" @click="showDebtorsListModal = false" />
      </div>
    </Transition>

    <!-- Passcode Modals -->
    <PasscodeVerify :show="showActionPasscodeModal" @success="onPasscodeSuccess" @cancel="onPasscodeCancel" @forgot="onPasscodeForgot" />
    <PasscodeSetup :show="showSetupModal" @success="onSetupSuccess" @cancel="onSetupCancel" />

    <!-- Toast -->
    <div v-if="showToast"
      :class="['fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white text-sm transition-all z-50 flex items-center gap-2',
        toastType === 'success' ? 'bg-green-600' : 'bg-red-600']">
      <component :is="toastType === 'success' ? CheckCircle : AlertCircle" :size="16" />
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { computed, ref, nextTick, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { 
  RefreshCw, Bike, LayoutGrid, EllipsisVertical, X, CheckCircle, AlertCircle, 
  AlertTriangle, Ban, Clock, User, Users, UserX, Calendar, DollarSign, Droplets,
  Banknote, FileText, Loader, Hash, Inbox, Minus, Plus, UserPlus, Save
} from '@lucide/vue'
import Navbar from '~/components/userBasic/Navbar.vue'
import Sidebar from '~/components/userBasic/Sidebar.vue'
import ChooseEdit from '~/components/userBasic/ChooseEdit.vue'
import EditTransactionModal from '~/components/userBasic/EditTransactionModal.vue'
import PasscodeVerify from '~/components/userBasic/PasscodeVerify.vue'
import PasscodeSetup from '~/components/userBasic/PasscodeSetup.vue'
import { useRoute } from '#app'

const client = useSupabaseClient() as any
const user = useSupabaseUser()
const route = useRoute()
const startDate = ref('')
const endDate = ref('')

const plan = computed(() =>
{
  if (route.path.startsWith('/userPremium')) return 'premium'
  if (route.path.startsWith('/userStandard')) return 'standard'
  return 'basic'
})

const {
  isAuthenticated,
  showPasscodeModal: globalShowPasscodeModal,
  showSetupModal,
  hasPasscode,
  setupPasscode,
  verifyPasscode,
  resetAuth,
  checkSession
} = useWorkersPasscode(plan.value)

const showActionPasscodeModal = ref(false)
let pendingAction: 'edit' | 'delete' | null = null
let pendingTransaction: Transaction | null = null

type Transaction = {
  id: string
  gallon_type: string
  quantity: number
  price_per_piece: number
  total_amount: number
  amount_paid: number
  balance_due: number
  payment_status: string
  debtor_name: string | null
  debtor_phone: string | null
  status: string
  transaction_type: string
  reseller_qty: number | null
  reseller_price: number | null
  rider_id: string | null
  rider_name: string | null
  created_at: string
  paid_at: string | null
}

type Rider = {
  id: string
  name: string
}

type DebtPayment = {
  id: string
  transaction_id: string
  amount_paid: number
  paid_at: string
  note: string | null
}

interface NewDebtorEntry {
  name: string
  gallons: number
  amount: number
}

const transactions = ref<Transaction[]>([])
const debtPayments = ref<DebtPayment[]>([])
const riders = ref<Rider[]>([])
const loading = ref(true)
const activeTab = ref<string>('all')
const showActionModal = ref(false)
const showEditModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const deletingId = ref<string | null>(null)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const showDebtModal = ref(false)
const selectedDebtTx = ref<Transaction | null>(null)
const debtPayNote = ref('')
const payingDebt = ref(false)

const showQuickPayModal = ref(false)
const quickPayTx = ref<Transaction | null>(null)
const quickPayAmount = ref<number | null>(null)
const quickPayDebtorName = ref('')

const showDebtorsListModal = ref(false)
const debtorsListView = ref<any[]>([])
const savedDebtors = ref<any[]>([])
const allDebtors = ref<NewDebtorEntry[]>([])
const newDebtorName = ref('')
const newDebtorGallons = ref<number | null>(null)
const newDebtorAmount = ref<number | null>(null)

const totalUnpaidAssigned = computed(() =>
{
  const saved = savedDebtors.value
    .filter(d => d.payment_status !== 'paid')
    .reduce((s, d) => s + Number(d.balance_due || d.amount), 0)
  const newD = allDebtors.value.reduce((s, d) => s + d.amount, 0)
  return saved + newD
})

const remainingToAssign = computed(() =>
{
  return Math.max(0, (selectedDebtTx.value?.balance_due ?? 0) - totalUnpaidAssigned.value)
})

const addNewDebtor = () =>
{
  if (!newDebtorName.value || !newDebtorGallons.value || !newDebtorAmount.value) return
  if (newDebtorAmount.value > remainingToAssign.value)
  {
    showToastMessage(`Amount exceeds remaining (${formatPeso(remainingToAssign.value)})`, 'error')
    return
  }
  allDebtors.value.push({
    name: newDebtorName.value.trim(),
    gallons: newDebtorGallons.value,
    amount: newDebtorAmount.value
  })
  newDebtorName.value = ''
  newDebtorGallons.value = null
  newDebtorAmount.value = null
}

const removeNewDebtor = (index: number) =>
{
  allDebtors.value.splice(index, 1)
}

const removeSavedDebtor = async (index: number) =>
{
  const debtor = savedDebtors.value[index]
  if (!debtor) return
  try
  {
    await client.from('debtor_details').delete().eq('id', debtor.id)
    savedDebtors.value.splice(index, 1)
    showToastMessage('Debtor removed', 'success')
  }
  catch (err: any)
  {
    showToastMessage('Failed to remove debtor', 'error')
  }
}

const getUserId = async () =>
{
  const { data: { session } } = await client.auth.getSession()
  return user.value?.id ?? session?.user?.id
}

const fetchAll = async () =>
{
  loading.value = true
  const userId = await getUserId()
  if (!userId)
  {
    loading.value = false
    return
  }
  const { data: txData } = await client
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (txData) transactions.value = txData as Transaction[]
  const { data: dpData } = await client
    .from('debt_payments')
    .select('*')
    .eq('user_id', userId)
    .order('paid_at', { ascending: false })
  if (dpData) debtPayments.value = dpData as DebtPayment[]
  const { data: riderData } = await client
    .from('delivery_riders')
    .select('id, name')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (riderData) riders.value = riderData as Rider[]
  loading.value = false
}

const showToastMessage = (message: string, type: 'success' | 'error') =>
{
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => (showToast.value = false), 3000)
}

const performDelete = async (id: string) =>
{
  deletingId.value = id
  try
  {
    const userId = await getUserId()
    if (!userId) throw new Error('Not authenticated')
    const { error } = await client.from('transactions').delete().eq('id', id).eq('user_id', userId)
    if (error) throw new Error(error.message)
    transactions.value = transactions.value.filter(t => t.id !== id)
    showToastMessage('Transaction deleted', 'success')
  }
  catch (err: any)
  {
    showToastMessage(err.message || 'Failed to delete', 'error')
  }
  finally
  {
    deletingId.value = null
  }
}

const openEditModal = (transaction: Transaction) =>
{
  showActionModal.value = false
  selectedTransaction.value = transaction
  nextTick(() =>
  {
    showEditModal.value = true
  })
}

const requestEdit = (transaction: any) =>
{
  pendingAction = 'edit'
  pendingTransaction = transaction as Transaction
  showActionModal.value = false
  if (hasPasscode.value)
  {
    showActionPasscodeModal.value = true
  }
  else
  {
    showSetupModal.value = true
  }
}

const requestDelete = (transactionId: string) =>
{
  pendingAction = 'delete'
  pendingTransaction = transactions.value.find(t => t.id === transactionId) ?? selectedTransaction.value
  showActionModal.value = false
  if (hasPasscode.value)
  {
    showActionPasscodeModal.value = true
  }
  else
  {
    showSetupModal.value = true
  }
}

const onPasscodeSuccess = (enteredPasscode: string) =>
{
  if (verifyPasscode(enteredPasscode))
  {
    showActionPasscodeModal.value = false
    if (pendingAction === 'edit' && pendingTransaction)
    {
      openEditModal(pendingTransaction)
    }
    else if (pendingAction === 'delete' && pendingTransaction)
    {
      performDelete(pendingTransaction.id)
    }
    pendingAction = null
    pendingTransaction = null
  }
  else
  {
    showToastMessage('Incorrect passcode', 'error')
  }
}

const onPasscodeCancel = () =>
{
  showActionPasscodeModal.value = false
  pendingAction = null
  pendingTransaction = null
}

const onPasscodeForgot = () =>
{
  showActionPasscodeModal.value = false
  showToastMessage('Please contact admin to reset passcode', 'error')
}

const onSetupSuccess = (newPasscode: string) =>
{
  if (setupPasscode(newPasscode))
  {
    showSetupModal.value = false
    if (pendingAction)
    {
      showActionPasscodeModal.value = true
    }
    showToastMessage('Passcode created! Please verify to continue.', 'success')
  }
}

const onSetupCancel = () =>
{
  showSetupModal.value = false
  pendingAction = null
  pendingTransaction = null
}

const onTransactionSaved = (updatedTx: any) =>
{
  transactions.value = transactions.value.map(t =>
    t.id === updatedTx.id ? { ...t, ...updatedTx } : t
  )
  showEditModal.value = false
  showToastMessage('Transaction updated successfully', 'success')
  fetchAll()
}

const openDebtSetup = async (tx: Transaction) =>
{
  selectedDebtTx.value = tx
  debtPayNote.value = ''
  allDebtors.value = []
  newDebtorName.value = ''
  newDebtorGallons.value = null
  newDebtorAmount.value = null
  try
  {
    const { data } = await client
      .from('debtor_details')
      .select('*')
      .eq('transaction_id', tx.id)
      .order('created_at', { ascending: true })
    savedDebtors.value = data || []
  }
  catch (err)
  {
    savedDebtors.value = []
  }
  showDebtModal.value = true
}

const saveNewDebtors = async () =>
{
  if (!selectedDebtTx.value || allDebtors.value.length === 0) return
  payingDebt.value = true
  try
  {
    const userId = await getUserId()
    if (!userId) throw new Error('Not authenticated')
    const tx = selectedDebtTx.value
    for (const debtor of allDebtors.value)
    {
      await client.from('debtor_details').insert({
        transaction_id: tx.id,
        user_id: userId,
        debtor_name: debtor.name,
        amount: debtor.amount,
        gallons: debtor.gallons,
        amount_paid: 0,
        balance_due: debtor.amount,
        payment_status: 'utang',
        note: debtPayNote.value || null
      })
    }
    const { data } = await client
      .from('debtor_details')
      .select('*')
      .eq('transaction_id', tx.id)
      .order('created_at', { ascending: true })
    savedDebtors.value = data || []
    allDebtors.value = []
    payingDebt.value = false
    showToastMessage('Debtors saved successfully!', 'success')
  }
  catch (err: any)
  {
    payingDebt.value = false
    showToastMessage(err.message || 'Failed to save debtors', 'error')
  }
}

const paySavedDebtor = async (index: number) =>
{
  const debtor = savedDebtors.value[index]
  if (!debtor || !selectedDebtTx.value) return
  await processDebtorPayment(debtor.id, debtor.debtor_name, Number(debtor.balance_due), Number(debtor.amount))
}

const payNewDebtor = async (index: number) =>
{
  const debtor = allDebtors.value[index]
  if (!debtor || !selectedDebtTx.value) return
  payingDebt.value = true
  try
  {
    const userId = await getUserId()
    if (!userId) throw new Error('Not authenticated')
    const tx = selectedDebtTx.value
    await client.from('debtor_details').insert({
      transaction_id: tx.id,
      user_id: userId,
      debtor_name: debtor.name,
      amount: debtor.amount,
      gallons: debtor.gallons,
      amount_paid: debtor.amount,
      balance_due: 0,
      payment_status: 'paid',
      note: 'Paid immediately'
    })
    const newAmountPaid = Number(tx.amount_paid) + debtor.amount
    const newBalance = Math.max(0, Number(tx.total_amount) - newAmountPaid)
    const newStatus = newBalance <= 0 ? 'paid' : 'partial'
    const { data: dpInserted } = await client.from('debt_payments').insert({
      transaction_id: tx.id,
      user_id: userId,
      amount_paid: debtor.amount,
      note: `Payment for ${debtor.name}`,
      paid_at: new Date().toISOString()
    }).select().single()
    if (dpInserted) debtPayments.value = [dpInserted as DebtPayment, ...debtPayments.value]
    await client.from('transactions').update({
      amount_paid: newAmountPaid,
      balance_due: newBalance,
      payment_status: newStatus,
      paid_at: newBalance <= 0 ? new Date().toISOString() : tx.paid_at
    }).eq('id', tx.id).eq('user_id', userId)
    allDebtors.value.splice(index, 1)
    const { data } = await client
      .from('debtor_details')
      .select('*')
      .eq('transaction_id', tx.id)
      .order('created_at', { ascending: true })
    savedDebtors.value = data || []
    transactions.value = transactions.value.map(t =>
      t.id === tx.id
        ? { ...t, amount_paid: newAmountPaid, balance_due: newBalance, payment_status: newStatus }
        : t
    )
    selectedDebtTx.value = {
      ...selectedDebtTx.value,
      amount_paid: newAmountPaid,
      balance_due: newBalance,
      payment_status: newStatus
    }
    payingDebt.value = false
    showToastMessage(`₱${formatPeso(debtor.amount)} paid for ${debtor.name}!`, 'success')
  }
  catch (err: any)
  {
    payingDebt.value = false
    showToastMessage(err.message || 'Failed to process payment', 'error')
  }
}

const processDebtorPayment = async (debtorId: string, debtorName: string, payAmount: number, totalAmount: number) =>
{
  if (!selectedDebtTx.value || payAmount <= 0) return
  payingDebt.value = true
  try
  {
    const userId = await getUserId()
    if (!userId) throw new Error('Not authenticated')
    const tx = selectedDebtTx.value
    const newAmountPaid = Number(tx.amount_paid) + payAmount
    const newBalance = Math.max(0, Number(tx.total_amount) - newAmountPaid)
    const newStatus = newBalance <= 0 ? 'paid' : 'partial'
    await client.from('debtor_details').update({
      amount_paid: payAmount,
      balance_due: 0,
      payment_status: 'paid'
    }).eq('id', debtorId)
    const { data: dpInserted } = await client.from('debt_payments').insert({
      transaction_id: tx.id,
      user_id: userId,
      amount_paid: payAmount,
      note: `Payment for ${debtorName}`,
      paid_at: new Date().toISOString()
    }).select().single()
    if (dpInserted) debtPayments.value = [dpInserted as DebtPayment, ...debtPayments.value]
    await client.from('transactions').update({
      amount_paid: newAmountPaid,
      balance_due: newBalance,
      payment_status: newStatus,
      paid_at: newBalance <= 0 ? new Date().toISOString() : tx.paid_at
    }).eq('id', tx.id).eq('user_id', userId)
    const { data } = await client
      .from('debtor_details')
      .select('*')
      .eq('transaction_id', tx.id)
      .order('created_at', { ascending: true })
    savedDebtors.value = data || []
    transactions.value = transactions.value.map(t =>
      t.id === tx.id
        ? { ...t, amount_paid: newAmountPaid, balance_due: newBalance, payment_status: newStatus }
        : t
    )
    selectedDebtTx.value = {
      ...selectedDebtTx.value,
      amount_paid: newAmountPaid,
      balance_due: newBalance,
      payment_status: newStatus
    }
    payingDebt.value = false
    showToastMessage(`₱${formatPeso(payAmount)} paid for ${debtorName}!`, 'success')
  }
  catch (err: any)
  {
    payingDebt.value = false
    showToastMessage(err.message || 'Failed to process payment', 'error')
  }
}

const payDebtorFromList = async (debtor: any) =>
{
  if (!debtor || debtor.balance_due <= 0) return
  const { data: txData } = await client
    .from('transactions')
    .select('*')
    .eq('id', debtor.transaction_id)
    .single()
  if (!txData) return
  selectedDebtTx.value = txData as Transaction
  await processDebtorPayment(debtor.id, debtor.debtor_name, Number(debtor.balance_due), Number(debtor.amount))
  await openDebtorsList(txData as Transaction)
}

const openQuickPayModal = (tx: Transaction) =>
{
  quickPayTx.value = tx
  quickPayAmount.value = Number(tx.balance_due)
  quickPayDebtorName.value = tx.debtor_name || ''
  showQuickPayModal.value = true
}

const processQuickPay = async () =>
{
  if (!quickPayTx.value || !quickPayAmount.value || quickPayAmount.value <= 0) return
  
  payingDebt.value = true
  
  try
  {
    const userId = await getUserId()
    if (!userId) throw new Error('Not authenticated')
    
    const tx = quickPayTx.value
    const payAmount = Number(quickPayAmount.value)
    const newAmountPaid = Number(tx.amount_paid) + payAmount
    const newBalance = Math.max(0, Number(tx.total_amount) - newAmountPaid)
    const newStatus = newBalance <= 0 ? 'paid' : 'partial'
    const isNowFullyPaid = newBalance <= 0
    
    const debtorName = quickPayDebtorName.value.trim() || tx.debtor_name || 'Customer'
    const debtorGallons = tx.quantity || 1
    
    await client.from('debtor_details').insert({
      transaction_id: tx.id,
      user_id: userId,
      debtor_name: debtorName,
      amount: payAmount,
      gallons: debtorGallons,
      amount_paid: payAmount,
      balance_due: 0,
      payment_status: 'paid',
      note: 'Quick payment'
    })
    
    const { data: dpInserted } = await client.from('debt_payments').insert({
      transaction_id: tx.id,
      user_id: userId,
      amount_paid: payAmount,
      note: 'Quick payment',
      paid_at: new Date().toISOString()
    }).select().single()
    if (dpInserted) debtPayments.value = [dpInserted as DebtPayment, ...debtPayments.value]
    
    await client.from('transactions').update({
      amount_paid: newAmountPaid,
      balance_due: newBalance,
      payment_status: newStatus,
      paid_at: isNowFullyPaid ? new Date().toISOString() : tx.paid_at
    }).eq('id', tx.id).eq('user_id', userId)
    
    transactions.value = transactions.value.map(t =>
      t.id === tx.id
        ? { ...t, amount_paid: newAmountPaid, balance_due: newBalance, payment_status: newStatus, paid_at: isNowFullyPaid ? new Date().toISOString() : t.paid_at }
        : t
    )
    
    showQuickPayModal.value = false
    payingDebt.value = false
    showToastMessage(`₱${formatPeso(payAmount)} paid${isNowFullyPaid ? '! Transaction fully paid.' : `! ${formatPeso(newBalance)} remaining.`}`, 'success')
  }
  catch (err: any)
  {
    payingDebt.value = false
    showToastMessage(err.message || 'Failed to process payment', 'error')
  }
}

const openDebtorsList = async (tx: Transaction) =>
{
  try
  {
    const { data } = await client
      .from('debtor_details')
      .select('*')
      .eq('transaction_id', tx.id)
      .order('created_at', { ascending: true })
    debtorsListView.value = data || []
    showDebtorsListModal.value = true
  }
  catch (err)
  {
    console.error('Failed to fetch debtors:', err)
  }
}

const openActionModal = (tx: Transaction) =>
{
  selectedTransaction.value = tx
  showActionModal.value = true
}

// Philippines is UTC+8 with no DST. The <input type="date"> values
// (e.g. "2026-06-21") have no timezone info, and naive `new Date("2026-06-21")`
// + setHours(...) anchors to the BROWSER/SERVER's local timezone — which may
// not be Philippine time. That mismatch causes payments made in the early
// Philippine morning to appear to "belong" to the previous UTC day, or vice
// versa, even though to the person in Manila they clearly happened today.
// These helpers explicitly compute the UTC instant that corresponds to
// midnight and end-of-day in Philippine time (UTC+8), so the date filter
// means what the calendar picker shows regardless of server/browser TZ.
const PH_OFFSET_MS = 8 * 60 * 60 * 1000

const phDayStartUTC = (dateStr: string) =>
{
  // "2026-06-21" -> 2026-06-21T00:00:00 PH time -> equivalent UTC instant
  const parts = dateStr.split('-')
  const y = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 1)
  const d = Number(parts[2] ?? 1)
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0) - PH_OFFSET_MS)
}

const phDayEndUTC = (dateStr: string) =>
{
  // "2026-06-21" -> 2026-06-21T23:59:59.999 PH time -> equivalent UTC instant
  const parts = dateStr.split('-')
  const y = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 1)
  const d = Number(parts[2] ?? 1)
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - PH_OFFSET_MS)
}

const filteredTransactions = computed(() =>
{
  const tabTxs = getTabTransactions(activeTab.value)
  return applyDateFilter(tabTxs)
})

const applyDateFilter = (list: Transaction[]) =>
{
  let filtered = [...list]
  if (startDate.value)
  {
    const start = phDayStartUTC(startDate.value)
    filtered = filtered.filter(t => new Date(t.created_at) >= start)
  }
  if (endDate.value)
  {
    const end = phDayEndUTC(endDate.value)
    filtered = filtered.filter(t => new Date(t.created_at) <= end)
  }
  return filtered
}

const getTabTransactions = (tabId: string) =>
{
  if (tabId === 'all') return transactions.value
  if (tabId === 'unassigned') return transactions.value.filter(t => !t.rider_id)
  return transactions.value.filter(t => t.rider_id === tabId)
}

// Returns the set of transaction ids belonging to a tab (rider/unassigned/all),
// used to scope debt_payments rows to the right tab via their transaction_id.
const getTabTransactionIds = (tabId: string) =>
{
  return new Set(getTabTransactions(tabId).map(t => t.id))
}

// Revenue is counted on the date the MONEY WAS COLLECTED (debt_payments.paid_at),
// not the date the transaction was created. Every peso ever collected — whether
// paid in full immediately at dispense, or paid off later as a utang/partial
// top-up — has exactly one debt_payments row dated by when it actually came in.
// This means: if a June 20 sale leaves ₱300 utang, and that ₱300 gets paid on
// June 21, it counts toward June 21's revenue, not June 20's — exactly matching
// real cash-flow / "sales for today" accounting. Dates are compared using
// Philippine time (see phDayStartUTC/phDayEndUTC above) so "June 21" in the
// filter always means June 21 in Manila, not June 21 in UTC or server time.
const applyDateFilterToPayments = (list: DebtPayment[]) =>
{
  let filtered = [...list]
  if (startDate.value)
  {
    const start = phDayStartUTC(startDate.value)
    filtered = filtered.filter(p => new Date(p.paid_at) >= start)
  }
  if (endDate.value)
  {
    const end = phDayEndUTC(endDate.value)
    filtered = filtered.filter(p => new Date(p.paid_at) <= end)
  }
  return filtered
}

const getTabPayments = (tabId: string) =>
{
  const ids = getTabTransactionIds(tabId)
  return debtPayments.value.filter(p => ids.has(p.transaction_id))
}

// Date-filtered collected revenue — respects startDate/endDate so picking a
// range (e.g. June 20, 2026 to June 21, 2026) shows only money actually
// collected within that window, regardless of which day the original sale
// happened on.
const getTabPaidTotal = (tabId: string) =>
{
  const payments = applyDateFilterToPayments(getTabPayments(tabId))
  return payments.reduce((s, p) => s + Number(p.amount_paid), 0)
}

// Number of distinct transactions that became fully 'paid' and had at least
// one collection event within the selected date range.
const getTabPaidCount = (tabId: string) =>
{
  const ids = getTabTransactionIds(tabId)
  const payments = applyDateFilterToPayments(getTabPayments(tabId))
  const paidTxIds = new Set(
    transactions.value
      .filter(t => ids.has(t.id) && t.payment_status === 'paid')
      .map(t => t.id)
  )
  const txIdsWithPaymentInRange = new Set(payments.map(p => p.transaction_id))
  let count = 0
  paidTxIds.forEach(id => { if (txIdsWithPaymentInRange.has(id)) count++ })
  return count
}

// All-time collected revenue — same ledger logic, ignoring the date filter so
// it always reflects every peso ever collected, old to new.
const getTabPaidTotalAllTime = (tabId: string) =>
{
  const payments = getTabPayments(tabId)
  return payments.reduce((s, p) => s + Number(p.amount_paid), 0)
}

const getTabPaidCountAllTime = (tabId: string) =>
{
  const ids = getTabTransactionIds(tabId)
  return transactions.value.filter(t => ids.has(t.id) && t.payment_status === 'paid').length
}

const getTabUnpaidTotal = (tabId: string) =>
{
  const txs = applyDateFilter(getTabTransactions(tabId))
  return txs
    .filter(t => t.payment_status === 'utang' || t.payment_status === 'partial')
    .reduce((s, t) => s + Number(t.balance_due), 0)
}

const getTabUnpaidCount = (tabId: string) =>
{
  const txs = applyDateFilter(getTabTransactions(tabId))
  return txs.filter(t => t.payment_status === 'utang' || t.payment_status === 'partial').length
}

const getTabTotal = (tabId: string) =>
{
  const txs = applyDateFilter(getTabTransactions(tabId))
  return txs.reduce((s, t) => s + Number(t.total_amount), 0)
}

const getTabCount = (tabId: string) =>
{
  return applyDateFilter(getTabTransactions(tabId)).length
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Manila'
  })

const formatPeso = (n: number) =>
  `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

const totalUnpaidDebt = computed(() =>
  transactions.value
    .filter(t => t.payment_status === 'utang' || t.payment_status === 'partial')
    .reduce((s, t) => s + Number(t.balance_due), 0)
)

onMounted(() =>
{
  fetchAll()
  checkSession()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>