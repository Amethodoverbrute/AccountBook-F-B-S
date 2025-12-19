<template>
  <div class="quote-container">
    <div class="quote-content" v-if="quote">
      <div class="quote-text" v-if="quote.content">
        <span class="quote-icon-left">"</span>
        <span class="quote-main">{{ quote.content }}</span>
        <span class="quote-icon-right">"</span>
      </div>
      <div class="quote-author" v-if="quote.author">— {{ quote.author }}</div>
    </div>
    <div v-else class="quote-placeholder">加载中...</div>
    <div class="quote-actions" v-if="showAddButton">
      <button class="add-quote-btn" @click="handleAddQuote">+ 添加名言</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

// 组件属性定义
const props = defineProps({
  quote: {
    type: Object,
    default: null,
    description: '名言对象，包含content和author字段',
  },
  showAddButton: {
    type: Boolean,
    default: false,
    description: '是否显示添加名言按钮',
  },
});

// 定义组件事件
const emit = defineEmits(['add-quote']);

// 事件处理：添加名言按钮点击
const handleAddQuote = () => {
  emit('add-quote');
};
</script>

<style scoped>
/* 名言容器样式 */
.quote-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  margin: 0 0 20px 0;
  transition: all 0.3s ease;
  animation: fadeIn 0.8s ease-in-out;
}

/* 内容区域 */
.quote-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
}

/* 名言文本样式 */
.quote-text {
  font-size: 18px;
  font-weight: 500;
  color: white;
  line-height: 1.6;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 引号样式 */
.quote-icon-left,
.quote-icon-right {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: bold;
}

.quote-main {
  flex: 1;
}

/* 作者样式 */
.quote-author {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
  margin-top: 8px;
}

/* 占位符样式 */
.quote-placeholder {
  color: white;
  font-style: italic;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 悬停效果 */
.quote-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
}

/* 操作按钮区域 */
.quote-actions {
  margin-top: 15px;
}

/* 添加名言按钮 */
.add-quote-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.add-quote-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quote-container {
    padding: 15px;
    margin: 15px 0;
  }

  .quote-text {
    font-size: 16px;
    gap: 8px;
  }

  .quote-icon-left,
  .quote-icon-right {
    font-size: 20px;
  }

  .quote-author {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .quote-container {
    padding: 12px;
    margin: 10px 0;
  }

  .quote-text {
    font-size: 14px;
  }

  .quote-icon-left,
  .quote-icon-right {
    font-size: 18px;
  }
}
</style>
