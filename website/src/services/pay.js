import api from '@/axios/api';
class Pay {
  constructor() {
     this.serverUrl = import.meta.env.VITE_SERVER_BASE_URL
  }

  async cancel() {
    try {
      const response = await api.post("/pay/cancel");

      return {success: true, data: response.data.message};

    } catch (error) {
      console.log(error);
      return {success: false, message: error.response.data.message};
    }
  }
}

export default Pay