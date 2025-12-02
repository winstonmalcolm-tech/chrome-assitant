<script setup>
import logo from "@/assets/alinea_icon.png"
</script>

<template>
  <footer class="bg-white border-t border-gray-200 py-12 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-12">
        
        <!-- Brand Section -->
        <div class="lg:col-span-1">
          <!-- Logo and Brand Name -->
          <div class="flex items-center mb-4">
            <img :src="logo" alt="logo" class="w-16 h-12">
            <h3 class="text-xl font-semibold text-gray-900">Alinea AI</h3>
          </div>
          
          <!-- Description -->
          <p class="text-gray-600 leading-relaxed">
            Professional Chrome extension tools designed to enhance productivity and streamline your workflow.
          </p>
        </div>

        <!-- Product Links -->
        <div class="md:col-span-1">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Product</h4>
          <ul class="space-y-3">
            <li>
              <RouterLink 
                to="/pricing"
                class="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Pricing
              </RouterLink>
            </li>
            <li>
              <RouterLink 
                to="/#features"
                class="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Features
              </RouterLink>
            </li>
            <li>
              <a 
                href="mailto:nativedev97@gmail.com"
                class="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Support
              </a>
            </li>
          </ul>
        </div>

        <!-- Legal Links -->
        <div class="md:col-span-1">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Legal</h4>
          <ul class="space-y-3">
            <li>
              <RouterLink 
                to="/terms"
                class="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Terms of Service
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Copyright Section -->
      <div class="pt-8 border-t border-gray-200">
        <div class="text-center">
          <p class="text-gray-500 text-base md:text-lg">
           &copy; {{ new Date().getFullYear() }} Alinea AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>