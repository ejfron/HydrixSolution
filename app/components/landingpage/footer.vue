<script setup lang="ts">
import { Image, MailCheck, MessageCircle, Phone, MapPinCheck } from '@lucide/vue'
</script>

<template>
  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-400 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <!-- Company Info -->
        <div>
          <div class="flex items-center gap-2 -ml-7 mb-1">
            <img src="/logo.svg" alt="Hydrix" class="h-15" />
          </div>

          <p class="text-sm text-gray-400">
            Pure water, on demand. Smart dispensing for modern living.
          </p>

          <div class="flex gap-4 mt-4">
            <a
              href="mailto:HydrixSolution@gmail.com"
              class="text-gray-400 hover:text-white transition-colors"
            >
              <MailCheck />
            </a>

            <a
              href="#"
              class="text-gray-400 hover:text-white transition-colors"
            >
              <Image />
            </a>

            <a
              href="https://www.facebook.com/ej.fron16"
              target="_blank"
              class="text-gray-400 hover:text-white transition-colors"
            >
              <MessageCircle />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-semibold mb-4">Quick Links</h4>

          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink
                to="/loginpage"
                class="hover:text-white transition-colors"
              >
                Sign In
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/registerpage"
                class="hover:text-white transition-colors"
              >
                Register
              </NuxtLink>
            </li>

            <li>
              <a
                href="#features"
                class="hover:text-white transition-colors"
              >
                Features
              </a>
            </li>

            <li>
              <a
                href="#pricing"
                class="hover:text-white transition-colors"
              >
                Pricing
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-white font-semibold mb-4">Contact</h4>

          <ul class="space-y-3 text-sm">
            <li class="flex gap-2">
              <MapPinCheck :size="16" />
              <span>24 R Valle St., Taytay Rizal</span>
            </li>

            <li class="flex gap-2">
              <Phone :size="16" />
              <span>+63 921 658 4117</span>
            </li>

            <li class="flex gap-2">
              <MailCheck :size="16" />
              <span>HydrixSolution@gmail.com</span>
            </li>
          </ul>
        </div>

        <!-- Operating Hours -->
        <div>
          <h4 class="text-white font-semibold mb-4">Operating Hours</h4>

          <ul class="space-y-2 text-sm">
            <li>Mon - Sat: 6:00 AM - 10:00 PM</li>
            <li>Sunday: 8:00 AM - 8:00 PM</li>
            <li class="mt-3">
              <span class="text-primary-400">24/7 Support</span> Available
            </li>
          </ul>
        </div>
      </div>

      <!-- Developer Credit -->
      <div class="border-t border-gray-800 mt-10 pt-6 text-center">
        <p class="text-sm text-gray-500">
          Owner & Developed by
          <span class="font-semibold text-white">Edgar Jugado</span>
        </p>
      </div>

      <!-- Copyright -->
      <div class="border-t border-gray-800 mt-4 pt-8 text-center text-sm">
        <p>
          &copy; 2026 Hydrix. All rights reserved. |
          <a href="/Privacy" class="hover:text-white">Privacy Policy</a> |
          <a href="/Terms" class="hover:text-white">Terms of Service</a>
        </p>
      </div>
    </div>
  </footer>
</template>