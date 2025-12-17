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
          <button @click="handleLogout" class="logout-btn-header">
            退出登录
          </button>
        </span>
      </div>
    </div>
  </header>
</template>

<script setup>
// 定义组件属性
const props = defineProps({
  userInfo: {
    type: Object,
    default: null
  }
});

// 定义组件事件
const emit = defineEmits(['logout']);

// 退出登录处理函数
const handleLogout = () => {
  emit('logout');
};
</script>

<style scoped>
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
</style>