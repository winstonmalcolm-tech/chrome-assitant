<script setup>
  import { RouterLink, useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import logo from "@/assets/alinea_icon.png";
  import { ref } from "vue";

  const route = useRoute();
  const router = useRouter();
  const userStore = useUserStore();
  const mobileMenuOpen = ref(false);

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
  <nav
    v-if="!(route.name == 'verify' || route.name == 'thankyou' || route.name == 'texteditor')"
    class="py-2 px-4 sm:px-8 border-b-[1px] border-gray-300 flex justify-between items-center relative"
  >
    <!-- Logo and Brand -->
    <div class="flex items-center gap-2">
      <img :src="logo" alt="logo" class="w-12 h-10 sm:w-16 sm:h-12" />
      <h1 class="text-lg sm:text-xl font-bold text-foreground">Alinea AI</h1>
    </div>

    <!-- Hamburger Icon (Mobile) -->
    <button
      class="sm:hidden flex items-center px-2 py-1"
      @click="mobileMenuOpen = !mobileMenuOpen"
      aria-label="Toggle navigation"
    >
      <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Desktop Links -->
    <div class="hidden sm:flex items-center gap-4 text-foreground">
      <RouterLink
        to="/"
        :class="['hover:text-primary-500 transition duration-300', route.name == 'home' ? 'text-primary-500' : '']"
        >Home</RouterLink
      >
      <RouterLink
        to="/pricing"
        :class="['hover:text-primary-500 transition duration-300', route.name == 'pricing' ? 'text-primary-500' : '']"
        >Pricing</RouterLink
      >
      <RouterLink
        v-if="userStore.user"
        to="/dashboard"
        :class="['hover:text-primary-500 transition duration-300', route.name == 'dashboard' ? 'text-primary-500' : '']"
        >Dashboard</RouterLink
>
    </div>

    <div class="hidden sm:flex gap-4 items-center">
      <RouterLink
        v-if="!userStore.user"
        to="/signin"
        class="hover:scale-105 transition duration-300 border-[1px] border-gray-300 p-2 rounded-lg text-foreground"
        >Sign in</RouterLink
      >
      <RouterLink
        v-if="!userStore.user"
        to="/signup"
        class="hover:scale-105 transition duration-300 bg-primary-500 p-2 rounded-lg text-white"
        >Register</RouterLink
      >
      <button
        v-if="userStore.user"
        @click="logout()"
        class="hover:bg-red-500 hover:text-white transition duration-300 border-[1px] border-gray-300 p-2 rounded-lg text-foreground cursor-pointer"
      >
        Logout
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="fade">
      <div
        v-if="mobileMenuOpen"
        class="sm:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 z-50 shadow-md"
      >
        <div class="flex flex-col gap-2 p-4 text-foreground">
          <RouterLink
            to="/"
            :class="['py-2 hover:text-primary-500 transition duration-300', route.name == 'home' ? 'text-primary-500' : '']"
            @click="mobileMenuOpen = false"
            >Home</RouterLink
          >
          <RouterLink
            to="/pricing"
            :class="['py-2 hover:text-primary-500 transition duration-300', route.name == 'pricing' ? 'text-primary-500' : '']"
            @click="mobileMenuOpen = false"
            >Pricing</RouterLink
          >
          <RouterLink
            v-if="userStore.user"
            to="/dashboard"
            :class="['py-2 hover:text-primary-500 transition duration-300', route.name == 'dashboard' ? 'text-primary-500' : '']"
            @click="mobileMenuOpen = false"
            >Dashboard</RouterLink
          >
          <RouterLink
            v-if="!userStore.user"
            to="/signin"
            class="py-2 hover:scale-105 transition duration-300 border-[1px] border-gray-300 rounded-lg text-foreground"
            @click="mobileMenuOpen = false"
            >Sign in</RouterLink
          >
          <RouterLink
            v-if="!userStore.user"
            to="/signup"
            class="py-2 hover:scale-105 transition duration-300 bg-primary-500 rounded-lg text-white"
            @click="mobileMenuOpen = false"
            >Register</RouterLink
          >
          <button
            v-if="userStore.user"
            @click="logout(); mobileMenuOpen = false"
            class="py-2 hover:bg-red-500 hover:text-white transition duration-300 border-[1px] border-gray-300 rounded-lg text-foreground cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </transition>
  </nav>
</template>