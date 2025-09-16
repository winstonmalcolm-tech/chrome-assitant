import axios from "axios";
import api from '@/axios/api';

class Auth {
  constructor() {
    this.serverUrl = import.meta.env.VITE_SERVER_BASE_URL
  }

  async signUp(name, email) {

    try {
      const response = await axios.post(`${this.serverUrl}/auth/signup`, {name, email},{
        headers: { 'Content-Type': 'application/json' }
      });

      console.log(response);
      if (response.status != 200) {
        return {success: false, message: response.data.message};
      }

      return {success: true, message: response.data.message};


    } catch(error) {
      console.log(error);
      return {success: false, message: error.response.data.message};
    }
  }

  async login(email) {

    try {
      const response = await axios.post(`${this.serverUrl}/auth/login`, {email});

      if (response.status != 200) {
        return {success: false, message: response.data.message};
      }

      return {success: true, message: response.data.message};

    } catch(error) {
      return {success: false, message: error.response.data.message};
    }
  }

  logout() {
    localStorage.clear();
  }

  async getUser() {
    try {
      const response = await api.get("/auth/me");

      console.log(response);
      return {success: true, data: response.data};

    } catch (error) {
      //console.log(error.response.data.message);
      return {success: false, message: error.response.data.message};
    }
  }

}


export default Auth;