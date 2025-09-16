<script setup>
  import logo from "@/assets/alinea_icon.png";
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRoute, RouterLink } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import { LoaderCircle } from 'lucide-vue-next';

  const route = useRoute();
  const loading = ref(true);
  const success = ref(false);
  const userStore = useUserStore();


  onMounted(async () => {
    const token = route.query.token;

    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_BASE_URL}/auth/verify`, { token });

      localStorage.setItem('jwt', JSON.stringify({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken
      }));

      userStore.user = true;

      const handleContentScriptReady = (event) => {
        if (event.data?.type === "CONTENT_SCRIPT_READY") {
          console.log("Content script is ready");

          window.postMessage({
            type: "AUTH_TOKEN",
            tokens: JSON.stringify({
              accessToken: res.data.accessToken,
              refreshToken: res.data.refreshToken
            })
          }, "*");

          success.value = true;
          loading.value = false;

          window.removeEventListener("message", handleContentScriptReady);
        }
      };

      window.addEventListener("message", handleContentScriptReady);

      // Optional: fallback timeout if content script never responds
      setTimeout(() => {
        if (!success.value) {
          console.warn("Content script did not respond in time");
          loading.value = false;
        }
      }, 10000);

    } catch (err) {
      success.value = false;
      loading.value = false;
    }
  });

</script>

<!-- VerifyToken.vue -->
<template>
  <main class="bg-blue-200 h-screen flex flex-col items-center justify-center">
    
    <div class="w-[50%]">
      <div class="flex items-center justify-center gap-2 mb-8">
        <img :src="logo" alt="logo" class="w-16 h-12">
        <h1 class="text-2xl font-bold text-foreground">Alinea AI</h1>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center gap-2 mb-4">
        <LoaderCircle class="w-10 h-10 animate-spin text-foreground" />
        <p class="animate-pulse text-xl text-foreground">Verifying Token...</p>
      </div>
      
      <div v-else-if="success" class="flex flex-col items-center justify-center gap-2 mb-4">
        <p class="text-green-500 text-xl text-foreground">Verified!</p>
        <RouterLink to="/dashboard" class="text-center px-4 py-2 bg-primary-500 text-white w-[40%] rounded-lg hover:bg-blue-500 transition duration-300 cursor-pointer">Go to Dashboard</RouterLink>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center gap-2 mb-4">
        <h4 class="text-red-500 text-xl text-foreground">Invalid or expired link.</h4>
        <RouterLink to="/" class="text-center w-[40%] px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-blue-500 transition duration-300 cursor-pointer">Go home</RouterLink>
      </div>
    </div>
    
  </main>
  
</template>


