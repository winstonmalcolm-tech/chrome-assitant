<script setup>
  import Auth from "@/services/auth";
  import { ref, reactive, onMounted } from "vue";

  const data = reactive({
    email: '',
    name: '',
    loading: false
  })

  const error = ref(null);
  const message = ref(null);
  const auth = new Auth();

  function isExtensionInstalled(timeout = 1000) {
    return new Promise((resolve) => {
      const listener = (event) => {
        if (
          event.data?.from === 'alinea.ai_1289' &&
          event.data?.status === 'installed'
        ) {
          window.removeEventListener('message', listener);
          resolve(true);
        }
      };

      // Send the check request
      window.postMessage({ type: 'CHECK_EXTENSION', from: 'page' }, '*');

      window.addEventListener('message', listener);


      // Fallback timeout
      setTimeout(() => {
        console.log("Didnt happen")
        window.removeEventListener('message', listener);
        resolve(false);
      }, timeout);
    });
  }


  async function handleSignUp() {
    try {
      error.value = null;
      data.loading = true;

      if (data.email === "" || data.name === "") {
        error.value = "All fields must be filled";
        return;
      }

      // Check for extension
      // const installed = await isExtensionInstalled();
      // if (!installed) {
      //   // Redirect to Chrome Web Store
      //   window.open("https://chrome.google.com/webstore/detail/YOUR-EXTENSION-ID-HERE", "_blank");
      //   return;
      // }

      // Proceed with signup if extension is present
      const result = await auth.signUp(data.name, data.email);

      if (!result.success) {
        error.value = result.message;
        return;
      }

      message.value = result.message;

    } catch (err) {
      error.value = err.message || "An unexpected error occurred.";
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
        <h1 className="text-3xl font-bold text-foreground">Create your account</h1>
        <p className="mt-2 text-muted-foreground">Join thousands of professionals using Tatalina AI</p>
      </div>


      <div class="w-[50%] py-10 px-5 border-[1px] border-gray-300 rounded-lg bg-[#F4F9FF]">
        <div class="mb-4 text-center">
          <h1 class="text-xl text-foreground font-bold mb-2">Sign Up</h1>
          <p class="text-foreground">Create your account to get started with Tatalina AI</p>
        </div>

        <form @submit.prevent="handleSignUp()" class="flex flex-col items-center gap-4">
          <input type="text" v-model="data.name"  class="focus:ring-2 focus:ring-blue-500/50 w-full p-2 border-[1px] border-gray-300 rounded-lg outline-none" placeholder="Enter name">
          <input type="email" v-model="data.email" class="focus:ring-2 focus:ring-blue-500/50 w-full p-2 border-[1px] border-gray-300 rounded-lg outline-none" placeholder="Enter email">
          <p class="text-red-400" v-if="error">* {{ error }}</p>
          <p class="text-green-400" v-if="message">{{ message }}</p>
          <p class="text-yellow-600" v-if="data.loading">Loading...</p>
          <button v-else type="submit" class="px-4 py-2 bg-primary-500 text-white w-[40%] rounded-lg hover:bg-blue-500 transition duration-300 cursor-pointer">Sign Up</button>
        </form>
      
      </div>


    </div>
  </main>
</template>