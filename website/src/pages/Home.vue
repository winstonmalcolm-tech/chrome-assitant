<script setup>
  import Chip from '@/components/Chip.vue';
  import { RouterLink } from 'vue-router';
  import { ArrowRight } from 'lucide-vue-next';
  import Footer from '@/components/Footer.vue';

  import { ref } from 'vue'

const features = ref([
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-icon lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
    title: "Document Generation",
    description: "Generate polished, professional documents instantly—just from a simple prompt. Our AI-powered document generation turns your ideas into ready-to-use reports, proposals, and more in seconds. Say goodbye to blank pages and hello to effortless creation"
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pilcrow-icon lucide-square-pilcrow"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 12H9.5a2.5 2.5 0 0 1 0-5H17"/><path d="M12 7v10"/><path d="M16 7v10"/></svg>`,
    title: "Paraphrasing",
    description: "Say it better, faster—with our AI-powered paraphrasing feature. Instantly transform clunky sentences into clear, compelling language that fits your tone, audience, and intent. Whether you're refining emails, rewriting blog posts, or polishing product copy, we've got your words covered."
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-check-icon lucide-mail-check"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/></svg>`,
    title: "Email generation",
    description: "Craft perfect emails in seconds—just from a prompt. Whether it's a client pitch, follow-up, or support reply, our AI-powered email generation delivers polished, personalized messages that sound like you and get results. No templates, no guesswork—just instant clarity."
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot-icon lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
    title: "AI Chat",
    description: "Meet your always-on, always-sharp AI chat companion—built to understand, respond, and adapt to your every prompt. Whether you're brainstorming ideas, solving problems, or just having a real-time conversation, our AI chat delivers fast, intelligent dialogue that feels natural and keeps you moving forward."
  }
])


</script>

<template>
  <main class="h-screen mt-10 px-10">
    
    <!-- Hero Section -->
    <section className="sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl text-center flex flex-col items-center">
        <Chip page="home" label="Broswer Extension" />
        <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
          Supercharge Your Browser with <span className="text-primary-500">Professional Tools</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-pretty">
          Generate emails, craft documents, paraphrase with clarity, and chat with AI — all in one streamlined workspace. Designed to help you write faster and smarter from day one.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <RouterLink to="signup" class="cursor-pointer hover:bg-blue-700 transition duration-300 text-lg text-white rounded-lg px-8 py-4 bg-primary-500 flex items-center justify-center">
            Sign Up
            <ArrowRight className="ml-2 h-5 w-5" />
          </RouterLink>
        </div>
      </div>
    </section>    

    <!-- Why choose Alinea AI -->

    <div id="features" class="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Why choose Alinea AI?
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Our extension provides enterprise-grade features designed to enhance your workflow
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
        >
          <!-- Icon -->
          <div class="flex justify-center items-center mb-6">
            <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <center>
                <div class="w-8 h-8 text-blue-500" v-html="feature.icon"></div>
              </center>
            </div>
          </div>

          <!-- Content -->
          <div class="text-center">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600 leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
    
  <!--Ready to get started section-->

  <div class="bg-gray-50 py-16 md:py-24 px-4">
    <div class="max-w-4xl mx-auto text-center">
      <!-- Main Heading -->
      <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 md:mb-8">
        Ready to Get Started?
      </h2>
      
      <!-- Subtitle -->
      <p class="text-lg md:text-xl text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
        Become a professional who have upgraded their browser experience
      </p>
      
      <!-- CTA Button -->
      <div class="flex justify-center">
        <RouterLink 
          to="/pricing"
          class="cursor-pointer inline-flex items-center px-8 md:px-10 py-4 md:py-5 bg-primary-500 hover:bg-blue-700 text-white font-semibold text-lg md:text-xl rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          View Pricing Plans
          <ArrowRight class="w-5 h-5 md:w-6 md:h-6 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </RouterLink>
      </div>
    </div>
  </div>

  <!--Footer Section-->
  <Footer />
  </main>
</template>