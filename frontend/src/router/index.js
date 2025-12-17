/**
 * 路由配置文件
 * 功能：定义应用的路由规则，配置路由守卫，管理页面导航
 */

// 导入Vue Router的核心函数
import { createRouter, createWebHistory } from "vue-router";

// 导入路由组件
import Login from "../components/pages/Login.vue"; // 登录组件
import Register from "../components/pages/Register.vue"; // 注册组件
import Home from "../components/pages/Home.vue"; // 首页组件（账单管理）
import Statistics from "../components/pages/Statistics.vue"; // 统计组件

// 导入认证服务，用于检查用户登录状态
import { authService } from "../services/auth";

// 创建路由实例
const router = createRouter({
  // 使用HTML5历史模式，URL中不带#号
  history: createWebHistory(),
  // 定义路由规则数组
  routes: [
    {
      path: "/", // 路由路径
      name: "landing", // 路由名称
      // 懒加载组件，提高初始加载速度
      component: () => import("../components/pages/LandingPage.vue"),
    },
    {
      path: "/dashboard", // 仪表盘路径
      name: "home", // 路由名称
      component: Home, // 组件
      meta: { requiresAuth: true }, // 元信息：需要登录才能访问
    },
    {
      path: "/statistics", // 统计页面路径
      name: "statistics", // 路由名称
      component: Statistics, // 组件
      meta: { requiresAuth: true }, // 元信息：需要登录才能访问
    },
    {
      path: "/login", // 登录页面路径
      name: "login", // 路由名称
      component: Login, // 组件
    },
    {
      path: "/register", // 注册页面路径
      name: "register", // 路由名称
      component: Register, // 组件
    },
  ],
});

// 全局前置路由守卫：在路由跳转前执行
router.beforeEach((to, from, next) => {
  // to: 要跳转到的路由对象
  // from: 从哪个路由跳转过来
  // next: 继续跳转的函数

  // 检查目标路由是否需要认证，且用户未登录
  if (to.meta.requiresAuth && !authService.isLoggedIn()) {
    // 需要认证但未登录，跳转到登录页
    next("/login");
  } else {
    // 允许跳转，继续执行
    next();
  }
});

// 导出路由实例，供main.js使用
export default router;
