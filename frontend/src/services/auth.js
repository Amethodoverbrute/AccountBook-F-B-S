import axios from "axios";

// 创建axios实例
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
});

// 请求拦截器，添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 认证相关的API调用
export const authService = {
  // 登录
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  // 注册
  register: async (username, password) => {
    const response = await api.post("/auth/register", { username, password });
    return response.data;
  },

  // 退出登录
  logout: () => {
    localStorage.removeItem("token");
  },

  // 检查是否已登录
  isLoggedIn: () => {
    return !!localStorage.getItem("token");
  },

  // 获取当前token
  getToken: () => {
    return localStorage.getItem("token");
  },
  
  // 获取当前登录用户信息
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      return null;
    }
  },
};

// 账单相关的API调用
export const accountService = {
  // 获取账单列表
  getAccounts: async () => {
    const response = await api.get("/account");
    return response.data;
  },

  // 获取单个账单
  getAccount: async (id) => {
    const response = await api.get(`/account/${id}`);
    return response.data;
  },

  // 创建账单
  createAccount: async (account) => {
    const response = await api.post("/account", account);
    return response.data;
  },

  // 更新账单
  updateAccount: async (id, account) => {
    const response = await api.patch(`/account/${id}`, account);
    return response.data;
  },

  // 删除账单
  deleteAccount: async (id) => {
    const response = await api.delete(`/account/${id}`);
    return response.data;
  },
};

// 统计相关的API调用
export const statisticsService = {
  // 获取账单统计数据
  getStatistics: async (params) => {
    const response = await api.get("/statistics", { params });
    return response.data;
  },
};

// 分类相关的API调用
export const categoryService = {
  // 获取分类列表
  getCategories: async (params) => {
    const response = await api.get("/categories", { params });
    return response.data;
  },
  
  // 获取单个分类
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  // 创建分类
  createCategory: async (category) => {
    const response = await api.post("/categories", category);
    return response.data;
  },
  
  // 更新分类
  updateCategory: async (id, category) => {
    const response = await api.patch(`/categories/${id}`, category);
    return response.data;
  },
  
  // 删除分类
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default api;
