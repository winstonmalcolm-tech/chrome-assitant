import Dashboard from '@/pages/Dashboard.vue'
import Home from '@/pages/Home.vue'
import Pricing from '@/pages/Pricing.vue'
import SignIn from '@/pages/SignIn.vue'
import SignUp from '@/pages/SignUp.vue'
import Verify from '@/pages/Verify.vue'
import Privacy from '@/pages/Privacy.vue'
import TermsOfService from '@/pages/TermsOfService.vue'

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ThankYou from '@/pages/ThankYou.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Home,
      name: "home"
    },
    {
      path: "/pricing",
      component: Pricing,
      name: "pricing"
    },
    {
      path: "/signin",
      component: SignIn,
      name: "signin"
    },
    {
      path: "/signup",
      component: SignUp,
      name: "signup"
    },
    {
      path: "/dashboard",
      component: Dashboard,
      name: "dashboard",
      meta: {requiresAuth: true}
    },
    {
      path: "/verify",
      component: Verify,
      name: "verify",
    },
    {
      path: "/thank-you",
      component: ThankYou,
      name: "thankyou",
    },
    {
      path: "/privacy",
      component: Privacy,
      name: "Privacy"
    },
    {
      path: "/terms",
      component: TermsOfService,
      name: "terms"
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: Home,
    },

  ],
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top
    return { top: 0 }
  }

})

router.beforeEach((to) => {
  const userStore = useUserStore();

  const isAuth = userStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuth) {
    return {name: "signin"}
    
  } else if ((to.name == "signin" || to.name == "signup") && isAuth) {
    return {name: "dashboard"}
  }
  
})

export default router
