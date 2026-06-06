/**
 * 路由配置文件
 * 功能：定义应用的路由规则，配置路由守卫，管理页面导航
 */

// 导入Vue Router的核心函数
import { createRouter, createWebHistory } from 'vue-router';

// 导入路由组件
import Login from '../components/pages/Login.vue'; // 登录组件
import Register from '../components/pages/Register.vue'; // 注册组件
import Home from '../components/pages/Home.vue'; // 首页组件（账单管理）
import Statistics from '../components/pages/Statistics.vue'; // 统计组件

// 导入管理员页面组件
import AdminLogin from '../components/pages/AdminLogin.vue'; // 管理员登录组件
import AdminDashboard from '../components/pages/AdminDashboard.vue'; // 后台管理仪表盘
import UserManagement from '../components/pages/UserManagement.vue'; // 用户管理页面
import SystemStatistics from '../components/pages/SystemStatistics.vue'; // 系统统计页面

// 导入认证服务，用于检查用户登录状态
import { authService } from '../services/auth';

// 创建路由实例
const router = createRouter({
  // 使用HTML5历史模式，URL中不带#号
  history: createWebHistory(),
  // 定义路由规则数组
  routes: [
    {
      path: '/', // 路由路径
      name: 'landing', // 路由名称
      // 懒加载组件，提高初始加载速度
      component: () => import('../components/pages/LandingPage.vue'),
    },
    {
      path: '/dashboard', // 仪表盘路径
      name: 'home', // 路由名称
      component: Home, // 组件
      meta: { requiresAuth: true }, // 元信息：需要登录才能访问
    },
    {
      path: '/statistics', // 统计页面路径
      name: 'statistics', // 路由名称
      component: Statistics, // 组件
      meta: { requiresAuth: true }, // 元信息：需要登录才能访问
    },
    {
      path: '/login', // 登录页面路径
      name: 'login', // 路由名称
      component: Login, // 组件
    },
    {
      path: '/register', // 注册页面路径
      name: 'register', // 路由名称
      component: Register, // 组件
    },
    // 管理员路由
    {
      path: '/admin/login', // 管理员登录页面
      name: 'adminLogin', // 路由名称
      component: AdminLogin, // 组件
    },
    {
      path: '/admin/dashboard', // 后台管理仪表盘
      name: 'adminDashboard', // 路由名称
      component: AdminDashboard, // 组件
      meta: { requiresAuth: true, requiresAdmin: true }, // 元信息：需要登录且需要管理员权限
    },
    {
      path: '/admin/users', // 用户管理页面
      name: 'adminUsers', // 路由名称
      component: UserManagement, // 组件
      meta: { requiresAuth: true, requiresAdmin: true }, // 元信息：需要登录且需要管理员权限
    },
    {
      path: '/admin/statistics', // 系统统计页面
      name: 'adminStatistics', // 路由名称
      component: SystemStatistics, // 组件
      meta: { requiresAuth: true, requiresAdmin: true }, // 元信息：需要登录且需要管理员权限
    },
  ],
});

// 全局前置 路由守卫：在路由跳转前 执行
router.beforeEach(async (to, from, next) => {
  // to: 要跳转到的路由对象
  // from: 从哪个路由跳转过来
  // next: 继续跳转的函数

  // 检查目标路由是否需要认证
  if (to.meta.requiresAuth) {
    // 检查用户是否登录
    if (!authService.isLoggedIn()) {
      // 需要认证但未登录，跳转到相应的登录页面
      if (to.meta.requiresAdmin) {
        next('/admin/login');
      } else {
        next('/login');
      }
      return;
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin) {
      try {
        // 获取用户信息
        const userInfo = await authService.getUserInfo();
        // 检查用户角色是否为管理员或超级管理员
        if (userInfo.role !== 'admin' && userInfo.role !== 'superAdmin') {
          // 没有管理员权限，跳转到普通用户的首页
          next('/dashboard');
          return;
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 获取用户信息失败，跳转到登录页面
        if (to.meta.requiresAdmin) {
          next('/admin/login');
        } else {
          next('/login');
        }
        return;
      }
    }
  }

  // 允许跳转，继续执行
  next();
});

// 导出路由实例，供main.js使用
export default router;
