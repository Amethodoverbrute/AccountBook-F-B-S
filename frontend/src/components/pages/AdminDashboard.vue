<template>
  <div class="admin-dashboard">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">后台管理</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link
          to="/admin/dashboard"
          class="nav-item"
          :class="{ active: $route.path === '/admin/dashboard' }"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">仪表盘</span>
        </router-link>
        <router-link
          to="/admin/users"
          class="nav-item"
          :class="{ active: $route.path === '/admin/users' }"
        >
          <span class="nav-icon">👥</span>
          <span class="nav-text">用户管理</span>
        </router-link>
        <router-link
          to="/admin/statistics"
          class="nav-item"
          :class="{ active: $route.path === '/admin/statistics' }"
        >
          <span class="nav-icon">📈</span>
          <span class="nav-text">系统统计</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="top-nav">
        <div class="nav-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="nav-right">
          <div class="user-info">
            <span class="username">{{ userInfo.username }}</span>
            <span class="user-role">{{ getRoleText(userInfo.role) }}</span>
          </div>
          <button @click="showLogoutDialog" class="logout-btn">
            <span class="nav-icon">🚪</span>
            <span class="nav-text">退出登录</span>
          </button>
        </div>
      </header>

      <!-- 页面内容 -->
      <section class="page-content">
        <!-- 欢迎信息 -->
        <div class="welcome-section">
          <h2>欢迎回来，{{ userInfo.username }}！</h2>
          <p>这是您的管理控制台，您可以在这里管理用户和查看系统统计数据。</p>
        </div>

        <!-- 系统概览卡片 -->
        <div class="overview-cards">
          <div class="card">
            <div class="card-header">
              <h3>总用户数</h3>
              <span class="card-icon">👥</span>
            </div>
            <div class="card-body">
              <div class="card-value">{{ statistics.totalUsers }}</div>
              <div class="card-description">当前系统中的总用户数量</div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3>总账单数</h3>
              <span class="card-icon">💰</span>
            </div>
            <div class="card-body">
              <div class="card-value">{{ statistics.totalAccounts }}</div>
              <div class="card-description">系统中所有用户的账单总数</div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3>今日活跃用户</h3>
              <span class="card-icon">📱</span>
            </div>
            <div class="card-body">
              <div class="card-value">{{ statistics.todayActiveUsers }}</div>
              <div class="card-description">24小时内活跃的用户数量</div>
            </div>
          </div>
        </div>

        <!-- 最近活动 -->
        <div class="recent-activity">
          <h3>最近活动</h3>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">🔐</div>
              <div class="activity-content">
                <div class="activity-title">用户登录</div>
                <div class="activity-time">刚刚</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">📝</div>
              <div class="activity-content">
                <div class="activity-title">系统更新</div>
                <div class="activity-time">2小时前</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">📊</div>
              <div class="activity-content">
                <div class="activity-title">数据统计更新</div>
                <div class="activity-time">5小时前</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 退出登录确认对话框 -->
    <ConfirmDialog
      :visible="showLogoutConfirm"
      title="确认退出登录"
      message="确定要退出登录吗？"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
      :showWarningIcon="true"
      :dangerConfirm="true"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../../services/auth';
import { adminService } from '../../services/admin';
import ConfirmDialog from '../ui/ConfirmDialog.vue';

// 路由实例
const router = useRouter();

// 页面标题
const pageTitle = ref('仪表盘');

// 用户信息
const userInfo = ref({
  username: '',
  role: '',
});

// 系统统计数据
const statistics = ref({
  totalUsers: 0,
  totalAccounts: 0,
  todayActiveUsers: 0,
});

// 确认对话框状态
const showLogoutConfirm = ref(false);

// 初始化数据
onMounted(async () => {
  // 获取用户信息
  await fetchUserInfo();

  // 获取系统统计数据
  await fetchStatistics();
});

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const info = await authService.getUserInfo();
    userInfo.value = info;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 未登录或登录过期，跳转到登录页面
    router.push('/admin/login');
  }
};

// 获取系统统计数据
const fetchStatistics = async () => {
  try {
    const data = await adminService.getSystemStatistics();
    statistics.value = data;
  } catch (error) {
    console.error('获取系统统计数据失败:', error);
  }
};

// 显示退出登录确认对话框
const showLogoutDialog = () => {
  showLogoutConfirm.value = true;
};

// 退出登录处理
const handleLogout = async () => {
  try {
    await authService.logout();
    router.push('/admin/login');
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};

// 确认退出登录
const confirmLogout = () => {
  showLogoutConfirm.value = false;
  handleLogout();
};

// 取消退出登录
const cancelLogout = () => {
  showLogoutConfirm.value = false;
};

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    user: '普通用户',
    admin: '管理员',
    superAdmin: '超级管理员',
  };
  return roleMap[role] || '未知角色';
};
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 侧边栏样式 */
.sidebar {
  width: 200px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  background-color: #3498db;
  border-bottom: 2px solid #2980b9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.sidebar-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  padding: 10px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item:hover {
  background-color: #34495e;
}

.nav-item.active {
  background-color: #3498db;
}

.nav-icon {
  margin-right: 10px;
  font-size: 18px;
}

.logout-btn {
  margin-top: auto;
  color: #e74c3c;
}

.logout-btn:hover {
  background-color: #e74c3c;
  color: white;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.top-nav {
  background-color: white;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  position: relative;
}

.nav-left {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #333;
  text-align: center;
}

.nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 退出登录按钮样式，参考用户角色标签样式 */
.top-nav .logout-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  margin-top: 0;
}

.top-nav .logout-btn:hover {
  background-color: #2980b9;
  opacity: 0.9;
}

.username {
  font-weight: 500;
  color: #333;
}

.user-role {
  background-color: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 页面内容 */
.page-content {
  padding: 20px;
  flex: 1;
}

/* 欢迎信息 */
.welcome-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.welcome-section h2 {
  margin-top: 0;
  color: #333;
}

.welcome-section p {
  color: #666;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h3 {
  margin: 0;
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

.card-icon {
  font-size: 24px;
}

.card-body .card-value {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.card-body .card-description {
  color: #666;
  font-size: 14px;
}

/* 最近活动 */
.recent-activity {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recent-activity h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.activity-icon {
  font-size: 20px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-dashboard {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
  }

  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 10px;
  }

  .nav-item {
    flex-direction: column;
    min-width: 80px;
    padding: 10px;
    text-align: center;
  }

  .nav-text {
    font-size: 12px;
    margin-top: 5px;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }
}
</style>
