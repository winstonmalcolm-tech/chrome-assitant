<script setup>
  import { onMounted, reactive, ref } from 'vue';
  import Auth from '@/services/auth';
  import Pay from '@/services/pay';
  import { LoaderCircle, Crown, Calendar, CheckCircle, TrendingUp, Users, CircleCheckBig, OctagonX, CalendarSync } from 'lucide-vue-next';
  import { initializePaddle } from '@paddle/paddle-js';
  import { jwtDecode } from "jwt-decode";

  const data = reactive({
    user: {},
    error: null,
    loading: true
  });

  const memberSince = ref('');
  const next_bill_date = ref('');
  const displayRemainingTokens = ref(0);
  const cancelLoading = ref(false);
  const alert = reactive({
    type: 'success',
    message: 'Your subscription',
    visible: false
  });

  const modalType = ref('');

  const auth = new Auth();
  const pay = new Pay();

  const getStatusColor = (status) => {
    if (typeof status !== 'string') return "bg-gray-100 text-gray-800 border-gray-200"
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "expired":
        return "bg-red-100 text-red-800 border-red-200"
      case "canceled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const openConfirmModal = (type) => {
    modalType.value = type;
    document.getElementById("confirmModal").showModal();
  }

  const resumeSubscription = async () => {
    // Implement resume subscription logic if needed
    try {
      cancelLoading.value = true;
      const result = await pay.resume();

      alert.visible = true;
      alert.type = result.success ? 'success' : 'error';
      alert.message = result.message;

      setTimeout(() => {
        alert.visible = false;
      }, 5000);

    } catch (error) {
      console.log("There is an error resuming the subscription");
    } finally {
      cancelLoading.value = false;
      document.getElementById("confirmModal").close();
      await fetchUser();
    }
  }

  const handleCancel = async () => {
    try {
      cancelLoading.value = true;
      const result = await pay.cancel();

      alert.visible = true;
      alert.type = result.success ? 'success' : 'error';
      alert.message = result.message;

      setTimeout(() => {
        alert.visible = false;
      }, 5000);

    } catch (error) {
      console.log("There is an error cancelling the subscription");
    } finally {
      cancelLoading.value = false;
      document.getElementById("confirmModal").close();
      await fetchUser();
    }
  }

  const handleUpgrade = async () => {
    const paddle = await initializePaddle({
        environment: 'sandbox', // or 'production'
        token: 'test_4b91c684f26ba94c7aae3ddc264' // from Paddle Billing dashboard
      })

    const id = jwtDecode(JSON.parse(localStorage.getItem("jwt")).accessToken).userId;

    paddle.Checkout.open({
      items: [{ priceId: 'pri_01k3pcwn1kawc8vha7p99n443k', quantity: 1 }],
      customData: {
        userId: id,
      },
      redirectUrl: 'https://alinea-ai.netlify.app/thank-you',
      settings: {
        displayMode: 'redirect'
      }
    })
  }

  const fetchUser = async () => {

    try {
     const result = await auth.getUser();

     if (!result.success) {
      data.error = result.message;
      return;
     }

     data.user = result.data.user;

     const remainingTokens = data.user.token_quota - data.user.total_tokens;
     displayRemainingTokens.value = (parseInt(remainingTokens) < 0) ? 0 : remainingTokens;

     let date = new Date(data.user.created_at);
     let formatted = date.toISOString().split("T")[0];
     memberSince.value = formatted

     date = data.user.next_bill_date ? new Date(data.user.next_bill_date) : null;
     formatted = date ? date.toISOString().split("T")[0] : "N/A";
     next_bill_date.value = formatted;

    } catch (error) {
      data.error = error.message;
    } finally {
      data.loading = false;
    }
  }
  
  onMounted(async () => {
    await fetchUser();
  })

</script>

