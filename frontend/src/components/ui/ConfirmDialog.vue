<template>
  <div v-if="visible" class="confirm-overlay" @click.self="handleCancel">
    <div class="confirm-dialog">
      <div class="confirm-header">
        <h3 class="confirm-title">
          <span v-if="showWarningIcon" class="title-icon">⚠️</span>
          {{ title }}
        </h3>
      </div>
      <div class="confirm-content">
        <p class="confirm-message">{{ message }}</p>
      </div>
      <div class="confirm-footer">
        <button @click="handleCancel" class="confirm-btn cancel-btn">
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          class="confirm-btn"
          :class="{
            'confirm-btn-primary': !dangerConfirm,
            'confirm-btn-danger': dangerConfirm,
          }"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 确认对话框组件
 * 设计意图：替代浏览器原生的confirm()方法，提供自定义样式和更好的用户体验
 * 使用场景：用于处理删除、退出登录等需要用户确认的敏感操作
 *
 * 属性说明：
 * - visible: 控制对话框的显示/隐藏
 * - title: 对话框标题，默认为"确认操作"
 * - message: 对话框内容，默认为"确定要执行此操作吗？"
 * - confirmText: 确认按钮文本，默认为"确定"
 * - cancelText: 取消按钮文本，默认为"取消"
 * - showWarningIcon: 是否显示警告图标，默认为false
 * - dangerConfirm: 是否将确认按钮样式改为红色危险样式，默认为false
 *
 * 事件说明：
 * - confirm: 用户点击确认按钮时触发
 * - cancel: 用户点击取消按钮或点击遮罩层时触发
 */
import { ref } from 'vue';

// 组件属性定义
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
    description: '控制对话框的显示/隐藏',
  },
  title: {
    type: String,
    default: '确认操作',
    description: '对话框标题',
  },
  message: {
    type: String,
    default: '确定要执行此操作吗？',
    description: '对话框确认信息',
  },
  confirmText: {
    type: String,
    default: '确定',
    description: '确认按钮文本',
  },
  cancelText: {
    type: String,
    default: '取消',
    description: '取消按钮文本',
  },
  showWarningIcon: {
    type: Boolean,
    default: false,
    description: '是否显示警告图标',
  },
  dangerConfirm: {
    type: Boolean,
    default: false,
    description: '是否将确认按钮样式改为红色危险样式',
  },
});

// 定义组件事件
const emit = defineEmits([
  'confirm', // 确认事件：用户点击确认按钮时触发
  'cancel', // 取消事件：用户点击取消按钮或遮罩层时触发
]);

/**
 * 处理确认操作
 * 功能：触发confirm事件，通知父组件用户已确认
 */
const handleConfirm = () => {
  emit('confirm');
};

/**
 * 处理取消操作
 * 功能：触发cancel事件，通知父组件用户已取消
 */
const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
/* 遮罩层 */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

/* 对话框容器 */
.confirm-dialog {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

/* 头部 */
.confirm-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e8e8e8;
  text-align: center;
}

.confirm-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 内容区域 */
.confirm-content {
  padding: 24px;
}

.confirm-message {
  margin: 0;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

/* 底部按钮区域 */
.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid #e8e8e8;
}

/* 按钮样式 */
.confirm-btn {
  padding: 10px 20px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}

/* 取消按钮 */
.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
}

.cancel-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  background-color: #f0f7ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

/* 标题图标 */
.title-icon {
  font-size: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  vertical-align: middle;
  margin-top: -2px;
}

/* 确认按钮 */
.confirm-btn-primary {
  background-color: #fa8c16;
  color: white;
  border-color: #fa8c16;
}

.confirm-btn-primary:hover {
  background-color: #ffad33;
  border-color: #ffad33;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(250, 140, 22, 0.2);
}

/* 危险确认按钮 */
.confirm-btn-danger {
  background-color: red;
  color: white;
  border-color: red;
}

.confirm-btn-danger:hover {
  background-color: #ff4444;
  border-color: #ff4444;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.2);
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
</style>
