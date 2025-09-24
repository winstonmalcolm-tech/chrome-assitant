import api from '@/axios/api';
class Pay {
  constructor() {
     this.serverUrl = import.meta.env.VITE_SERVER_BASE_URL
  }

  async cancel() {
    try {
      const response = await api.post("/pay/cancel");

      return {success: true, message: response.data.message};

    } catch (error) {
      return {success: false, message: "Please try again later, or contact support"};
    }
  }

  async resume() {
    try {
      const response = await api.post("/pay/resume");
      return {success: true, message: response.data.message};

    } catch (error) {
      return {success: false, message: "Please try again later, or contact support"};
    }
  }
  
}

export default Pay