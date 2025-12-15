<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-buttons left">
        <button @click="goToStatistics" class="stats-btn">账单统计</button>
      </div>
      <!-- 占位元素，用于居中标题 -->
      <h1 class="app-title">
        {{ userInfo ? `${userInfo.username}的记账本` : "我的记账本" }}
      </h1>
      <div class="nav-buttons">
        <button @click="openForm" class="add-btn">添加账单</button>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </div>

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
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { authService, accountService, categoryService } from "../services/auth";

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
const handleDeleteAccount = async (id) => {
  if (confirm("确定要删除这条账单吗？")) {
    try {
      const response = await accountService.deleteAccount(id);
      if (response.code === "0000") {
        // 重新获取账单列表
        fetchAccounts();
      } else {
        alert(response.msg || "删除失败");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "网络错误，请稍后重试");
    }
  }
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
  authService.logout();
  router.push("/login");
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

// 在获取账单列表后刷新统计数据
const fetchAccounts = async () => {
  try {
    isLoading.value = true;
    const response = await accountService.getAccounts();
    if (response.code === "0000") {
      accounts.value = response.data;
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
  max-width: 2100px;
  width: 1080px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 优化顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
}

/* 优化按钮样式 */
.add-btn,
.logout-btn,
.submit-btn,
.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.add-btn:hover,
.logout-btn:hover,
.submit-btn:hover,
.cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 优化表单设计 */
.add-form {
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.add-form:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
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

/* 优化账单卡片样式 */
.account-card {
  background-color: white;
  padding: 0 20px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.account-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 优化统计容器样式 */
.statistics-container {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.statistics-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 优化图表容器样式 */
.chart-item {
  flex: 1;
  min-width: 400px;
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 优化按钮动画 */
button {
  transition: all 0.3s ease;
}

button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 优化空状态样式 */
.empty-message {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

/* 添加加载状态样式 */
.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* 优化错误和成功消息样式 */
.error-message,
.success-message {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 12px;
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 优化响应式设计 */
@media (max-width: 768px) {
  .home-container {
    width: 95%;
    padding: 15px;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .stats-summary {
    flex-direction: column;
    gap: 15px;
  }

  .charts-container {
    flex-direction: column;
  }

  .chart-item {
    min-width: auto;
  }

  .account-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .account-amount {
    margin-left: 0;
  }
}

/* 优化账单列表标题 */
.accounts-container h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
}

/* 优化编辑和删除按钮样式 */
.edit-btn,
.delete-btn {
  padding: 6px 10px;
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

.edit-btn:hover {
  background-color: #e6f7ff;
  color: #1890ff;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);
}

.delete-btn:hover {
  background-color: #fff1f0;
  color: #ff4d4f;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(255, 77, 79, 0.2);
}

/* 优化统计摘要样式 */
.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.stat-value:hover {
  transform: scale(1.05);
}

/* 添加卡片悬停效果 */
.account-card {
  background-color: white;
  padding: 0 20px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

/* 优化应用标题 */
.app-title {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  transition: all 0.3s ease;
}

.app-title:hover {
  color: #1890ff;
  transform: scale(1.02);
}

/* 统计容器 */
.statistics-container {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.statistics-container h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

/* 统计摘要 */
.stats-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.stat-item {
  text-align: center;
  padding: 0 20px;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
}

.stat-value.income {
  color: #73d13d;
}

.stat-value.expense {
  color: #ffa940;
}

.stat-value.balance {
  color: #1890ff;
}

/* 图表容器 */
.charts-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.chart-item {
  flex: 1;
  min-width: 400px;
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.chart-item h4 {
  color: #333;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

.chart {
  height: 300px;
  width: 100%;
}

/* 账单列表标题 */
.accounts-container h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 25px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.empty-space {
  flex: 1;
}

.app-title {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  text-align: center;
  flex: 2;
}

.nav-buttons {
  display: flex;
  gap: 16px;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
}

.nav-buttons.left {
  justify-content: flex-start;
}

/* 统一按钮样式 */
.stats-btn,
.add-btn,
.logout-btn {
  padding: 12px 24px;
  height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  min-width: 120px;
  margin: 0;
}

.stats-btn:hover,
.add-btn:hover,
.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 统计按钮样式 */
.stats-btn {
  background-color: #52c41a;
  color: white;
}

.stats-btn:hover {
  background-color: #73d13d;
}

/* 退出登录按钮样式 */
.logout-btn {
  background-color: #ff4d4f;
  color: white;
}

.logout-btn:hover {
  background-color: #ff7875;
}

/* 添加账单按钮样式 */
.add-btn {
  background-color: #1890ff;
  color: white;
}

.add-btn:hover {
  background-color: #40a9ff;
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
  padding: 25px;
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

/* 添加账单表单样式 */
.modal-body .form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.modal-body .form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.modal-body .form-group input,
.modal-body .form-group select,
.modal-body .form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.modal-body .form-group input:focus,
.modal-body .form-group select:focus,
.modal-body .form-group textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  transform: translateY(-1px);
}

.modal-body .form-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.modal-body .submit-btn,
.modal-body .cancel-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-body .submit-btn {
  background-color: #52c41a;
  color: white;
}

.modal-body .submit-btn:hover {
  background-color: #73d13d;
}

.modal-body .cancel-btn {
  background-color: #f0f0f0;
  color: #666;
  border: 1px solid #d9d9d9;
}

.modal-body .cancel-btn:hover {
  background-color: #e8e8e8;
}

.add-form h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
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
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #bfbfbf;
}

.form-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.submit-btn {
  padding: 10px 24px;
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: #73d13d;
}

.cancel-btn {
  padding: 10px 24px;
  background-color: #f0f0f0;
  color: #666;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: #e8e8e8;
}

/* 账单容器 */
.accounts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 账单卡片 */
.account-card {
  background-color: white;
  padding: 0 20px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.account-card:hover {
  box-shadow: none;
  transform: none;
}

/* 收入卡片 */
.income-card {
  background-color: white;
}

/* 支出卡片 */
.expense-card {
  background-color: white;
}

.account-time {
  color: #333;
  font-size: 14px;
  padding: 12px 20px;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  margin: 0 -20px;
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
  max-width: calc(100% - 250px); /* 减小最大宽度，给右侧区域更多空间 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 30px;
  white-space: nowrap;
  min-width: 230px; /* 增加最小宽度 */
  justify-content: flex-end;
}

.account-type {
  width: 60px; /* 设置固定宽度，确保所有类型标签对齐 */
  text-align: center;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: #ffa940;
}

.account-amount {
  min-width: 100px; /* 设置金额的最小宽度 */
  text-align: right;
  font-weight: 600;
}

.account-type.expense {
  background-color: #ffa940;
}

.account-type.income {
  background-color: #73d13d;
}

.account-amount {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.delete-btn {
  padding: 4px 8px;
  background-color: transparent;
  color: #ff4d4f;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 12px;
}

.delete-btn:hover {
  background-color: #f5f5f5;
  color: #ff4d4f;
  transform: scale(1.1); /* 悬停时稍微放大，增强交互感 */
}

.edit-btn {
  padding: 4px 8px;
  background-color: transparent;
  color: #1890ff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background-color: #f0f5ff;
  transform: scale(1.1); /* 悬停时稍微放大，增强交互感 */
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

/* 消息提示 */
.error-message {
  color: #ff4d4f;
  margin-top: 12px;
  padding: 10px 16px;
  background-color: #fff1f0;
  border-radius: 8px;
  font-size: 14px;
}

.success-message {
  color: #52c41a;
  margin-top: 12px;
  padding: 10px 16px;
  background-color: #f6ffed;
  border-radius: 8px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 15px;
  }

  .top-nav {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .nav-buttons {
    justify-content: space-between;
  }

  .nav-buttons button {
    flex: 1;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .account-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .account-amount {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 24px;
  }

  .nav-buttons {
    flex-direction: column;
    gap: 10px;
  }

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
</style>
