<template>
  <div class="login-container">
    <h2>管理员登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
          type="text"
          id="username"
          v-model="loginForm.username"
          required
          placeholder="请输入用户名"
        />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input
          type="password"
          id="password"
          v-model="loginForm.password"
          required
          placeholder="请输入密码"
        />
      </div>
      <button type="submit" class="login-btn" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </form>
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
.login-container {
  max-width: 800px;
  width: 400px;
  margin: 100px auto;
  padding: 40px 30px;
  border-radius: 12px;
  background: white;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.login-container:hover {
  transform: translateY(-5px);
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #2d3748;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  color: #2d3748;
  background-color: #f7fafc;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #48bb78;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
  transform: translateY(-2px);
}

input::placeholder {
  color: #a0aec0;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #e53e3e;
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
  padding: 8px 12px;
  background-color: #fed7d7;
  border-radius: 6px;
  border-left: 4px solid #e53e3e;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    margin: 50px 20px;
    padding: 30px 20px;
  }

  h2 {
    font-size: 24px;
  }

  .login-btn {
    font-size: 16px;
    padding: 14px;
  }
}
</style>
