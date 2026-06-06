<template>
  <div class="quote-form-container" v-if="visible">
    <div class="quote-form-overlay" @click.self="handleClose"></div>
    <div class="quote-form-content">
      <div class="quote-form-header">
        <h3 class="quote-form-title">添加名言</h3>
        <button class="quote-form-close" @click="handleClose">&times;</button>
      </div>
      <div class="quote-form-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="quote-content" class="form-label">名言内容</label>
            <textarea
              id="quote-content"
              v-model="quoteContent"
              class="form-textarea"
              placeholder="请输入您喜欢的名言..."
              rows="4"
              required
            ></textarea>
          </div>
          <div class="form-group">
            <label for="quote-author" class="form-label">作者</label>
            <input
              type="text"
              id="quote-author"
              v-model="quoteAuthor"
              class="form-input"
              placeholder="请输入名言作者"
              required
            />
          </div>
          <div v-if="errorMessage" class="form-error">{{ errorMessage }}</div>
          <div v-if="successMessage" class="form-success">
            {{ successMessage }}
          </div>
          <div class="form-actions">
            <button
              type="button"
              class="form-btn cancel-btn"
              @click="handleClose"
            >
              取消
            </button>
            <button
              type="submit"
              class="form-btn submit-btn"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? '提交中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

// 组件属性定义
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
    description: '表单显示状态',
  },
});

// 定义组件事件
const emit = defineEmits(['close', 'save']);

// 状态管理
const quoteContent = ref('');
const quoteAuthor = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// 监听visible变化，重置表单
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      resetForm();
    }
  }
);

// 重置表单
const resetForm = () => {
  quoteContent.value = '';
  quoteAuthor.value = '';
  errorMessage.value = '';
  successMessage.value = '';
  isSubmitting.value = false;
};

// 处理表单提交
const handleSubmit = async () => {
  // 清除之前的消息
  errorMessage.value = '';
  successMessage.value = '';

  // 表单验证
  if (!quoteContent.value.trim()) {
    errorMessage.value = '名言内容不能为空';
    return;
  }
  if (!quoteAuthor.value.trim()) {
    errorMessage.value = '作者不能为空';
    return;
  }

  // 提交到后端API
  isSubmitting.value = true;

  try {
    // 检查token是否存在
    const token = localStorage.getItem('token');
    console.log('Token:', token ? '存在' : '不存在');

    // 调用API添加名言
    const response = await fetch('/api/users/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        content: quoteContent.value.trim(),
        author: quoteAuthor.value.trim(),
      }),
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);

    if (result.code === '0000') {
      // 添加成功
      successMessage.value = '名言添加成功！';

      // 延迟关闭表单
      setTimeout(() => {
        emit('save', {
          content: quoteContent.value.trim(),
          author: quoteAuthor.value.trim(),
        });
        handleClose();
      }, 1000);
    } else {
      // 添加失败
      errorMessage.value = result.msg || '添加失败，请稍后重试';
    }
  } catch (error) {
    console.error('添加名言失败:', error);
    errorMessage.value = '网络错误，请稍后重试';
  } finally {
    isSubmitting.value = false;
  }
};

// 处理关闭表单
const handleClose = () => {
  emit('close');
  resetForm();
};
</script>

<style scoped>
/* 表单容器样式 */
.quote-form-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 遮罩层 */
.quote-form-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

/* 表单内容 */
.quote-form-content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
}

/* 表单头部 */
.quote-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e8e8e8;
}

.quote-form-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.quote-form-close {
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

.quote-form-close:hover {
  background-color: #f5f5f5;
  color: #666;
}

/* 表单主体 */
.quote-form-body {
  padding: 24px;
}

/* 表单组 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-input {
  height: 40px;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 表单消息 */
.form-error {
  color: #f56c6c;
  font-size: 12px;
  margin-bottom: 16px;
}

.form-success {
  color: #67c23a;
  font-size: 12px;
  margin-bottom: 16px;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.form-btn {
  padding: 10px 20px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background-color: #e8e8e8;
  border-color: #d9d9d9;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 动画效果 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .quote-form-content {
    width: 95%;
    margin: 20px;
  }

  .quote-form-header,
  .quote-form-body {
    padding: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-btn {
    width: 100%;
  }
}
</style>