<template>

  <div v-if="data.loading" class="w-full flex items-center justify-center">
    <LoaderCircle class="w-10 h-10 animate-spin text-foreground" />
  </div>

  <div v-else-if="data.error" class="w-full flex items-center justify-center">
    {{ data.error }}
  </div>

  <main v-else class="min-h-screen mt-6 px-2 sm:px-6 md:px-10 pb-10">
  <header class="mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome back, {{ data.user.username }} </h1>
    <p class="text-muted-foreground">Manage your subscription and view your usage statistics</p>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-[60%_40%] gap-5">
    <!-- Column 1 -->
    <div class="flex flex-col gap-10 w-full">
      <!-- Card 1 -->
      <div class="text-subtext p-4 w-full bg-card border-[1px] border-gray-200 rounded-lg">
        <header class="flex flex-col sm:flex-row justify-between">
          <div class="mb-6 sm:mb-8">
            <div class="flex items-center gap-2">
              <Crown class="w-6 h-6 text-primary-500"/>
              <h1 class="text-foreground font-bold text-lg">Current Plan</h1>
            </div>
            <p>Your subscription details and status</p>
          </div>
          <div :class="['flex h-fit p-2 items-center justify-center gap-2 rounded-lg', getStatusColor(data.user?.status)]">
            <CheckCircle class="w-4 h-4" />
            <p class="text-sm">{{ data.user.status }}</p>
          </div>
        </header>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Column 1 -->
          <div>
            <h1 class="mb-2 text-foreground font-bold text-xl">{{ data.user.plan_name }}</h1>
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4" />
              <p>{{ !data.user.cancel_at ? `Next Billing:` : `Cancelling On:` }} {{ next_bill_date }}</p>
            </div>
          </div>
          <!-- Column 2 -->
          <div class="flex flex-col items-center gap-2">
            <button
              v-if="data.user.plan_name.toLowerCase() == 'free plan'"
              @click="handleUpgrade()"
              class="bg-primary-500 w-full p-2 rounded-lg text-white flex items-center justify-center gap-2 hover:bg-blue-500 transition duration-300 cursor-pointer"
            ><TrendingUp class="w-4 h-4" />Upgrade to Pro</button>
            <button
              v-if="!data.user.cancel_at"
              class="hover:text-red-400 cursor-pointer transition duration-300"
              @click="openConfirmModal('cancel')"
            >Cancel Subscription</button>
            <button
              v-if="data.user.cancel_at && data.user.status.toLowerCase() == 'active'"
              @click="openConfirmModal('resume')"
              class="bg-primary-500 w-full p-2 rounded-lg text-white flex items-center justify-center gap-2 hover:bg-blue-500 transition duration-300 cursor-pointer"
            ><CalendarSync class="w-4 h-4" />Resume Subscription</button>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="text-subtext p-4 w-full bg-card border-[1px] border-gray-200 rounded-lg">
        <header class="flex flex-col sm:flex-row justify-between">
          <div class="mb-6 sm:mb-8">
            <div class="flex items-center gap-2">
              <TrendingUp class="w-6 h-6 text-primary-500"/>
              <h1 class="text-foreground font-bold text-lg">Usage this month</h1>
            </div>
            <p>Track your extension usage and limits</p>
          </div>
        </header>
        <div>
          <div class="flex justify-between">
            <p class="text-sm">Tokens used</p>
            <p class="text-sm">{{ (data.user.total_tokens > data.user.token_quota) ? data.user.token_quota : data.user.total_tokens }} / {{ data.user.token_quota }}</p>
          </div>
          <progress class="progress [&::-webkit-progress-value]:bg-primary-500 [&::-moz-progress-bar]:bg-primary-500 w-full rounded-lg" :value="data.user.total_tokens" :max="data.user.token_quota"></progress>
          <div class="flex justify-between">
            <p class="text-sm">{{ Math.floor((( ((data.user.total_tokens > data.user.token_quota) ? data.user.token_quota : data.user.total_tokens)  / data.user.token_quota) * 100) )}}% Used</p>
            <p class="text-sm">{{ displayRemainingTokens }} Remaining</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Column 2 -->
    <div class="w-full flex flex-col items-center gap-5">
      <!-- Card 1 -->
      <div class="text-subtext p-4 w-full sm:w-[80%] bg-card border-[1px] border-gray-200 rounded-lg">
        <header class="flex items-center gap-2">
          <Users class="w-5 h-5 text-primary-500"/>
          <p class="text-foreground text-lg">Account</p>
        </header>
        <div class="mt-5">
          <p class="text-foreground text-md">{{ data.user.username }}</p>
          <p class="text-md">{{ data.user.email }}</p>
        </div>
        <div class="mt-5">
          <p class="text-foreground text-md">Member Since</p>
          <p class="text-sm">{{ memberSince }}</p>
        </div>
      </div>
      <!-- Card 2 -->
      <div class="text-subtext p-4 w-full sm:w-[80%] bg-card border-[1px] border-gray-200 rounded-lg">
        <header class="mb-6 flex flex-col">
          <p class="text-foreground text-lg">Need help?</p>
          <p class="text-sm">Get support when you need it</p>
        </header>
        <a href="mailto:nativedev97@gmail.com" class="p-2 w-full border-[1px] border-gray-300 rounded-lg cursor-pointer hover:bg-primary-500 hover:text-white hover:border-none transition duration-300">Contact support</a>
      </div>
    </div>
  </div>

  <div v-if="alert.visible" role="alert" :class="['alert fixed left-1/2 -translate-x-1/2 top-20 z-50 shadow-lg text-white', alert.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
    <OctagonX v-if="alert.type === 'error'" class="w-6 h-6"/>
    <CircleCheckBig v-else class="w-6 h-6"/>
    <span>{{ alert.message }}</span>
  </div>

  <!-- Modal -->
  <dialog id="confirmModal" class="modal">
    <div class="modal-box bg-white rounded-lg">
      <h3 class="text-lg font-bold">{{ modalType == "cancel" ? "Are you sure?" : "Resume Confirmation" }}</h3>
      <p class="py-4">
        {{ modalType == "Cancel" ? "Cancelling your subscription will stop future billings, but you will retain access to your current plan until the end of the billing period." : "Resuming your subscription will reactivate your plan and billing cycle. You will regain access to all features associated with your plan." }}
      </p>
      <div class="modal-action">
        <span v-if="cancelLoading" class="loading loading-spinner text-primary-500"></span>
        <button v-else @click="modalType == 'cancel' ? handleCancel() : resumeSubscription()" :class="['btn text-white border-none cursor-pointer rounded-lg', modalType == 'cancel' ? 'bg-red-600' : 'bg-green-600' ]">{{modalType == "cancel" ? "Yes, Cancel Subscription" : "Yes, Resume Subscription"}}</button>
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn border-[1px] p-2" :disabled="cancelLoading">Cancel</button>
        </form>
      </div>
    </div>
  </dialog>
</main>
  
</template>