<script setup>
  import logo from "@/assets/alinea_icon.png";
  import { CheckCircle } from 'lucide-vue-next';

</script>

<!-- VerifyToken.vue -->
<template>
  <main class="bg-blue-200 h-screen flex flex-col items-center justify-center">
    
    <div class="w-[50%]">
      <div class="flex flex-col items-center justify-center gap-2">
        <CheckCircle class="w-8 h-8 text-green-400" />
        <div class="flex items-center justify-center gap-2 mb-8">
          <img :src="logo" alt="logo" class="w-16 h-12">
          <h1 class="text-2xl font-bold text-foreground">Alinea AI</h1>
        </div>
      </div>
      
      <div class="flex flex-col items-center justify-center gap-2 mb-4">
        <p class="text-green-500 text-xl text-foreground">Your purchase was successful</p>
        <RouterLink to="/dashboard" class="text-center px-4 py-2 bg-primary-500 text-white w-[40%] rounded-lg hover:bg-blue-500 transition duration-300 cursor-pointer">Go to Dashboard</RouterLink>
      </div>
      
    </div>
    
  </main>
  
</template>


