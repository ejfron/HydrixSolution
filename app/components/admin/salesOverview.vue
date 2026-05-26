<template>
  <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6">
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <div>
        <h2 class="text-sm font-bold text-slate-800">Sales Overview</h2>
        <p class="text-xs text-slate-400 mt-0.5">Monthly revenue trend</p>
      </div>
      <div class="px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
        This Month
      </div>
    </div>

    <div class="relative h-[160px] sm:h-[200px]">
      <svg viewBox="0 0 860 200" class="w-full h-full" fill="none">
        <line x1="0" y1="50"  x2="860" y2="50"  stroke="#f1f5f9" stroke-width="1"/>
        <line x1="0" y1="100" x2="860" y2="100" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="0" y1="150" x2="860" y2="150" stroke="#f1f5f9" stroke-width="1"/>

        <path
          d="M0 180 C80 160 120 140 200 100 S340 130 430 80 S560 40 650 90 S780 150 860 60 L860 200 L0 200 Z"
          fill="#f0fdf4"
        />
        <path
          d="M0 180 C80 160 120 140 200 100 S340 130 430 80 S560 40 650 90 S780 150 860 60"
          stroke="#16a34a"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="200" cy="100" r="4" fill="#16a34a"/>
        <circle cx="430" cy="80"  r="4" fill="#16a34a"/>
        <circle cx="650" cy="90"  r="4" fill="#16a34a"/>
        <circle cx="860" cy="60"  r="4" fill="#16a34a"/>
      </svg>
    </div>

    <!-- Month labels — hidden on very small screens, show abbreviated -->
    <div class="flex justify-between mt-3 px-1">
      <span
        v-for="m in ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']"
        :key="m"
        class="text-[9px] sm:text-[10px] text-slate-400 hidden sm:block first:block last:block"
      >
        {{ m }}
      </span>
      <!-- Mobile: show only a few -->
      <span class="text-[9px] text-slate-400 sm:hidden">Jan</span>
      <span class="text-[9px] text-slate-400 sm:hidden">Apr</span>
      <span class="text-[9px] text-slate-400 sm:hidden">Jul</span>
      <span class="text-[9px] text-slate-400 sm:hidden">Oct</span>
      <span class="text-[9px] text-slate-400 sm:hidden">Dec</span>
    </div>
  </div>
</template>