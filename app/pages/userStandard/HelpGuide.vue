<script lang="ts" setup>
definePageMeta({ middleware: ['auth'] })
import { ref } from 'vue'
import Navbar from '~/components/userStandard/Navbar.vue'
import Sidebar from '~/components/userStandard/Sidebar.vue'
import {
  LayoutDashboard, Droplets, TrendingUp, FileText, Receipt, Users,
  ChevronDown, HelpCircle, Lock, Image as ImageIcon, Rocket
} from '@lucide/vue'

type GuideStep = {
  title: string
  text: string
  image?: string // path under /images/help/... once you add screenshots
}

type GuideSection = {
  id: string
  label: string
  icon: any
  summary: string
  steps: GuideStep[]
}

const sections: GuideSection[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: Rocket,
    summary: 'New to HydrixSolution? Set things up in this order before your first sale.',
    steps: [
      {
        title: '1. Add your delivery riders first',
        text: 'Go to Workers or Riders and add each delivery rider before you start dispensing. Riders need to exist in the system before they can be assigned to a sale — if you skip this, you can still dispense, but you won\'t be able to track which rider handled which delivery until you add them.'
      },
      {
        title: '2. Set up gallon types and prices',
        text: 'On the Dispense page, open "Manage Gallon Types" (or the equivalent settings panel) to add the gallon sizes you sell (e.g. 1gal, 2.5gal, 5gal) and set a price for each. If you also sell to resellers at a different rate, set the reseller price here too. The Dispense page calculates every sale\'s total automatically based on what you configure here, so get this right before recording your first transaction.'
      },
      {
        title: '3. Confirm your subscription is active',
        text: 'Check the Subscription page to make sure your plan is active and see your next payment date. A banner will also appear on your Dashboard automatically if your subscription is expiring soon or has expired.'
      },
      {
        title: '4. Set up your security passcode',
        text: 'The first time you try to edit or delete a transaction, you\'ll be asked to create a 4-digit passcode (see the Workers / Riders section below for details). It\'s worth doing this early, before you have real transactions you might need to correct.'
      },
      {
        title: '5. You\'re ready — start dispensing',
        text: 'Once riders, gallon types, and prices are set up, head to Dispense to record your first sale. Everything else — Sales, Reports, Transactions, the Dashboard — fills in automatically from there.'
      }
    ]
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    summary: 'Your home screen — a quick snapshot of today\'s business at a glance.',
    steps: [
      {
        title: '1. Check your daily numbers',
        text: 'When you log in, the Dashboard shows Today\'s Collections, This Month\'s Collections, Total Collections, and your Total Transactions count. These update automatically as you dispense and collect payments — no need to refresh.'
      },
      {
        title: '2. Watch for subscription reminders',
        text: 'If your HydrixSolution subscription is close to expiring, a yellow banner appears at the top with the due date and a "Pay Now" button. If it has already expired, the banner turns red and asks you to contact admin to renew.'
      },
      {
        title: '3. Review recent activity',
        text: 'The Recent Transactions table at the bottom shows your last 5 sales — gallon type, quantity, total, how much has been collected, and payment status (Paid, Partial, or Utang). Tap "View All" to go to the full Transactions page.'
      }
    ]
  },
  {
    id: 'dispense',
    label: 'Dispense',
    icon: Droplets,
    summary: 'Record a new sale — every transaction starts here.',
    steps: [
      {
        title: '1. Set up gallon types and prices (first time only)',
        text: 'Before your first sale, open "Manage Gallon Types" on this page to add the sizes you sell and set a price for each — including a separate reseller price if you sell to retailers at a different rate. You only need to do this once, or whenever your prices change.'
      },
      {
        title: '2. Choose the gallon type and quantity',
        text: 'Select which gallon type the customer is buying gal base on your gallon type product and how many pieces. The total amount is calculated automatically based on the prices you set up above.'
      },
      {
        title: '3. Pick Regular or Reseller',
        text: 'Choose "Regular" for a normal walk-in or delivery customer, or "Reseller" if this sale is to a retailer/reseller buying at a different price.'
      },
      {
        title: '4. Assign a rider (optional)',
        text: 'If a delivery rider is handling this order, select them from the list. Riders must be added on the Workers/Riders page first before they\'ll appear here. Assigning a rider lets you track sales and collections per rider later on the Transactions page.'
      },
      {
        title: '5. Set the payment status',
        text: 'Mark the sale as Paid (fully collected now), Partial (some money collected, some still owed), or Utang (nothing collected yet — full amount owed). Partial and Utang sales can be paid off later from the Transactions page.'
      }
    ]
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: TrendingUp,
    summary: 'See how much money you\'ve actually collected, broken down by day, month, and year.',
    steps: [
      {
        title: '1. Collected vs. Uncollected',
        text: 'The Sales page splits your numbers into two groups: "Collected Sales (Paid)" — money that has actually come in — and "Uncollected Sales (Utang)" — money still owed by customers. This way you always know your real cash position, not just gross sales.'
      },
      {
        title: '2. Today, Yesterday, This Month, This Year',
        text: 'Each card shows collected money for that period. Important: money is counted on the day it was actually collected — so if a customer owed you money from a few days ago and pays today, that payment counts toward today\'s total, not the day of the original sale.'
      },
      {
        title: '3. Gallon Type Breakdown',
        text: 'Below the summary cards, see how many pieces of each gallon type have been sold and how much revenue each type has brought in.'
      }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    summary: 'A historical breakdown of your sales — daily, monthly, or yearly.',
    steps: [
      {
        title: '1. Switch between Daily, Monthly, and Yearly',
        text: 'Use the toggle at the top right to change how your sales are grouped. Daily shows your last 7 days, Monthly shows your last 12 months, and Yearly shows every year you\'ve had activity.'
      },
      {
        title: '2. Read the breakdown table',
        text: 'Each row shows a time period, how many gallons were sold, and the total sales collected for that period — the same "counted on the day collected" rule from the Sales page applies here too.'
      },
      {
        title: '3. Use it for planning',
        text: 'Reports are great for spotting your busiest days or slowest months, and for reviewing performance before deciding on pricing or staffing changes.'
      }
    ]
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: Receipt,
    summary: 'Every sale you\'ve ever made, with tools to manage payments and debts.',
    steps: [
      {
        title: '1. Filter by rider or date',
        text: 'Use the tabs at the top to view "All Transactions" or filter by a specific delivery rider. Use the date pickers to narrow down to a specific day or range — for example, June 20 to June 21.'
      },
      {
        title: '2. Read the summary cards',
        text: '"Total Revenue (Paid)" shows money collected within your selected date range. "Unpaid Utang" shows how much is still owed across the transactions shown. These two numbers always add up to give you the full picture for that period.'
      },
      {
        title: '3. Collect a payment',
        text: 'For any transaction marked Partial or Utang, tap the green "Pay" button to record a payment. You can pay the full remaining balance, a custom amount, or use the quick ₱50/₱100 shortcuts.'
      },
      {
        title: '4. Manage multiple debtors on one sale',
        text: 'If one delivery (like a reseller drop-off) is being split among several people who each owe a different amount, tap "Debtors" to assign names, gallons, and amounts to each person, and collect from them individually.'
      },
      {
        title: '5. Edit or delete a transaction',
        text: 'Tap the three-dot menu on any row to edit details or delete a mistaken entry. Since this can affect your records, you may be asked for your passcode first — see the Workers section below for how passcodes work.'
      }
    ]
  },
  {
    id: 'workers',
    label: 'Workers / Riders',
    icon: Users,
    summary: 'Manage your delivery riders, their pay, and protect sensitive actions with a passcode.',
    steps: [
      {
        title: '1. Add a rider — do this before using Dispense',
        text: 'Go to the Workers page to add a new delivery rider. Riders need to exist here first before they\'ll show up as a selectable option on the Dispense page or as a filter tab on the Transactions page — so it\'s worth adding your team before you start recording sales.'
      },
      {
        title: '2. Set up pay type and schedule',
        text: 'Choose how each worker is paid — fixed rate, per gallon delivered, or a fixed amount plus a percentage — and how often they\'re paid (daily, weekly, or kinsenas/twice-monthly).'
      },
      {
        title: '3. Track cash advances',
        text: 'If a worker takes a cash advance, record it here. It will automatically be deducted from their next computed pay, so you never lose track of what\'s owed.'
      },
      {
        title: '4. Set up your security passcode',
        text: 'The first time you try to edit or delete a transaction, you\'ll be asked to create a 4-digit passcode. Enter it once, then confirm it a second time to make sure it matches — this protects your records from accidental or unauthorized changes.',
        image: '/images/help/workers-passcode-setup.png'
      },
      {
        title: '5. Enter your passcode to confirm actions',
        text: 'After your passcode is set up, you\'ll be asked to enter it any time you try to edit or delete a transaction. If you forget it, use the "Forgot passcode" option to contact admin for a reset — for security, passcodes can\'t be recovered any other way.'
      }
    ]
  }
]

