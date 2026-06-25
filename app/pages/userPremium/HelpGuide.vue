<script lang="ts" setup>
definePageMeta({ middleware: ['auth'] })
import { ref } from 'vue'
import Navbar from '~/components/userPremium/Navbar.vue'
import Sidebar from '~/components/userPremium/Sidebar.vue'
import {
  LayoutDashboard, Droplets, TrendingUp, FileText, Receipt, Users, Bike,
  ChevronDown, HelpCircle, Lock, Image as ImageIcon, Rocket
} from '@lucide/vue'

type GuideStep = {
  title: string
  text: string
  image?: string // filename only, e.g. 'riders-01-empty-state.png' — resolved
                  // via the glob below since these live under app/assets and
                  // go through Vite's asset pipeline rather than /public.
}

// Images live directly in app/assets/images/ (no help/ subfolder). Since
// assets are processed by Vite (not served as static files the way /public
// is), a plain string path like '/images/foo.png' won't resolve. import.meta.glob
// with `eager: true` and `import: 'default'` pre-resolves every matching file
// at build time into a { '/full/path/foo.png': 'resolved-url' } map, which we
// then look up by filename in resolveHelpImage() below.
const helpImageModules = import.meta.glob('~/assets/images/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const resolveHelpImage = (filename: string): string | undefined => {
  const match = Object.keys(helpImageModules).find(path => path.endsWith('/' + filename))
  return match ? helpImageModules[match] : undefined
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
    summary: 'New to HydrixSolution? Here is the order things naturally come together.',
    steps: [
      {
        title: '1. Add your delivery riders',
        text: 'Go to Riders and tap "Add First Rider" (or "+ Add Rider" once you have at least one). You only need a name — phone number is optional. Riders you add here become selectable on the Dispense page and as filter tabs on Transactions.',
        image: 'riders-01-empty-state.png'
      },
      {
        title: '2. Add your workers',
        text: 'Go to Workers and tap "Add First Worker". Fill in their name, choose a Pay Type (Fixed Daily, Per Gallon, or Fixed + % Bonus), set the rate, and pick a Pay Schedule (Weekly, Kinsenas, or Daily). The Salary Preview updates live as you fill the form in, so you can confirm the numbers before saving.',
        image: 'workers-05-add-worker-fixed.png'
      },
      {
        title: '3. Set up your Workers passcode',
        text: 'The first time you open Workers, you\'ll be asked to set up a 4-digit passcode to protect that section. Enter a passcode, then confirm it a second time. After that, you\'ll need this passcode every time you return to Workers.',
        image: 'workers-02-passcode-required.png'
      },
      {
        title: '4. Confirm your subscription',
        text: 'Check the Subscription page to see your plan, setup fee status, and next payment due date. A reminder banner will also appear automatically on your Dashboard if a payment is coming up or overdue.',
        image: 'subscription-01-active.png'
      },
      {
        title: '5. Set up your gallon types',
        text: 'Go to Dispense and tap "Create First Gallon" to add the products you sell — name, size, unit, and regular price. You\'ll do this once per gallon type, and each one becomes a card you can dispense from.',
        image: 'dispense-02-create-gallon-modal.png'
      },
      {
        title: '6. You\'re ready — start dispensing',
        text: 'With riders, workers, and gallon types in place, tap "Dispense" on any gallon card to record your first sale. Sales, Transactions, Reports, and the Dashboard all fill in automatically from there.'
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
        text: 'When you log in, the Dashboard shows Today\'s Collections, This Month\'s Collections, Total Collections, and your Total Transactions count. These update automatically as you dispense and collect payments — no need to refresh.',
        image: 'dashboard-01-overview.png'
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
    summary: 'Set up your gallon types here, then record every sale from this page.',
    steps: [
      {
        title: '1. Add your first gallon type',
        text: 'With no gallon types yet, you\'ll see an empty state with a "Create First Gallon" button (or "+ Add Gallon Type" afterward). This is where you set up the products you sell — you only need to do this once per gallon type, or whenever you add a new size.',
        image: 'dispense-01-empty-state.png'
      },
      {
        title: '2. Fill in the gallon details',
        text: 'Optionally upload a product image, then enter a Gallon Name (e.g. "Round 5 Gallon"), the Size and Unit, and the Regular Price. Tap "Create Gallon" to save it.',
        image: 'dispense-02-create-gallon-modal.png'
      },
      {
        title: '3. Dispense from a gallon card',
        text: 'Each gallon type you create shows as a card with its name, size, and pricing badges (Rider, Walk-in Custom, Reseller). Tap "Dispense" on a card to record a sale of that gallon type.',
        image: 'dispense-03-gallon-card.png'
      },
      {
        title: '4. Choose quantity, customer type, and rider',
        text: 'When dispensing, set the quantity, choose whether it\'s a Regular walk-in/delivery sale or a Reseller sale (which can use a different price), and optionally assign a delivery rider — riders must already be added on the Riders page to appear here.'
      },
      {
        title: '5. Set the payment status',
        text: 'Mark the sale as Paid (fully collected now), Partial (some money collected, some still owed), or Utang (nothing collected yet — full amount owed). Partial and Utang sales can be paid off later from the Transactions page.'
      },
      {
        title: '6. Delete a gallon type if needed',
        text: 'If you need to remove a gallon type — for example, you stopped offering a size — open its options and confirm deletion. This action cannot be undone, so make sure it\'s the right one before confirming.',
        image: 'dispense-04-delete-confirm.png'
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
        text: 'Each card shows collected money for that period. Important: money is counted on the day it was actually collected — so if a customer owed you money from a few days ago and pays today, that payment counts toward today\'s total, not the day of the original sale.',
        image: 'sales-01-overview.png'
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
        text: 'Use the toggle at the top right to change how your sales are grouped. Daily shows your last 7 days, Monthly shows your last 12 months, and Yearly shows every year you\'ve had activity.',
        image: 'reports-01-overview.png'
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
        text: 'Use the tabs at the top to view "All Transactions" or filter by a specific delivery rider. Use the date range fields to narrow down to a specific day or range — for example, June 20 to June 21 — or tap "Clear" to reset.',
        image: 'transactions-01-empty-state.png'
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
    id: 'riders',
    label: 'Riders',
    icon: Bike,
    summary: 'Register your delivery riders so you can assign and track their deliveries.',
    steps: [
      {
        title: '1. Add your first rider',
        text: 'When you have no riders yet, the Riders page shows an empty state with an "Add First Rider" button. Tap it (or "+ Add Rider" once you have riders already) to open the registration form.',
        image: 'riders-01-empty-state.png'
      },
      {
        title: '2. Fill in their name and phone',
        text: 'Enter the rider\'s name — phone number is optional. Tap "Save Rider" to add them to your team.',
        image: 'riders-02-add-modal.png'
      },
      {
        title: '3. See your rider card',
        text: 'Once saved, the rider appears as a card showing their name, the date they were added, and an "Active" status badge. They\'re now selectable on the Dispense page and appear as a filter tab on Transactions.',
        image: 'riders-03-added-rider.png'
      },
      {
        title: '4. Remove a rider if needed',
        text: 'Tap the trash icon on a rider\'s card to remove them. You\'ll be asked to confirm — removing a rider keeps their past transaction history, it just stops them from being assignable to new sales.',
        image: 'riders-04-remove-confirm.png'
      }
    ]
  },
  {
    id: 'workers',
    label: 'Workers',
    icon: Users,
    summary: 'Manage your team\'s pay setup, attendance, cash advances, and payroll — protected by a passcode.',
    steps: [
      {
        title: '1. Set up your Workers passcode first',
        text: 'The very first time you open Workers, you\'ll be asked to set up a 4-digit passcode before you can access the section at all. Tap "Set Up Passcode Now".',
        image: 'workers-02-passcode-required.png'
      },
      {
        title: '2. Create your passcode',
        text: 'Enter a 4-digit passcode using the on-screen keypad, then tap "Next".',
        image: 'workers-03-passcode-create.png'
      },
      {
        title: '3. Confirm your passcode',
        text: 'Enter the same passcode again to confirm it matches, then tap "Confirm & Save" to finish setup.',
        image: 'workers-04-passcode-confirm.png'
      },
      {
        title: '4. Add your first worker',
        text: 'With no workers yet, you\'ll see an empty state with an "Add First Worker" button (or "+ Add Worker" afterward).',
        image: 'workers-01-empty-state.png'
      },
      {
        title: '5. Choose a Pay Type',
        text: 'Enter the worker\'s full name, then choose how they\'re paid: "Fixed Daily" pays a set amount per day worked regardless of gallons delivered. "Per Gallon" pays based on total gallons delivered, with no base rate. "Fixed + % Bonus" combines a base rate with a percentage bonus.',
        image: 'workers-05-add-worker-fixed.png'
      },
      {
        title: '6. Set the rate and pay schedule',
        text: 'Depending on the Pay Type chosen, enter the relevant rate (Daily Rate, or Rate per Gallon), set their Regular Hours/Day, and pick a Pay Schedule — Weekly, Kinsenas (twice a month), or Daily. The Salary Preview box updates automatically so you can confirm the numbers look right before saving.',
        image: 'workers-06-add-worker-pergallon.png'
      },
      {
        title: '7. Record a cash advance',
        text: 'If a worker needs an advance, tap the cash advance action on their row, enter the amount and an optional reason. This amount is automatically deducted from their next payroll computation — you don\'t need to subtract it yourself.',
        image: 'workers-07-cash-advance.png'
      },
      {
        title: '8. Compute payroll',
        text: 'Tap the payroll action on a worker\'s row, then set the Payroll Period start and end dates — or tap "Auto-detect work period" to let the system find it based on their pay schedule. Tap "Compute Payroll" to calculate what they\'re owed, with any cash advances already factored in.',
        image: 'workers-08-compute-payroll.png'
      },
      {
        title: '9. Delete a worker if needed',
        text: 'Tap the delete action on a worker\'s row to remove them. You\'ll be asked to confirm, since this permanently deletes their work history and logs along with them — this action cannot be undone.',
        image: 'workers-09-delete-confirm.png'
      },
      {
        title: '10. Enter your passcode on future visits',
        text: 'After setup, you\'ll be asked to enter your 4-digit passcode every time you return to the Workers section. If you forget it, use the "Forgot passcode" option to contact admin for a reset — for security, passcodes can\'t be recovered any other way.'
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
                  <div v-if="step.image && resolveHelpImage(step.image)" class="mt-2 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                    <img :src="resolveHelpImage(step.image)" :alt="step.title" class="w-full h-auto block" />
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