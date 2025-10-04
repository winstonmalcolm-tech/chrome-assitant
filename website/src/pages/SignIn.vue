<script setup>
  import Auth from "@/services/auth";
  import { reactive, ref } from "vue";

  const data = reactive({
    email: '',
    loading: false
  });

  const error = ref(null);
  const message = ref(null);
  const auth = new Auth();

  async function handleSignIn() {
    try {
      if (!data.email) {
        error.value = "Please enter email"
        return;
      }

      data.loading = true;

      const response = await auth.login(data.email);

      if (!response.success) {
        error.value = response.message;
        return;
      }

      message.value = response.message;
    } catch (e) {
      
      error.value = e.message
    } finally {
      data.loading = false;
    }
  }

</script>


<template>
  <main class="mt-10">
    <!-- FORM CONTAINER -->
    <div class="flex flex-col w-full items-center">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-foreground">Sign into your account</h1>
        <p className="mt-2 text-muted-foreground">Welcome back !!</p>
      </div>


      <div class="w-[50%] py-10 px-5 border-[1px] border-gray-300 rounded-lg bg-[#F4F9FF]">
        <div class="mb-4 text-center">
          <h1 class="text-xl text-foreground font-bold">Sign In</h1>
          <p class="text-foreground">Give us a feedback on your experience with us</p>
        </div>

        <form @submit.prevent="handleSignIn()" class="flex flex-col items-center gap-4">
          <input type="email" v-model="data.email" class="focus:ring-2 focus:ring-blue-500/50 w-full p-2 border-[1px] border-gray-300 rounded-lg outline-none" placeholder="Enter email">
          <p class="text-red-400" v-if="error">* {{ error }}</p>
          <p class="text-green-400" v-if="message">{{ message }}</p>
          <p class="text-yellow-500" v-if="data.loading">Loading...</p>
          <button v-else type="submit" class="px-4 py-2 bg-primary-500 text-white w-[40%] rounded-lg hover:bg-blue-500 transition duration-300 cursor-pointer">Sign In</button>
        </form>
      
      </div>


    </div>
  </main>
</template>