/**
 * 应用服务层
 * 功能：封装所有与后端API的交互，包括认证、账单、统计和分类相关的API调用
 */
import axios from "axios";

/**
 * 创建axios实例
 * 配置：
 * - baseURL: 后端API的基础地址
 * - timeout: 请求超时时间（5秒）
 */
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
});

/**
 * 请求拦截器
 * 功能：在每个请求中自动添加token到Authorization头
 */
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem("token");
    if (token) {
      // 添加Bearer token到请求头
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 认证服务
 * 功能：处理用户登录、注册、退出登录等认证相关操作
 */
export const authService = {
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 登录结果，包含token和用户信息
   */
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    // 保存token到localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 注册结果
   */
  register: async (username, password) => {
    const response = await api.post("/auth/register", { username, password });
    return response.data;
  },

  /**
   * 用户退出登录
   * 功能：清除localStorage中的token
   */
  logout: () => {
    localStorage.removeItem("token");
  },

  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * 获取当前token
   * @returns {string|null} 当前登录用户的token
   */
  getToken: () => {
    return localStorage.getItem("token");
  },
  
  /**
   * 获取当前登录用户信息
   * @returns {Promise<Object|null>} 用户信息，获取失败返回null
   */
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

/**
 * 账单服务
 * 功能：处理账单的增删改查操作
 */
export const accountService = {
  /**
   * 获取账单列表
   * @param {string} search - 搜索关键字，用于模糊匹配账单标题
   * @param {number} page - 当前页码，默认1
   * @param {number} pageSize - 每页显示条数，默认10
   * @returns {Promise<Object>} 账单列表数据
   */
  getAccounts: async (search, page = 1, pageSize = 10) => {
    const params = {
      search,
      page,
      pageSize
    };
    // 移除undefined的参数
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key];
      }
    });
    const response = await api.get("/account", { params });
    return response.data;
  },

  /**
   * 获取单个账单详情
   * @param {string} id - 账单ID
   * @returns {Promise<Object>} 单个账单数据
   */
  getAccount: async (id) => {
    const response = await api.get(`/account/${id}`);
    return response.data;
  },

  /**
   * 创建新账单
   * @param {Object} account - 账单数据
   * @returns {Promise<Object>} 创建结果
   */
  createAccount: async (account) => {
    const response = await api.post("/account", account);
    return response.data;
  },

  /**
   * 更新账单
   * @param {string} id - 账单ID
   * @param {Object} account - 账单数据
   * @returns {Promise<Object>} 更新结果
   */
  updateAccount: async (id, account) => {
    const response = await api.patch(`/account/${id}`, account);
    return response.data;
  },

  /**
   * 删除账单
   * @param {string} id - 账单ID
   * @returns {Promise<Object>} 删除结果
   */
  deleteAccount: async (id) => {
    const response = await api.delete(`/account/${id}`);
    return response.data;
  },
};

/**
 * 统计服务
 * 功能：获取账单统计数据
 */
export const statisticsService = {
  /**
   * 获取账单统计数据
   * @param {Object} params - 查询参数，可包含startDate和endDate
   * @returns {Promise<Object>} 统计数据，包括总收入、总支出、趋势图数据等
   */
  getStatistics: async (params) => {
    const response = await api.get("/statistics", { params });
    return response.data;
  },
};

/**
 * 分类服务
 * 功能：处理分类的增删改查操作
 */
export const categoryService = {
  /**
   * 获取分类列表
   * @param {Object} params - 查询参数，可包含type（income/expense）
   * @returns {Promise<Object>} 分类列表数据
   */
  getCategories: async (params) => {
    const response = await api.get("/categories", { params });
    return response.data;
  },
  
  /**
   * 获取单个分类详情
   * @param {string} id - 分类ID
   * @returns {Promise<Object>} 单个分类数据
   */
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  /**
   * 创建新分类
   * @param {Object} category - 分类数据
   * @returns {Promise<Object>} 创建结果
   */
  createCategory: async (category) => {
    const response = await api.post("/categories", category);
    return response.data;
  },
  
  /**
   * 更新分类
   * @param {string} id - 分类ID
   * @param {Object} category - 分类数据
   * @returns {Promise<Object>} 更新结果
   */
  updateCategory: async (id, category) => {
    const response = await api.patch(`/categories/${id}`, category);
    return response.data;
  },
  
  /**
   * 删除分类
   * @param {string} id - 分类ID
   * @returns {Promise<Object>} 删除结果
   */
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// 导出axios实例，供特殊场景使用
export default api;
