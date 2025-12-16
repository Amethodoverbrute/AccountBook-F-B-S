<template>
  <!-- 固定头部 - 参考小米官网设计 -->
  <header class="fixed-header">
    <div class="header-content">
      <!-- Logo区域 -->
      <div class="logo-section">
        <img
          src="/logo/AccountBookLogo.png"
          alt="记账本Logo"
          class="app-logo"
        />
      </div>
      <!-- 网站标题 - 居中显示 -->
      <h1 class="site-title">
        {{ userInfo ? `${userInfo.username}的记账本` : "我的记账本" }}
      </h1>
      <!-- 登录注册区域 -->
      <div class="auth-section">
        <span v-if="!userInfo" class="auth-links">
          <a href="/login" class="login-link">登录</a>
          <span class="separator">|</span>
          <a href="/register" class="register-link">注册</a>
        </span>
        <span v-else class="user-info">
          {{ userInfo.username }}
          <span class="separator">|</span>
          <button @click="showLogoutConfirm = true" class="logout-btn-header">
            退出登录
          </button>
        </span>
      </div>
    </div>
  </header>

  <!-- 确认对话框组件 -->
  <ConfirmDialog
    v-model:visible="showConfirmDialog"
    :title="confirmTitle"
    :message="confirmMessage"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />

  <!-- 退出登录确认对话框 -->
  <ConfirmDialog
    v-model:visible="showLogoutConfirm"
    title="退出登录"
    message="确定要退出登录吗？"
    @confirm="handleLogoutConfirm"
    @cancel="showLogoutConfirm = false"
  />

  <!-- 主要内容容器 -->
  <div class="home-container">
    <!-- 添加/编辑账单表单（模态对话框） -->
    <div class="modal-overlay" v-if="showForm" @click.self="showForm = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ isEditing ? "编辑账单" : "添加账单" }}</h3>
          <button type="button" @click="showForm = false" class="close-btn">
            ×
          </button>
        </div>
        <div class="modal-body">
          <form
            @submit.prevent="isEditing ? handleEditAccount : handleAddAccount"
          >
            <div class="form-row">
              <div class="form-group">
                <label for="title">标题</label>
                <input
                  type="text"
                  id="title"
                  v-model="newAccount.title"
                  required
                  placeholder="请输入账单标题"
                />
              </div>
              <div class="form-group">
                <label for="amount">金额</label>
                <input
                  type="number"
                  id="amount"
                  v-model="newAccount.amount"
                  required
                  step="0.01"
                  placeholder="请输入金额"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="type">类型</label>
                <select id="type" v-model="newAccount.type" required>
                  <option value="">请选择类型</option>
                  <option value="expense">支出</option>
                  <option value="income">收入</option>
                </select>
              </div>
              <div class="form-group">
                <label for="time">时间</label>
                <input
                  type="datetime-local"
                  id="time"
                  v-model="newAccount.time"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="category">分类</label>
                <select id="category" v-model="newAccount.categoryId">
                  <option value="">请选择分类</option>
                  <option
                    v-for="category in filteredCategories"
                    :key="category._id"
                    :value="category._id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="remark">备注</label>
              <textarea
                id="remark"
                v-model="newAccount.remark"
                placeholder="请输入备注信息"
                rows="2"
              ></textarea>
            </div>
            <div class="form-buttons">
              <button
                type="button"
                @click="isEditing ? handleEditAccount() : handleAddAccount()"
                class="submit-btn"
              >
                保存
              </button>
              <button
                type="button"
                @click="showForm = false"
                class="cancel-btn"
              >
                取消
              </button>
            </div>
          </form>
          <div class="error-message" v-if="addError">{{ addError }}</div>
          <div class="success-message" v-if="addSuccess">{{ addSuccess }}</div>
        </div>
      </div>
    </div>

    <!-- 搜索组件 -->
    <div class="search-container">
      <div class="search-box" ref="searchBoxRef">
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索账单标题..."
          class="search-input"
          @keyup.enter="handleSearch"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <button @click="handleSearch" class="search-btn">搜索</button>
        <button @click="openForm" class="nav-btn add-btn-search">
          添加账单
        </button>
        <button @click="goToStatistics" class="nav-btn stats-btn-search">
          账单统计
        </button>
        <button
          @click="handleResetSearch"
          class="reset-btn"
          v-if="searchKeyword"
        >
          重置
        </button>
        <!-- 搜索建议下拉列表 -->
        <div
          v-if="showSuggestions && suggestions.length > 0"
          class="suggestions-list"
        >
          <div
            v-for="suggestion in suggestions"
            :key="suggestion._id"
            class="suggestion-item"
            @click="selectSuggestion(suggestion.title)"
            @mousedown.prevent
          >
            <span class="suggestion-text">{{ suggestion.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 账单列表 -->
    <div class="accounts-container">
      <div
        class="account-card"
        v-for="account in accounts"
        :key="account._id"
        :class="account.type === 'income' ? 'income-card' : 'expense-card'"
      >
        <div class="account-time">{{ formatDate(account.time) }}</div>
        <div class="account-content">
          <div class="account-title">{{ account.title }}</div>
          <div class="account-info">
            <span class="account-type" :class="account.type">{{
              account.type === "income" ? "收入" : "支出"
            }}</span>
            <span class="account-amount">{{ account.amount }} 元</span>
            <button
              @click="handleEditAccountClick(account)"
              class="edit-btn"
              title="编辑"
            >
              ✏️
            </button>
            <button
              @click="handleDeleteAccount(account._id)"
              class="delete-btn"
              title="删除"
            >
              ×
            </button>
          </div>
        </div>
      </div>
      <div class="empty-message" v-if="accounts.length === 0">暂无账单记录</div>
    </div>
  </div>

  <!-- 独立的分页组件，放在页面最下方 -->
  <div class="page-footer">
    <div class="pagination-wrapper" v-if="totalPages > 1 || totalRecords > 0">
      <div class="pagination">
        <div class="pagination-info">
          <span>共 {{ totalRecords }} 条记录</span>
          <span>第 {{ currentPage }}/{{ totalPages }} 页</span>
        </div>
        <div class="pagination-controls">
          <div class="page-size-selector">
            <label>每页显示:</label>
            <select v-model="pageSize" @change="handlePageSizeChange">
              <option :value="5">5条</option>
              <option :value="10">10条</option>
              <option :value="20">20条</option>
              <option :value="50">50条</option>
            </select>
          </div>
          <div class="pagination-nav">
            <button
              @click="firstPage"
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              首页
            </button>
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              上一页
            </button>
            <div class="current-page">{{ currentPage }}</div>
            <div class="page-jump">
              <input
                type="number"
                v-model="jumpPage"
                :min="1"
                :max="totalPages"
                class="page-input"
              />
              <button @click="handleJump" class="jump-button">跳转</button>
            </div>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              下一页
            </button>
            <button
              @click="lastPage"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              末页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 页面底部口号 -->
  <div class="page-slogan">
    <h2 class="slogan-text">科技美好生活</h2>
  </div>
</template>

<script setup>
/**
 * 主页组件
 * 功能：展示和管理用户的账单列表，提供添加、编辑、删除、搜索和分页功能
 * 主要模块：
 * - 固定头部：显示用户信息和导航
 * - 搜索组件：提供账单搜索和筛选功能
 * - 账单列表：展示账单信息，支持编辑和删除
 * - 添加/编辑表单：用于创建和修改账单
 * - 分页组件：提供账单分页浏览功能
 * - 确认对话框：用于处理删除和退出登录等敏感操作
 */
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { authService, accountService, categoryService } from "../services/auth";
import ConfirmDialog from "./ConfirmDialog.vue";

const router = useRouter();
const accounts = ref([]);
const isLoading = ref(true);
const addError = ref("");
const addSuccess = ref("");
const showForm = ref(false); // 控制添加账单表单的显示/隐藏
const isEditing = ref(false); // 控制表单是添加模式还是编辑模式
const editAccountId = ref(null); // 存储当前正在编辑的账单ID
const userInfo = ref(null); // 存储当前登录用户信息
// 分类相关状态
const categories = ref([]);
const isCategoriesLoading = ref(false);
const isInitializingForm = ref(false);

// 搜索相关状态
const searchKeyword = ref("");
const suggestions = ref([]);
const showSuggestions = ref(false);
const searchBoxRef = ref(null);
const allTitles = ref([]);

// 分页相关状态
const currentPage = ref(1);
const pageSize = ref(5);
const totalRecords = ref(0);
const totalPages = ref(0);
const jumpPage = ref(1);

// 确认对话框相关状态
const showConfirmDialog = ref(false);
const showLogoutConfirm = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmCallback = ref(null);

// 删除账单相关状态
const accountToDelete = ref(null);

// 计算属性：根据当前账单类型过滤分类
const filteredCategories = computed(() => {
  if (!newAccount.value.type) return [];
  return categories.value.filter(
    (category) => category.type === newAccount.value.type
  );
});

// 初始化时间为当前本地时间
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const hour = String(now.getHours()).padStart(2, "0");
const minute = String(now.getMinutes()).padStart(2, "0");

const newAccount = ref({
  title: "",
  amount: "",
  type: "",
  time: `${year}-${month}-${day}T${hour}:${minute}`,
  remark: "",
  categoryId: null,
});

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 添加账单
const handleAddAccount = async () => {
  try {
    console.log("开始添加账单...");
    addError.value = "";
    addSuccess.value = "";

    // 表单验证
    if (!newAccount.value.title.trim()) {
      addError.value = "请输入账单标题";
      console.log("验证失败: 缺少账单标题");
      return;
    }
    if (
      !newAccount.value.amount ||
      isNaN(parseFloat(newAccount.value.amount))
    ) {
      addError.value = "请输入有效的金额";
      console.log("验证失败: 无效金额");
      return;
    }
    if (!newAccount.value.type) {
      addError.value = "请选择账单类型";
      console.log("验证失败: 缺少账单类型");
      return;
    }
    if (!newAccount.value.categoryId) {
      addError.value = "请选择账单分类";
      console.log("验证失败: 缺少账单分类");
      return;
    }

    // 转换金额为数字类型
    const accountData = {
      ...newAccount.value,
      amount: parseFloat(newAccount.value.amount),
    };
    console.log("准备发送API请求:", accountData);

    // 发送API请求
    const response = await accountService.createAccount(accountData);
    console.log("API响应:", response);

    if (response.code === "0000") {
      addSuccess.value = "账单添加成功";
      console.log("账单添加成功");
      // 清空表单
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");

      newAccount.value = {
        title: "",
        amount: "",
        type: "expense", // 设置默认类型为支出
        time: `${year}-${month}-${day}T${hour}:${minute}`,
        remark: "",
        categoryId: null,
      };
      // 重新获取账单列表
      fetchAccounts();
      // 1秒后收起表单
      setTimeout(() => {
        showForm.value = false;
      }, 1000);
      // 3秒后清除成功提示
      setTimeout(() => {
        addSuccess.value = "";
      }, 3000);
    } else {
      addError.value = response.msg || "添加失败";
      console.log("添加失败:", response.msg);
    }
  } catch (err) {
    console.error("添加账单异常:", err);
    addError.value = err.response?.data?.msg || "网络错误，请稍后重试";
  }
};

// 点击编辑按钮处理函数
const handleEditAccountClick = (account) => {
  // 设置为编辑模式
  isEditing.value = true;
  // 存储当前编辑的账单ID
  editAccountId.value = account._id;
  // 设置初始化标志
  isInitializingForm.value = true;
  // 填充表单数据
  newAccount.value = {
    title: account.title,
    amount: account.amount.toString(),
    type: account.type,
    time: new Date(account.time).toISOString().slice(0, 16), // 转换为datetime-local格式
    remark: account.remark || "",
    categoryId: account.categoryId || null,
  };
  // 显示表单
  showForm.value = true;
  // 使用setTimeout在表单初始化完成后重置标志
  setTimeout(() => {
    isInitializingForm.value = false;
  }, 0);
};

// 编辑账单
const handleEditAccount = async () => {
  try {
    console.log("开始编辑账单...");
    addError.value = "";
    addSuccess.value = "";

    // 表单验证
    if (!newAccount.value.title.trim()) {
      addError.value = "请输入账单标题";
      console.log("验证失败: 缺少账单标题");
      return;
    }
    if (
      !newAccount.value.amount ||
      isNaN(parseFloat(newAccount.value.amount))
    ) {
      addError.value = "请输入有效的金额";
      console.log("验证失败: 无效金额");
      return;
    }
    if (!newAccount.value.type) {
      addError.value = "请选择账单类型";
      console.log("验证失败: 缺少账单类型");
      return;
    }
    if (!newAccount.value.categoryId) {
      addError.value = "请选择账单分类";
      console.log("验证失败: 缺少账单分类");
      return;
    }

    // 转换金额为数字类型
    const accountData = {
      ...newAccount.value,
      amount: parseFloat(newAccount.value.amount),
    };
    console.log("准备发送编辑API请求:", accountData);

    // 发送API请求
    const response = await accountService.updateAccount(
      editAccountId.value,
      accountData
    );
    console.log("编辑API响应:", response);

    if (response.code === "0000") {
      addSuccess.value = "账单编辑成功";
      console.log("账单编辑成功");
      // 清空表单
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");

      newAccount.value = {
        title: "",
        amount: "",
        type: "expense", // 设置默认类型为支出
        time: `${year}-${month}-${day}T${hour}:${minute}`,
        remark: "",
        categoryId: null,
      };
      // 重置编辑状态
      isEditing.value = false;
      editAccountId.value = null;
      // 重新获取账单列表
      fetchAccounts();
      // 1秒后收起表单
      setTimeout(() => {
        showForm.value = false;
      }, 1000);
      // 3秒后清除成功提示
      setTimeout(() => {
        addSuccess.value = "";
      }, 3000);
    } else {
      addError.value = response.msg || "编辑失败";
      console.log("编辑失败:", response.msg);
    }
  } catch (err) {
    console.error("编辑账单异常:", err);
    addError.value = err.response?.data?.msg || "网络错误，请稍后重试";
  }
};

// 删除账单
const handleDeleteAccount = (id) => {
  accountToDelete.value = id;
  confirmTitle.value = "删除账单";
  confirmMessage.value = "确定要删除这条账单吗？";
  showConfirmDialog.value = true;
};

// 确认对话框确认回调
const handleConfirm = async () => {
  showConfirmDialog.value = false;
  if (accountToDelete.value) {
    try {
      const response = await accountService.deleteAccount(
        accountToDelete.value
      );
      if (response.code === "0000") {
        // 重新获取账单列表
        fetchAccounts();
      } else {
        alert(response.msg || "删除失败");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "网络错误，请稍后重试");
    } finally {
      accountToDelete.value = null;
    }
  }
};

// 确认对话框取消回调
const handleCancel = () => {
  showConfirmDialog.value = false;
  accountToDelete.value = null;
};

// 退出登录确认回调
const handleLogoutConfirm = () => {
  showLogoutConfirm.value = false;
  authService.logout();
  router.push("/login");
};

// 打开添加账单表单，设置默认时间为当前时间，其他字段为空
const openForm = () => {
  // 设置为添加模式
  isEditing.value = false;
  // 重置编辑ID
  editAccountId.value = null;
  // 清空表单字段
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  // 重置整个newAccount对象，设置合理的默认值
  newAccount.value = {
    title: "",
    amount: "",
    type: "expense", // 设置默认类型为支出
    time: `${year}-${month}-${day}T${hour}:${minute}`,
    remark: "",
    categoryId: null,
  };
  // 清除之前的错误和成功信息
  addError.value = "";
  addSuccess.value = "";
  // 显示表单
  showForm.value = true;
};

// 跳转到统计页面
const goToStatistics = () => {
  router.push("/statistics");
};

// 退出登录
const handleLogout = () => {
  if (confirm("确定要退出登录吗？")) {
    authService.logout();
    router.push("/login");
  }
};

// 获取当前登录用户信息
const fetchUserInfo = async () => {
  try {
    const response = await authService.getCurrentUser();
    if (response && response.code === "0000") {
      userInfo.value = response.data;
    } else if (response && response.code === "401") {
      // 未授权，跳转到登录页
      router.push("/login");
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    // 如果获取用户信息失败，跳转到登录页
    router.push("/login");
  }
};

// 获取分类列表
const fetchCategories = async () => {
  try {
    isCategoriesLoading.value = true;
    const response = await categoryService.getCategories();
    if (response.code === "0000") {
      categories.value = response.data;
    }
  } catch (err) {
    console.error("获取分类列表失败:", err);
  } finally {
    isCategoriesLoading.value = false;
  }
};

// 监听账单类型变化，动态更新可用分类
watch(
  () => newAccount.value.type,
  (newType) => {
    // 仅在非初始化状态下重置分类选择
    if (!isInitializingForm.value) {
      newAccount.value.categoryId = null;
    }
  }
);

// 页面加载时获取账单列表、用户信息和分类列表
onMounted(async () => {
  await fetchUserInfo();
  fetchAccounts();

  // 获取分类列表
  fetchCategories();
});

// 页面卸载时的清理工作
onUnmounted(() => {
  // 暂无需要清理的资源
});

// 搜索处理函数
const handleSearch = () => {
  fetchAccounts();
  showSuggestions.value = false;
};

// 重置搜索
const handleResetSearch = () => {
  searchKeyword.value = "";
  suggestions.value = [];
  showSuggestions.value = false;
  fetchAccounts();
};

// 处理输入事件，更新搜索建议
const handleInput = () => {
  if (!searchKeyword.value.trim()) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  // 从所有账单标题中筛选匹配的建议
  const filtered = accounts.value
    .filter((account) =>
      account.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
    .map((account) => ({
      _id: account._id,
      title: account.title,
    }));

  // 去重，确保每个标题只出现一次
  const uniqueSuggestions = Array.from(
    new Map(filtered.map((item) => [item.title, item])).values()
  );

  suggestions.value = uniqueSuggestions;
  showSuggestions.value = suggestions.value.length > 0;
};

// 处理聚焦事件，显示搜索建议
const handleFocus = () => {
  if (searchKeyword.value.trim() && suggestions.value.length > 0) {
    showSuggestions.value = true;
  }
};

// 处理失焦事件，隐藏搜索建议
const handleBlur = () => {
  // 使用setTimeout确保点击建议项的事件能被触发
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

// 选择搜索建议
const selectSuggestion = (title) => {
  searchKeyword.value = title;
  handleSearch();
};

// 处理每页显示条数变化
const handlePageSizeChange = () => {
  currentPage.value = 1; // 切换每页显示条数时重置到第一页
  fetchAccounts();
};

// 跳转到指定页码
const goToPage = (page) => {
  // 边界检查
  if (page < 1) page = 1;
  if (page > totalPages.value) page = totalPages.value;

  currentPage.value = page;
  jumpPage.value = page;
  fetchAccounts();
};

// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
};

// 下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
};

// 首页
const firstPage = () => {
  goToPage(1);
};

// 末页
const lastPage = () => {
  goToPage(totalPages.value);
};

// 处理页码跳转
const handleJump = () => {
  goToPage(parseInt(jumpPage.value));
};

// 在获取账单列表后刷新统计数据
const fetchAccounts = async () => {
  try {
    isLoading.value = true;
    // 传递搜索关键字、页码和每页条数到API
    const response = await accountService.getAccounts(
      searchKeyword.value,
      currentPage.value,
      pageSize.value
    );
    if (response.code === "0000") {
      accounts.value = response.data.accounts;
      // 更新分页状态
      totalRecords.value = response.data.pagination.total;
      totalPages.value = response.data.pagination.totalPages;
      // 更新所有账单标题，用于搜索建议
      allTitles.value = accounts.value.map((account) => account.title);
    }
  } catch (err) {
    console.error("获取账单失败:", err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.home-container {
  width: 1080px;
  margin: 90px auto 20px;
  padding: 25px;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: auto;
}

/* 搜索组件样式 */
.search-container {
  background-color: white;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.search-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.search-box {
  display: flex;
  gap: 12px;
  align-items: center;
  position: relative;
  width: 100%;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  transform: translateY(-1px);
}

/* 按钮基础样式 */
.search-btn,
.reset-btn,
.nav-btn,
.submit-btn,
.cancel-btn,
.pagination-btn,
.jump-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}

/* 搜索按钮 */
.search-btn {
  background-color: #1890ff;
  color: white;
}

.search-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

/* 重置按钮 */
.reset-btn {
  background-color: #f0f0f0;
  color: #666;
  border: 1px solid #d9d9d9;
}

.reset-btn:hover {
  background-color: #e8e8e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 导航按钮 */
.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

/* 搜索栏中的导航按钮 */
.add-btn-search {
  background-color: #fa8c16;
  color: white;
  margin-left: 8px;
}

.add-btn-search:hover {
  background-color: #ffad33;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(250, 140, 22, 0.2);
}

.stats-btn-search {
  background-color: #52c41a;
  color: white;
  margin-left: 8px;
}

.stats-btn-search:hover {
  background-color: #73d13d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.2);
}

/* 搜索建议样式 */
.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
  color: #1890ff;
}

.suggestion-item:active {
  background-color: #e6f7ff;
}

.suggestion-text {
  font-size: 14px;
  color: #333;
}

.suggestion-item:hover .suggestion-text {
  color: #1890ff;
}

/* 滚动条样式 */
.suggestions-list::-webkit-scrollbar {
  width: 6px;
}

.suggestions-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 经典分页样式美化 */
.pagination-wrapper {
  max-width: 1080px;
  margin: 0 auto;
  width: 95%;
  box-sizing: border-box;
  padding: 0 20px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* 每页显示条数选择器 */
.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.page-size-selector label {
  font-weight: 500;
  color: #555;
}

.page-size-selector select {
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background-color: white;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-size-selector select:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.page-size-selector select:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

/* 分页导航 */
.pagination-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.pagination-btn {
  padding: 8px 14px;
  border: 1px solid #e1e5e9;
  background-color: white;
  color: #555;
  min-width: 65px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
  background-color: #f0f7ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  background-color: #f8f9fa;
  border-color: #e1e5e9;
  color: #c0c4c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination-btn:active:not(:disabled) {
  background-color: #e6f7ff;
  border-color: #40a9ff;
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(24, 144, 255, 0.2);
}

/* 当前页码样式 */
.current-page {
  padding: 8px 12px;
  border: 2px solid #1890ff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
  background-color: #f0f7ff;
  min-width: 40px;
  text-align: center;
}

/* 页码输入和跳转按钮 */
.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 6px;
}

.page-input {
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  width: 70px;
  text-align: center;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-input:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.page-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.jump-button {
  background-color: #1890ff;
  color: white;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.jump-button:hover {
  background-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transform: translateY(-1px);
}

.jump-button:active {
  background-color: #096dd9;
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
}

/* 页面底部样式 */
.page-footer {
  background-color: white;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding: 16px 0;
  margin: 15px 0 0 0;
}

/* 账单容器 */
.accounts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 15px;
}

/* 账单卡片 */
.account-card {
  background-color: white;
  padding: 0 18px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.account-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.account-card:hover::before {
  transform: scaleX(1);
}

.account-time {
  color: #333;
  font-size: 14px;
  padding: 12px 18px;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  margin: 0 -18px;
  flex: 1;
  display: flex;
  align-items: center;
}

/* 收入卡片时间行 */
.income-card .account-time {
  background-color: #e6f7ed;
}

/* 支出卡片时间行 */
.expense-card .account-time {
  background-color: #fde2e2;
}

.account-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: relative;
  flex: 1;
  padding-top: 16px;
}

.account-title {
  color: #333;
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  text-align: left;
  max-width: calc(100% - 250px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 35px;
  white-space: nowrap;
  min-width: 250px;
  justify-content: flex-end;
}

.account-type {
  width: 60px;
  text-align: center;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: #ffa940;
}

.account-amount {
  min-width: 100px;
  text-align: right;
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.account-type.expense {
  background-color: #ffa940;
}

.account-type.income {
  background-color: #73d13d;
}

/* 编辑和删除按钮 */
.edit-btn,
.delete-btn {
  padding: 4px 8px;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  color: #1890ff;
}

.edit-btn:hover {
  background-color: #f0f5ff;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);
}

.delete-btn {
  color: #ff4d4f;
  margin-left: 12px;
}

.delete-btn:hover {
  background-color: #f5f5f5;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(255, 77, 79, 0.2);
}

/* 空状态 */
.empty-message {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 表单样式 */
.form-row {
  display: flex;
  gap: 25px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.form-group {
  flex: 1;
  min-width: 220px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  transform: translateY(-1px);
}

/* 表单按钮 */
.form-buttons {
  display: flex;
  gap: 15px;
  margin-top: 25px;
  justify-content: center;
}

/* 提交按钮 */
.submit-btn {
  background-color: #52c41a;
  color: white;
}

.submit-btn:hover {
  background-color: #73d13d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.2);
}

/* 取消按钮 */
.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
  border: 1px solid #d9d9d9;
}

.cancel-btn:hover {
  background-color: #e8e8e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 模态对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-in-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 30px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 消息提示 */
.error-message,
.success-message {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 12px;
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease-in;
}

.error-message {
  color: #ff4d4f;
  background-color: #fff1f0;
}

.success-message {
  color: #52c41a;
  background-color: #f6ffed;
}

/* 固定头部样式 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  z-index: 1000;
  height: 60px;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.header-content {
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  position: relative;
}

.logo-section {
  position: absolute;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo {
  height: 36px;
  max-height: 100%;
  width: auto;
  cursor: pointer;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.app-logo:hover {
  transform: scale(1.05);
}

.site-title {
  text-align: center;
  margin: 0;
  flex: 1;
  max-width: 50%;
  font-size: 20px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-section {
  position: absolute;
  right: 20px;
  display: flex;
  align-items: center;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-link,
.register-link {
  text-decoration: none;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 4px;
}

.login-link:hover,
.register-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.separator {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 8px;
}

.user-info {
  font-size: 14px;
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 头部退出登录按钮 */
.logout-btn-header {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logout-btn-header:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  text-decoration: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 搜索框 */
  .search-box {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    min-width: auto;
  }

  /* 分页 */
  .pagination {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .pagination-info {
    justify-content: center;
  }

  .pagination-controls {
    justify-content: center;
  }

  .pagination-nav {
    justify-content: center;
  }

  .page-size-selector {
    justify-content: center;
  }

  /* 主容器 */
  .home-container {
    width: 95%;
    padding: 15px;
  }

  /* 表单 */
  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  /* 账单卡片 */
  .account-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .account-amount {
    margin-left: 0;
  }
}

@media (max-width: 576px) {
  /* 分页 */
  .pagination-nav {
    gap: 4px;
    padding: 6px;
  }

  .pagination-btn {
    padding: 6px 10px;
    min-width: 50px;
    font-size: 13px;
  }

  .page-input {
    width: 60px;
    padding: 6px 10px;
  }

  .jump-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .pagination-info {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  /* 账单卡片 */
  .account-card {
    padding: 16px;
  }

  .account-title {
    font-size: 15px;
  }

  .account-amount {
    font-size: 16px;
  }
}

/* 页面底部口号样式 */
.page-slogan {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 60px;
  margin: 20px 0 0 0;
  padding: 0;
  text-align: center;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.slogan-text {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1.5px;
  line-height: 1;
  padding: 0;
}
</style>
