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
          <h1 class="page-title">用户管理</h1>
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
        <!-- 搜索和筛选 -->
        <div class="search-section">
          <div class="search-box">
            <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜索用户名"
              class="search-input"
              @input="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
        </div>

        <!-- 用户列表 -->
        <div class="users-table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>角色</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user._id">
                <td>{{ user._id }}</td>
                <td>{{ user.username }}</td>
                <td>
                  <span class="role-badge" :class="user.role">
                    {{ getRoleText(user.role) }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <button
                    class="action-btn edit-btn"
                    @click="openEditRoleModal(user)"
                    v-if="
                      userInfo.role === 'superAdmin' ||
                      userInfo.role === 'admin'
                    "
                  >
                    修改角色
                  </button>
                  <button
                    class="action-btn delete-btn"
                    @click="openDeleteModal(user)"
                    v-if="
                      userInfo.role === 'superAdmin' ||
                      userInfo.role === 'admin'
                    "
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 无数据提示 -->
          <div v-if="users.length === 0" class="no-data">暂无用户数据</div>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="total > 0">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="handlePageChange(currentPage - 1)"
          >
            上一页
          </button>
          <span class="page-info">
            第 {{ currentPage }} / {{ totalPages }} 页，共 {{ total }} 条记录
          </span>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="handlePageChange(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </section>
    </main>

    <!-- 修改角色模态框 -->
    <div
      class="modal-overlay"
      v-if="showEditRoleModal"
      @click="closeEditRoleModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>修改角色</h3>
          <button class="close-btn" @click="closeEditRoleModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>用户名: {{ selectedUser.username }}</p>
          <div class="form-group">
            <label for="new-role">新角色:</label>
            <select id="new-role" v-model="newRole" class="form-select">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
              <option value="superAdmin">超级管理员</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeEditRoleModal">
            取消
          </button>
          <button class="modal-btn confirm-btn" @click="handleUpdateRole">
            确认修改
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div class="modal-overlay" v-if="showDeleteModal" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>删除确认</h3>
          <button class="close-btn" @click="closeDeleteModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>
            确定要删除用户 <strong>{{ selectedUser.username }}</strong> 吗？
          </p>
          <p class="warning-text">此操作不可恢复，请谨慎操作！</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeDeleteModal">
            取消
          </button>
          <button class="modal-btn danger-btn" @click="handleDeleteUser">
            确认删除
          </button>
        </div>
      </div>
    </div>

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

// 用户信息
const userInfo = ref({
  username: '',
  role: '',
});

// 用户列表数据
const users = ref([]);

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPages = ref(0);

// 搜索关键词
const searchKeyword = ref('');

// 模态框状态
const showEditRoleModal = ref(false);
const showDeleteModal = ref(false);

// 选中的用户
const selectedUser = ref(null);
const newRole = ref('');

// 初始化数据
onMounted(async () => {
  // 获取用户信息
  await fetchUserInfo();

  // 获取用户列表
  await fetchUsers();
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

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await adminService.getUsers({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchKeyword.value,
    });

    // 按角色排序：superAdmin > admin > user
    const sortedUsers = response.users.sort((a, b) => {
      const rolePriority = { superAdmin: 3, admin: 2, user: 1 };
      return rolePriority[b.role] - rolePriority[a.role];
    });

    users.value = sortedUsers;
    total.value = response.total;
    totalPages.value = Math.ceil(total.value / pageSize.value);
  } catch (error) {
    console.error('获取用户列表失败:', error);
  }
};

// 搜索用户
const handleSearch = () => {
  currentPage.value = 1;
  fetchUsers();
};

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchUsers();
};

// 打开修改角色模态框
const openEditRoleModal = (user) => {
  selectedUser.value = user;
  newRole.value = user.role;
  showEditRoleModal.value = true;
};

// 关闭修改角色模态框
const closeEditRoleModal = () => {
  showEditRoleModal.value = false;
  selectedUser.value = null;
  newRole.value = '';
};

// 打开删除模态框
const openDeleteModal = (user) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

// 关闭删除模态框
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedUser.value = null;
};

// 修改角色处理
const handleUpdateRole = async () => {
  try {
    await adminService.updateUserRole(selectedUser.value._id, newRole.value);
    // 更新成功，重新获取用户列表
    await fetchUsers();
    // 关闭模态框
    closeEditRoleModal();
    // 提示成功
    alert('角色修改成功');
  } catch (error) {
    console.error('修改角色失败:', error);
    alert('修改角色失败，请重试');
  }
};

// 删除用户处理
const handleDeleteUser = async () => {
  try {
    await adminService.deleteUser(selectedUser.value._id);
    // 更新成功，重新获取用户列表
    await fetchUsers();
    // 关闭模态框
    closeDeleteModal();
    // 提示成功
    alert('用户删除成功');
  } catch (error) {
    console.error('删除用户失败:', error);
    alert('删除用户失败，请重试');
  }
};

// 确认对话框状态
const showLogoutConfirm = ref(false);

// 退出登录处理
const handleLogout = async () => {
  try {
    await authService.logout();
    router.push('/admin/login');
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};

// 显示退出登录确认对话框
const showLogoutDialog = () => {
  showLogoutConfirm.value = true;
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

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
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

/* 搜索区域 */
.search-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
}

.search-btn {
  padding: 10px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: #66b1ff;
}

/* 用户表格 */
.users-table-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e4e7ed;
}

.users-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #303133;
}

.users-table tr:hover {
  background-color: #f5f7fa;
}

/* 角色标签 */
.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.role-badge.user {
  background-color: #67c23a;
}

.role-badge.admin {
  background-color: #409eff;
}

.role-badge.superAdmin {
  background-color: #e6a23c;
}

/* 操作按钮 */
.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #409eff;
  color: white;
}

.edit-btn:hover {
  background-color: #66b1ff;
}

.delete-btn {
  background-color: red;
  color: white;
}

.delete-btn:hover {
  background-color: #ff4444;
}

/* 无数据提示 */
.no-data {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 16px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  background-color: white;
  color: #007bff;
  border-color: #007bff;
}

.page-btn:disabled {
  cursor: not-allowed;
  background-color: #e0e0e0;
  color: #999;
  border-color: #ccc;
  opacity: 0.6;
}

.page-info {
  color: #606266;
  font-size: 14px;
}

/* 模态框样式 */
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
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.modal-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 10px 0;
  color: #606266;
}

.warning-text {
  color: #e6a23c !important;
  font-weight: 500;
}

.form-group {
  margin: 15px 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #303133;
  font-weight: 500;
}

.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: white;
  color: #606266;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #f5f7fa;
  border-color: #c6e2ff;
  color: #409eff;
}

.confirm-btn {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.confirm-btn:hover {
  background-color: #66b1ff;
}

.confirm-btn.danger {
  background-color: red;
}

.confirm-btn.danger:hover {
  background-color: #ff4444;
}

/* 添加danger-btn样式 */
.danger-btn {
  background-color: red;
  color: white;
  border: 1px solid red;
}

.danger-btn:hover {
  background-color: #ff4444;
  border-color: #ff4444;
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

  .nav-icon {
    margin-right: 0;
    margin-bottom: 5px;
  }

  .users-table-container {
    padding: 10px;
  }

  .search-box {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .top-nav {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .nav-right {
    width: 100%;
    justify-content: space-between;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
