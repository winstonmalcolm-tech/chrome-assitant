import axios from "axios";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL
});

api.interceptors.request.use((config) => {

  const token = JSON.parse(localStorage.getItem("jwt")).accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_BASE_URL}/auth/refresh`, {
        refreshToken: JSON.parse(localStorage.getItem("jwt")).refreshToken
      });

      const newAccessToken = res.data.accessToken;

      const updatedToken = {
        refreshToken: JSON.parse(localStorage.getItem("jwt")).refreshToken,
        accessToken: newAccessToken
      }

      localStorage.clear();
      localStorage.setItem("jwt", JSON.stringify(updatedToken));

      //Update the header and retry the request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    
    } catch (refreshError) {
      console.error('Refresh token failed:', refreshError);

      const userStore = useUserStore();
      const router = useRouter();
      
      userStore.logout();
      router.replace({name: "signin"});

      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error)
});

export default api;