const openSection = ref<string | null>('getting-started')

const toggleSection = (id: string) => {
  openSection.value = openSection.value === id ? null : id
}
</script>

<template>
  <div class="min-h-screen w-full bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <div class="p-4 sm:p-8 space-y-6 w-full">
        <!-- Header -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
            <HelpCircle :size="24" class="text-green-600" />
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Help Guide</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-1">
              Step-by-step walkthroughs for every page in HydrixSolution
            </p>
          </div>
        </div>

        <!-- Quick nav chips -->
        <div class="relative">
          <div class="flex flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              v-for="s in sections"
              :key="'nav-' + s.id"
              @click="toggleSection(s.id)"
              :class="['flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border',
                openSection === s.id
                  ? 'bg-green-600 text-white border-green-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50']"
            >
              <component :is="s.icon" :size="14" />
              {{ s.label }}
            </button>
          </div>
          <!-- Fade hint signals there are more chips to scroll to on narrow
               screens, since scrollbar-hide removes the usual scrollbar cue. -->
          <div class="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-[#f5f7fb] to-transparent pointer-events-none sm:hidden"></div>
        </div>

        <!-- Accordion -->
        <div class="space-y-3">
          <div
            v-for="s in sections"
            :key="s.id"
            class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
          >
            <!-- Accordion header -->
            <button
              @click="toggleSection(s.id)"
              class="w-full flex items-center justify-between gap-3 px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer hover:bg-slate-50/60 transition"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <component :is="s.icon" :size="18" class="text-green-600" />
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-gray-700 text-sm sm:text-base">{{ s.label }}</p>
                  <p class="text-slate-500 text-xs sm:text-sm break-words sm:truncate">{{ s.summary }}</p>
                </div>
              </div>
              <ChevronDown
                :size="18"
                :class="['text-slate-400 shrink-0 transition-transform duration-200', openSection === s.id ? 'rotate-180' : '']"
              />
            </button>

            <!-- Accordion body -->
            <Transition name="accordion">
              <div v-if="openSection === s.id" class="px-5 sm:px-6 pb-5 sm:pb-6 space-y-5 border-t border-slate-100 pt-5">
                <div v-for="(step, idx) in s.steps" :key="idx" class="space-y-2">
                  <h4 class="font-semibold text-gray-700 text-sm">{{ step.title }}</h4>
                  <p class="text-slate-500 text-sm leading-relaxed">{{ step.text }}</p>

                  <!-- Screenshot slot: shows the real image once added under
                       /public/images/help/, otherwise shows a clean placeholder
                       so the page still looks intentional before screenshots
                       are wired in. -->
                  <div v-if="step.image" class="mt-2 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                    <img :src="step.image" :alt="step.title" class="w-full h-auto block" />
                  </div>
                  <div v-else class="mt-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 flex items-center justify-center gap-2 text-slate-300">
                    <ImageIcon :size="16" />
                    <span class="text-xs">Screenshot coming soon</span>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Footer note -->
        <div class="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
          <Lock :size="16" class="text-blue-500 mt-0.5 shrink-0" />
          <p class="text-xs sm:text-sm text-blue-700">
            Still stuck? Reach out through Chat Support and we'll walk you through it directly.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}
.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 2000px;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  scrollbar-width: none;
}
</style>