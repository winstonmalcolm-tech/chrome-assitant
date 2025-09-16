import { defineStore } from "pinia"
import { ref, computed } from "vue";
import Auth from "@/services/auth";
import { jwtDecode } from "jwt-decode";


const useUserStore = defineStore('user', () => {

  const user = ref(false);
  const userId = ref(null);

  const auth = new Auth();

  const isAuthenticated = computed(() => user.value);
  

  async function init() {
    const jwt = JSON.parse(localStorage.getItem("jwt"));

    if (jwt != null) {
      const accessToken = jwt.accessToken;
    
      userId.value = jwtDecode(accessToken).userId;
      user.value = jwt ? true : false;
    }

    
  }

  function logout() {
    auth.logout();
    user.value = false;
    userId.value = null;
  }

  return {init, isAuthenticated, user, logout, userId};
});

export {useUserStore};