import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import Home from "../components/Home.vue";
import Statistics from "../components/Statistics.vue";
import { authService } from "../services/auth";

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: "/statistics",
      name: "statistics",
      component: Statistics,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authService.isLoggedIn()) {
    // 需要认证但未登录，跳转到登录页
    next("/login");
  } else {
    next();
  }
});

export default router;
