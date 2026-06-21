<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'

useSeoMeta({
  title: 'Privacy Policy | Hydrix',
  description:
    'Privacy Policy for Hydrix Water Station Management System'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4">
    <div class="max-w-5xl mx-auto">

      <!-- Back Button -->
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl
        border border-green-200 bg-white text-green-600
        hover:bg-green-50 transition shadow-sm"
      >
        <ArrowLeft class="w-4 h-4" />
        Back to Home
      </NuxtLink>

      <!-- Hero -->
      <div
        class="bg-gradient-to-r from-green-600 to-green-500
        rounded-3xl p-8 md:p-10 text-white shadow-lg mb-8"
      >
        <h1 class="text-3xl md:text-4xl font-bold">
          Privacy Policy
        </h1>

        <p class="mt-3 text-green-50">
          Learn how Hydrix collects, stores, and protects your data.
        </p>
      </div>

      <!-- Content -->
      <div
        class="bg-white rounded-3xl border border-gray-100
        shadow-lg p-6 md:p-10"
      >
        <div class="space-y-8 text-gray-600 leading-8">

          <div>
            <span
              class="inline-flex px-4 py-1 rounded-full
              bg-green-100 text-green-600 text-sm font-medium"
            >
              Last Updated: June 2026
            </span>
          </div>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              1. Information We Collect
            </h2>

            <ul class="grid md:grid-cols-2 gap-3">
              <li class="bg-gray-50 p-4 rounded-xl">
                User Account Information
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Employee Records
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Customer Information
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Sales Transactions
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Inventory Data
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Payroll Records
              </li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              2. How We Use Information
            </h2>

            <ul class="list-disc pl-6 space-y-2">
              <li>Provide system functionality.</li>
              <li>Generate reports and analytics.</li>
              <li>Improve platform performance.</li>
              <li>Customer support.</li>
              <li>Security monitoring.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              3. Data Security
            </h2>

            <p>
              We implement reasonable technical and organizational
              safeguards to protect customer information from
              unauthorized access, disclosure, or misuse.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              4. Data Sharing
            </h2>

            <p>
              Hydrix does not sell customer data. Information may only
              be shared when legally required, with customer consent,
              or with trusted service providers.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              5. Data Retention
            </h2>

            <p>
              Data is retained for as long as necessary to provide
              services and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              6. User Rights
            </h2>

            <ul class="list-disc pl-6 space-y-2">
              <li>Access your data.</li>
              <li>Request corrections.</li>
              <li>Request deletion.</li>
              <li>Request data export.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              7. Contact Us
            </h2>

            <div
              class="bg-green-50 border border-green-100
              rounded-2xl p-6"
            >
              <p>
                <span class="font-semibold text-green-600">Email:</span>
                HydrixSolution@gmail.com
              </p>

              <p>
                <span class="font-semibold text-green-600">Phone:</span>
                09277462797
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  </div>
</template>