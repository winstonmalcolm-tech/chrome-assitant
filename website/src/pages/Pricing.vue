<script setup>
import { ref } from 'vue'
import Chip from '@/components/Chip.vue';
import { RouterLink } from 'vue-router';
import Footer from '@/components/Footer.vue';

// Plan data
const freePlan = ref({
  features: [
    'All extension features',
    '8000 tokens gifted',
  ]
})

const proPlan = ref({
  features: [
    'All extensions features',
    '6M+ tokens',
    'Priority support',
  ]
})

const handlePlanSelect = (plan) => {
  console.log(`Selected plan: ${plan}`)
  // Handle plan selection logic here
  // Example: router.push(`/checkout/${plan}`) or emit event
}
</script>

<template>
  <div class="bg-gray-50 py-16 md:py-10 px-6">
    <div class="max-w-6xl mx-auto text-center">
      <!-- Pricing Plans Badge -->
      <center>
        <Chip page="pricing" label="Pricing plans" />
      </center>

      <!-- Main Heading -->
      <h1 class="text-4xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
        Choose the Perfect<br>
        Plan for <span class="text-primary-500">Your Needs</span>
      </h1>
      
      <!-- Subtitle -->
      <p class="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
        Start free and upgrade as you grow. All plans include our core features with no hidden fees.
      </p>
    </div>
  </div>

  <!--Pricing Plan Section-->
   <div class="bg-gray-50 py-16 md:py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <!-- Pricing Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6">
        
        <!-- Free Plan -->
        <div class="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 relative">
          <!-- Plan Name -->
          <h3 class="text-3xl font-bold text-gray-900 text-center mb-4">Free</h3>

          <!-- Price -->
          <div class="text-center mb-4">
            <span class="text-3xl font-bold text-gray-900">$0/</span>
            <span class="text-xl text-gray-500 ml-2">/forever</span>
          </div>

          <!-- Description -->
          <p class="text-xl text-gray-600 text-center mb-10">Perfect for getting started</p>

          <!-- Features -->
          <ul class="space-y-4 mb-18">
            <li v-for="feature in freePlan.features" :key="feature" class="flex items-start">
              <svg class="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-lg text-gray-700">{{ feature }}</span>
            </li>
          </ul>

          <!-- CTA Button -->
          <center>
            <RouterLink 
              to="/signup"
              class="w-full my-8 py-4 px-4 border-2 border-gray-300 text-gray-700 text-xl font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 cursor-pointer"
            >
              Get Started
            </RouterLink>
          </center>
        </div>

        <!-- Pro Plan (Most Popular) -->
        <div class="bg-white rounded-2xl border-2 border-blue-500 p-8 md:p-10 relative shadow-lg">
          <!-- Most Popular Badge -->
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div class="bg-primary-500 text-white px-6 py-2 rounded-full flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span class="text-lg max-sm:text-sm font-medium">Most Popular</span>
            </div>
          </div>

          <!-- Plan Name -->
          <h3 class="text-3xl font-bold text-gray-900 text-center mb-4">Pro</h3>

          <!-- Price -->
          <div class="text-center mb-4">
            <span class="text-3xl font-bold text-gray-900">$10</span>
            <span class="text-xl text-gray-500 ml-2">/per month</span>
          </div>

          <!-- Description -->
          <p class="text-xl text-gray-600 text-center mb-10">For power users and professionals</p>

          <!-- Features -->
          <ul class="space-y-4 mb-10">
            <li v-for="feature in proPlan.features" :key="feature" class="flex items-start">
              <svg class="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-lg text-gray-700">{{ feature }}</span>
            </li>
          </ul>

          <!-- CTA Button -->
          <center>
            <RouterLink 
              to="/signup"
              class="w-full py-4 px-4 bg-primary-500 text-white text-xl md:text-2xl font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg cursor-pointer"
            >
              Get Started
            </RouterLink>
          </center>
        </div>

       

      </div>
    </div>
  </div>

  <!--Frequently Asked Questions Section-->

   <div class="bg-white py-16 md:py-24 px-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-16 md:mb-20">
        <h2 class="text-4xl font-bold text-gray-900 mb-6 md:mb-8">
          Frequently Asked Questions
        </h2>
        <p class="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Everything you need to know about our pricing and plans
        </p>
      </div>

      <!-- FAQ Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20">
        
        <!-- FAQ Item 1 -->
        <div class="space-y-4">
          <h3 class="text-2xl font-semibold text-gray-900">
            Can I change plan anytime?
          </h3>
          <p class="text-lg text-gray-600 leading-relaxed">
            Yes, you can upgrade your plan at any time. Changes take effect immediately.
          </p>
        </div>

        <!-- FAQ Item 2 -->
        <div class="space-y-4">
          <h3 class="text-2xl font-semibold text-gray-900">
            Is there a free trial?
          </h3>
          <p class="text-lg text-gray-600 leading-relaxed">
            Our Free plan gives you access to all features forever once you have tokens.
          </p>
        </div>

        <!-- FAQ Item 3 -->
        <div class="space-y-4">
          <h3 class="text-2xl font-semibold text-gray-900">
            What payment methods do you accept?
          </h3>
          <p class="text-lg text-gray-600 leading-relaxed">
            We accept all major credit cards, PayPal, and bank transfers through our secure payment processor.
          </p>
        </div>

        <!-- FAQ Item 4 -->
        <div class="space-y-4">
          <h3 class="text-2xl font-semibold text-gray-900">
            Can I cancel anytime?
          </h3>
          <p class="text-lg text-gray-600 leading-relaxed">
            Yes, you can cancel your subscription at any time. If you cancel your subscription, you will still be able to use Alinea AI until the end of your billing period.
          </p>
        </div>

      </div>
    </div>
  </div>

  <!--Still Have questions section-->

   <div class="bg-gray-50 py-16 md:py-24 px-6">
    <div class="max-w-5xl mx-auto text-center">
      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
        <!-- Start Free Trial Button -->
        <RouterLink
          to="/signup"
          class="px-8 md:px-12 py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white text-xl md:text-2xl font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 min-w-[200px] md:min-w-[250px]"
        >
          Start For Free
        </RouterLink>
      </div>
    </div>
  </div>

  <!--Footer Section-->
  <Footer />
 
</template>


