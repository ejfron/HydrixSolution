<!-- components/Skeleton/LoginSkeleton.vue -->
<template>
  <div class="min-h-screen bg-[#f5faf6] flex relative animate-pulse">

    <!-- Back Button -->
    <div
      class="absolute top-6 left-16 z-50 flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow border border-gray-200"
    >
      <div class="w-5 h-5 rounded bg-gray-200"></div>
      <div class="w-28 h-4 rounded bg-gray-200"></div>
    </div>

    <!-- LEFT SIDE -->
    <div class="hidden lg:flex w-1/2 bg-[#0ea44b] relative overflow-hidden">

      <!-- Background Blur -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-center px-16 w-full">

        <!-- Logo -->
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-white/20"></div>
          <div class="w-36 h-10 rounded bg-white/20"></div>
        </div>

        <!-- Badge -->
        <div class="w-52 h-8 rounded-full bg-white/20 mb-6"></div>

        <!-- Heading -->
        <div class="space-y-4 mb-6">
          <div class="w-[420px] h-14 rounded bg-white/20"></div>
          <div class="w-[320px] h-14 rounded bg-white/20"></div>
        </div>

        <!-- Description -->
        <div class="space-y-3">
          <div class="w-full max-w-xl h-4 rounded bg-white/20"></div>
          <div class="w-[90%] max-w-xl h-4 rounded bg-white/20"></div>
          <div class="w-[75%] max-w-xl h-4 rounded bg-white/20"></div>
        </div>

        <!-- Feature Cards -->
        <div class="flex gap-4 mt-10">

          <div class="bg-white/15 rounded-2xl px-5 py-4 w-40">
            <div class="w-16 h-8 rounded bg-white/20 mb-3"></div>
            <div class="w-28 h-4 rounded bg-white/20"></div>
          </div>

          <div class="bg-white/15 rounded-2xl px-5 py-4 w-40">
            <div class="w-16 h-8 rounded bg-white/20 mb-3"></div>
            <div class="w-28 h-4 rounded bg-white/20"></div>
          </div>

          <div class="bg-white/15 rounded-2xl px-5 py-4 w-40">
            <div class="w-16 h-8 rounded bg-white/20 mb-3"></div>
            <div class="w-28 h-4 rounded bg-white/20"></div>
          </div>

        </div>

      </div>

    </div>

    <!-- RIGHT SIDE -->
    <div class="flex-1 flex items-center justify-center p-6">

      <div class="w-full max-w-md">

        <!-- Mobile Logo -->
        <div class="lg:hidden flex justify-center mb-8">
          <div class="w-40 h-10 rounded bg-gray-200"></div>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-[32px] shadow-2xl border border-gray-100 p-8">

          <!-- Title -->
          <div class="mb-8">
            <div class="w-56 h-10 rounded bg-gray-200 mb-4"></div>
            <div class="w-64 h-4 rounded bg-gray-200"></div>
          </div>

          <!-- Email -->
          <div class="mb-5">
            <div class="w-28 h-4 rounded bg-gray-200 mb-3"></div>

            <div class="w-full h-14 rounded-2xl bg-gray-100 border border-gray-200"></div>
          </div>

          <!-- Password -->
          <div class="mb-5">
            <div class="w-24 h-4 rounded bg-gray-200 mb-3"></div>

            <div class="w-full h-14 rounded-2xl bg-gray-100 border border-gray-200"></div>
          </div>

          <!-- Remember -->
          <div class="flex items-center justify-between mb-6">
            <div class="w-32 h-4 rounded bg-gray-200"></div>
            <div class="w-28 h-4 rounded bg-gray-200"></div>
          </div>

          <!-- Login Button -->
          <div class="w-full h-14 rounded-2xl bg-gray-200 mb-7"></div>

          <!-- Divider -->
          <div class="relative my-7">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>

            <div class="relative flex justify-center">
              <div class="w-24 h-4 rounded bg-white border border-gray-100"></div>
            </div>
          </div>

          <!-- Guest -->
          <div class="w-full h-14 rounded-2xl bg-gray-100 border border-gray-200"></div>

          <!-- Register -->
          <div class="flex justify-center mt-8">
            <div class="w-60 h-4 rounded bg-gray-200"></div>
          </div>

        </div>

      </div>

    </div>

  </div>
</template>