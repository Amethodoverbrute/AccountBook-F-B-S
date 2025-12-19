<template>
  <div class="admin-login-container">
    <div class="login-card">
      <h2 class="login-title">管理员登录</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            type="text"
            id="username"
            v-model="loginForm.username"
            class="form-input"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
            type="password"
            id="password"
            v-model="loginForm.password"
            class="form-input"
            placeholder="请输入密码"
            required
          />
        </div>
        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../../services/auth';

// 路由实例
const router = useRouter();

// 登录表单数据
const loginForm = ref({
  username: '',
  password: '',
});

// 加载状态
const isLoading = ref(false);

// 错误信息
const errorMessage = ref('');

// 登录处理函数
const handleLogin = async () => {
  // 重置错误信息
  errorMessage.value = '';

  // 设置加载状态
  isLoading.value = true;

  try {
    // 调用登录API
    const response = await authService.login(
      loginForm.value.username,
      loginForm.value.password
    );

    // 获取用户信息，检查角色
    const userInfo = await authService.getUserInfo();

    // 检查用户是否为管理员或超级管理员
    if (userInfo.role === 'admin' || userInfo.role === 'superAdmin') {
      // 登录成功，跳转到后台管理页面
      router.push('/admin/dashboard');
    } else {
      // 不是管理员，显示错误信息
      errorMessage.value = '您没有管理员权限';
      // 清除token
      authService.logout();
    }
  } catch (error) {
    // 处理登录错误
    errorMessage.value = error.message || '登录失败，请检查用户名和密码';
  } finally {
    // 取消加载状态
    isLoading.value = false;
  }
};
</script>

<style scoped>
.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  color: #333;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
}

.login-btn {
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover:not(:disabled) {
  background-color: #66b1ff;
}

.login-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
}
</style>
