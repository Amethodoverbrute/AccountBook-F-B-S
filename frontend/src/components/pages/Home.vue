<template>
  <!-- 固定头部组件 -->
  <HeaderComponent :user-info="userInfo" @logout="handleLogout" />

  <!-- 统一的确认对话框组件 -->
  <ConfirmDialog
    v-model:visible="confirmDialog.visible"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    @confirm="handleConfirmDialog"
    @cancel="handleCancelDialog"
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
                  @input="validateField('title', newAccount.title)"
                  required
                  placeholder="请输入账单标题"
                />
                <div class="field-error" v-if="fieldErrors.title">
                  {{ fieldErrors.title }}
                </div>
              </div>
              <div class="form-group">
                <label for="amount">金额</label>
                <input
                  type="number"
                  id="amount"
                  v-model="newAccount.amount"
                  @input="validateField('amount', newAccount.amount)"
                  required
                  step="0.01"
                  placeholder="请输入金额"
                />
                <div class="field-error" v-if="fieldErrors.amount">
                  {{ fieldErrors.amount }}
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="type">类型</label>
                <select
                  id="type"
                  v-model="newAccount.type"
                  @change="validateField('type', newAccount.type)"
                  required
                >
                  <option value="">请选择类型</option>
                  <option value="expense">支出</option>
                  <option value="income">收入</option>
                </select>
                <div class="field-error" v-if="fieldErrors.type">
                  {{ fieldErrors.type }}
                </div>
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
                <select
                  id="category"
                  v-model="newAccount.categoryId"
                  @change="validateField('categoryId', newAccount.categoryId)"
                >
                  <option value="">请选择分类</option>
                  <option
                    v-for="category in filteredCategories"
                    :key="category._id"
                    :value="category._id"
                  >
                    {{ category.name }}
                  </option>
                </select>
                <div class="field-error" v-if="fieldErrors.categoryId">
                  {{ fieldErrors.categoryId }}
                </div>
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
                :disabled="isSubmitting"
              >
                <!-- 加载状态 -->
                <span v-if="isSubmitting" class="loading-text">
                  <span class="btn-loading-spinner"></span>
                  保存中...
                </span>
                <!-- 正常状态 -->
                <span v-else>保存</span>
              </button>
              <button
                type="button"
                @click="showForm = false"
                class="cancel-btn"
                :disabled="isSubmitting"
              >
                取消
              </button>
            </div>
          </form>
          <div class="error-message" v-if="formError">{{ formError }}</div>
          <div class="success-message" v-if="formSuccess">
            {{ formSuccess }}
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索组件 -->
    <SearchComponent
      :keyword="searchKeyword"
      :accounts="accounts"
      @search="handleSearch"
      @add-bill="openForm"
      @go-to-statistics="goToStatistics"
      @reset-search="handleResetSearch"
    />

    <!-- 账单列表 -->
    <div class="accounts-container">
      <!-- 加载状态 -->
      <div class="loading-container" v-if="isLoading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <!-- 账单卡片列表 -->
      <template v-else>
        <AccountCardComponent
          v-for="account in accounts"
          :key="account._id"
          :account="account"
          @edit="handleEditAccountClick"
          @delete="handleDeleteAccount"
        />
        <div class="empty-message" v-if="accounts.length === 0">
          暂无账单记录
        </div>
      </template>
    </div>
  </div>

  <!-- 分页组件 -->
  <PaginationComponent
    :current-page="currentPage"
    :page-size="pageSize"
    :total-pages="totalPages"
    :total-records="totalRecords"
    @page-change="goToPage"
    @page-size-change="handlePageSizeChange"
  />

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
// 导入子组件
import ConfirmDialog from "../ui/ConfirmDialog.vue";
import HeaderComponent from "../layout/HeaderComponent.vue";
import SearchComponent from "../ui/SearchComponent.vue";
import AccountCardComponent from "../ui/AccountCardComponent.vue";
import PaginationComponent from "../ui/PaginationComponent.vue";

// 导入业务逻辑组合式函数
import { useAccountManagement } from "../../composables/useAccountManagement";

// 使用组合式函数获取所有状态和方法
const {
  // 状态
  accounts,
  isLoading,
  isSubmitting,
  formError,
  formSuccess,
  showForm,
  isEditing,
  editAccountId,
  userInfo,
  categories,
  isCategoriesLoading,
  isInitializingForm,
  searchKeyword,
  accountTitles,
  currentPage,
  pageSize,
  totalRecords,
  totalPages,
  confirmDialog,
  newAccount,
  filteredCategories,
  fieldErrors,

  // 方法
  handleAddAccount,
  handleEditAccount,
  handleEditAccountClick,
  handleDeleteAccount,
  handleLogout,
  handleConfirmDialog,
  handleCancelDialog,
  openForm,
  goToStatistics,
  handleSearch,
  handleResetSearch,
  handlePageSizeChange,
  goToPage,
  fetchAccounts,
  validateField,
} = useAccountManagement();
</script>

<style scoped>
/* 主容器样式 */
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

/* 账单容器 */
.accounts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 15px;
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

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #666;
  font-size: 16px;
  margin: 0;
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
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
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

.submit-btn:hover:not(:disabled) {
  background-color: #73d13d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.2);
}

.submit-btn:disabled {
  background-color: #a3d9a5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 取消按钮 */
.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
  border: 1px solid #d9d9d9;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #e8e8e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cancel-btn:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 按钮加载状态 */
.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
.success-message,
.field-error {
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

/* 单个字段的错误提示样式 */
.field-error {
  padding: 6px 12px;
  margin-top: 6px;
  font-size: 12px;
  color: #ff4d4f;
  background-color: #fff1f0;
  border-radius: 6px;
  text-align: left;
  line-height: 1.4;
  border-left: 3px solid #ff4d4f;
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

/* 响应式设计 */
@media (max-width: 768px) {
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
}
</style>
