<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'

useSeoMeta({
  title: 'Terms & Conditions | Hydrix',
  description:
    'Terms and Conditions for Hydrix Water Station Management System'
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
          Terms & Conditions
        </h1>

        <p class="mt-3 text-green-50">
          Please read these terms carefully before using the
          Hydrix Water Station Management System.
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
              1. Acceptance of Terms
            </h2>

            <p>
              By accessing and using Hydrix Water Station Management System
              <strong>Hydrix</strong>, you agree to comply with and be bound by these
              Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              2. Services Provided
            </h2>

            <p class="mb-4">
              Hydrix provides business management tools including:
            </p>

            <ul class="grid md:grid-cols-2 gap-3">
              <li class="bg-gray-50 p-4 rounded-xl">
                Inventory Management
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Sales Tracking
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Customer Management
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Payroll Management
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Employee Management
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Cash Advance & Loan Tracking
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Delivery Monitoring
              </li>

              <li class="bg-gray-50 p-4 rounded-xl">
                Reports & Analytics
              </li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              3. User Responsibilities
            </h2>

            <p>
              Users are responsible for maintaining account security,
              protecting login credentials, and ensuring the accuracy of
              information entered into the system.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              4. Data Ownership
            </h2>

            <p>
              All business records, employee information, inventory data,
              sales reports, and other content entered into Hydrix remain
              the property of the customer.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              5. Prohibited Activities
            </h2>

            <ul class="list-disc pl-6 space-y-2">
              <li>Unauthorized access attempts.</li>
              <li>Reverse engineering the platform.</li>
              <li>Uploading harmful software or malware.</li>
              <li>Using the platform for illegal activities.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              6. Service Availability
            </h2>

            <p>
              We strive to provide continuous service availability but
              cannot guarantee uninterrupted access due to maintenance,
              updates, or unforeseen technical issues.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              7. Limitation of Liability
            </h2>

            <p>
              Hydrix shall not be liable for indirect, incidental,
              special, or consequential damages arising from the use
              of the platform.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              8. Changes to Terms
            </h2>

            <p>
              We reserve the right to update these terms at any time.
              Continued use of the platform constitutes acceptance of
              any modifications.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-green-600 mb-3">
              9. Contact Information
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