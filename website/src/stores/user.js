import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import Auth from "@/services/auth";

export const useUserStore = defineStore("user", () => {
  const isAuth = ref(false);
  const userId = ref(null);

  const auth = new Auth();

  const isAuthenticated = computed(() => {
    return isAuth.value;
  });

  function init() {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) return;

      const { accessToken } = JSON.parse(jwt);
      const decoded = jwtDecode(accessToken);

      isAuth.value = true;
      userId.value = decoded.userId;
    } catch (err) {
      console.warn("JWT init failed, clearing auth");
      logout();
    }
  }

  function logout() {
    auth.logout();
    localStorage.removeItem("jwt");
    isAuth.value = false;
    userId.value = null;
  }

  return {
    init,
    isAuthenticated,
    isAuth,
    userId,
    logout,
  };
});
