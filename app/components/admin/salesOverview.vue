// components/dashboard/SalesOverview.vue
<template>
  <div class="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
    <div class="flex items-center justify-between mb-10">
      <div>
        <h2 class="text-xl font-bold text-green-600">
          SALES OVERVIEW
        </h2>
        <p class="text-slate-500  text-xs mt-1">Monthly revenue analytics</p>
      </div>

      <div
        class="px-5 text-gray-700 border-green-600 py-3 rounded-2xl border cursor-pointer text-sm font-medium"
      >
        This Month
      </div>
    </div>

    <div class="relative h-[320px] overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-t from-blue-100/80 to-transparent rounded-3xl"
      ></div>

      <svg
        viewBox="0 0 900 300"
        class="w-full h-full relative z-10"
        fill="none"
      >
        <path
          d="M0 220 C80 180, 120 200, 180 120 S320 250, 400 150 S520 100, 600 180 S760 260, 900 60"
          stroke="green"
          stroke-width="6"
          fill="none"
          stroke-linecap="round"
        />
      </svg>
    </div>
  </div>
</template>