<script setup>
  import { RouterLink, useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import logo from "@/assets/alinea_icon.png";


  const route = useRoute();
  const router = useRouter();
  const userStore = useUserStore();

  function logout() {
    // Now send logout message
    window.postMessage({
      type: "LOGOUT",
    }, "*");
    
    userStore.logout();
    router.replace({name: "signin"});
  }

</script>


<template>
  <nav v-if="!(route.name == 'verify' || route.name == 'thankyou')" class="py-2 px-8 border-b-[1px] border-gray-300 flex justify-between items-center">
    <div class="flex items-center justify-center gap-2">
      <img :src="logo" alt="logo" class="w-16 h-12">
      <h1 class="text-xl font-bold text-foreground">Alinea AI</h1>
    </div>
    

    <div class="flex items-center justify-center gap-4 text-foreground">
      <RouterLink to="/" :class="['hover:text-primary-500 transition duration-300', route.name == 'home' ? 'text-primary-500' : '']">Home</RouterLink>
      <RouterLink to="/pricing" :class="['hover:text-primary-500 transition duration-300', route.name == 'pricing' ? 'text-primary-500' : '']">Pricing</RouterLink>
      <RouterLink v-if="userStore.user" to="/dashboard" :class="['hover:text-primary-500 transition duration-300', route.name == 'dashboard' ? 'text-primary-500' : '']">Dashboard</RouterLink>
    </div>

    <div class="flex gap-4 items-center justify-center">
      <RouterLink v-if="!userStore.user" to="/signin" class="hover:scale-105 transition duration-300 border-[1px] border-gray-300 p-2 rounded-lg text-foreground">Sign in</RouterLink>
      <RouterLink v-if="!userStore.user" to="/signup" class="hover:scale-105 transition duration-300 bg-primary-500 p-2 rounded-lg text-white">Register</RouterLink>
      <button v-if="userStore.user" @click="logout()" class="hover:bg-red-500 hover:text-white transition duration-300 border-[1px] border-gray-300 p-2 rounded-lg text-foreground cursor-pointer">Logout</button>
    </div>
  </nav>
</template>