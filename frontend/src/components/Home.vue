<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="empty-space"></div>
      <!-- 占位元素，用于居中标题 -->
      <h1 class="app-title">
        {{ userInfo ? `${userInfo.username}的记账本` : "我的记账本" }}
      </h1>
      <div class="nav-buttons">
        <button @click="openForm" class="add-btn">添加账单</button>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <!-- 添加账单表单（默认隐藏） -->
    <div class="add-form" v-if="showForm">
      <h3>添加账单</h3>
      <form @submit.prevent="handleAddAccount">
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
            <input type="datetime-local" id="time" v-model="newAccount.time" />
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
          <button type="submit" class="submit-btn">保存</button>
          <button type="button" @click="showForm = false" class="cancel-btn">
            取消
          </button>
        </div>
      </form>
      <div class="error-message" v-if="addError">{{ addError }}</div>
      <div class="success-message" v-if="addSuccess">{{ addSuccess }}</div>
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authService, accountService } from "../services/auth";

const router = useRouter();
const accounts = ref([]);
const isLoading = ref(true);
const addError = ref("");
const addSuccess = ref("");
const showForm = ref(false); // 控制添加账单表单的显示/隐藏
const userInfo = ref(null); // 存储当前登录用户信息
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

// 获取账单列表
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

// 添加账单
const handleAddAccount = async () => {
  try {
    addError.value = "";
    addSuccess.value = "";

    // 转换金额为数字类型
    const accountData = {
      ...newAccount.value,
      amount: parseFloat(newAccount.value.amount),
    };

    const response = await accountService.createAccount(accountData);
    if (response.code === "0000") {
      addSuccess.value = "账单添加成功";
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
        type: "",
        time: `${year}-${month}-${day}T${hour}:${minute}`,
        remark: "",
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
    }
  } catch (err) {
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

// 打开添加账单表单，设置默认时间为当前时间
const openForm = () => {
  showForm.value = true;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  newAccount.value.time = `${year}-${month}-${day}T${hour}:${minute}`;
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

// 页面加载时获取账单列表和用户信息
onMounted(async () => {
  await fetchUserInfo();
  fetchAccounts();
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  width: 900px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.empty-space {
  flex: 1;
}

.app-title {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.nav-buttons {
  display: flex;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
}

.logout-btn {
  padding: 10px 20px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #ff7875;
}

.add-btn {
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background-color: #40a9ff;
}

/* 添加账单表单（默认隐藏） */
.add-form {
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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
