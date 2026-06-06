<template>
  <!-- AI面板组件 -->
  <div 
    class="ai-panel" 
    :style="{ width: panelWidth + 'px' }"
  >
    <!-- 拖拽条 -->
    <div 
      class="ai-panel-resizer" 
      @mousedown="startResize"
      title="拖动调整宽度"
    >
      <span class="resizer-icon">⋮⋮</span>
    </div>
    
    <!-- 面板头部 -->
    <div class="ai-panel-header">
      <h3 class="ai-panel-title">
        <span class="ai-icon">🤖</span>
        AI 助手
      </h3>
      <button
        class="ai-panel-toggle"
        @click="togglePanel"
        :title="isExpanded ? '收起AI面板' : '展开AI面板'"
      >
        {{ isExpanded ? '◀' : '▶' }}
      </button>
    </div>

    <!-- 面板内容 -->
    <div class="ai-panel-content" :class="{ expanded: isExpanded }">
      <!-- 对话历史 -->
      <div class="ai-chat-history" ref="chatHistory">
        <!-- 欢迎消息 -->
        <div class="ai-message" v-if="messages.length === 0">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <div class="message-text">
              你好！我是你的AI记账助手，有什么可以帮你的吗？
            </div>
          </div>
        </div>

        <!-- 对话消息 -->
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['ai-message', { 'user-message': message.role === 'user' }]"
        >
          <div class="message-avatar">
            {{ message.role === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div class="ai-message" v-if="isLoading">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <div class="message-text">
              <div class="loading-spinner"></div>
              <span>AI正在思考...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="ai-input-area">
        <div class="input-wrapper">
          <textarea
            v-model="inputMessage"
            placeholder="输入你的问题或需求..."
            @keydown.enter.prevent="sendMessage"
            :disabled="isLoading"
            rows="1"
          ></textarea>
          <button
            class="send-button"
            @click="sendMessage"
            :disabled="isLoading || !inputMessage.trim()"
            title="发送消息"
          >
            <span v-if="isLoading" class="send-loading"></span>
            <span v-else>发送</span>
          </button>
        </div>
        <div class="input-hint">
          <span>提示：输入 "分析我的账单" 可以获取账单分析</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * AI面板组件
 * 功能：提供AI对话界面，用于与AI助手进行交互
 * 主要功能：
 * - AI对话历史展示
 * - 消息输入和发送
 * - 加载状态显示
 * - 面板展开/收起
 * - 账单分析功能
 */

import { ref, computed, onMounted, watch } from 'vue';
import { accountService, statisticsService } from '../../services/auth';
import api from '../../services/auth';

// 定义组件属性
const props = defineProps({
  // 是否默认展开
  defaultExpanded: {
    type: Boolean,
    default: true,
  },
});

// 定义组件事件
const emit = defineEmits(['toggle']);

// 状态管理
const isExpanded = ref(props.defaultExpanded);
const messages = ref([]);
const inputMessage = ref('');
const isLoading = ref(false);
const chatHistory = ref(null);
const panelWidth = ref(320);
const isResizing = ref(false);

/**
 * 切换面板展开/收起状态
 */
const togglePanel = () => {
  isExpanded.value = !isExpanded.value;
  emit('toggle', isExpanded.value);
};

/**
 * 开始拖拽调整宽度
 */
const startResize = (e) => {
  isResizing.value = true;
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
  e.preventDefault();
};

/**
 * 拖拽中
 */
const onResize = (e) => {
  if (!isResizing.value) return;
  
  // 计算新宽度：窗口宽度 - 鼠标X坐标
  const newWidth = window.innerWidth - e.clientX;
  
  // 限制宽度范围：最小280px，最大600px
  const minWidth = 280;
  const maxWidth = 600;
  
  if (newWidth >= minWidth && newWidth <= maxWidth) {
    panelWidth.value = newWidth;
  }
};

/**
 * 停止拖拽
 */
const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
};

/**
 * 发送消息
 */
const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message || isLoading.value) return;

  // 添加用户消息到对话历史
  messages.value.push({
    role: 'user',
    content: message,
  });

  // 清空输入框
  inputMessage.value = '';

  // 滚动到底部
  scrollToBottom();

  try {
    isLoading.value = true;

    // 检查是否是特殊命令
    if (message.toLowerCase().includes('分析我的账单')) {
      // 获取账单数据并进行分析
      await analyzeBills();
    } else {
      // 普通对话
      await sendChatMessage(message);
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    messages.value.push({
      role: 'assistant',
      content: '抱歉，AI服务暂时不可用，请稍后再试。',
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

/**
 * 发送普通聊天消息
 * @param {string} message - 用户输入的消息
 */
const sendChatMessage = async (message) => {
  try {
    console.log('发送AI对话请求:', {
      prompt: message,
      context: { history: messages.value.slice(-5) },
    });

    // 调用AI对话接口
    const response = await api.post('/ai/conversation', {
      prompt: message,
      context: {
        history: messages.value.slice(-5), // 只发送最近5条消息作为上下文
      },
    });

    console.log('AI对话响应:', response);

    // 添加AI响应到对话历史
    if (response.data && response.data.data && response.data.data.choices) {
      messages.value.push({
        role: 'assistant',
        content: response.data.data.choices[0].message.content,
      });
    } else {
      console.warn('AI响应格式不符合预期:', response.data);
      messages.value.push({
        role: 'assistant',
        content: '抱歉，我没有理解你的意思，请换个说法试试。',
      });
    }
  } catch (error) {
    console.error('AI对话失败:', error);
    console.error('错误详情:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 分析账单数据
 */
const analyzeBills = async () => {
  try {
    // 获取最近一个月的账单数据
    const now = new Date();
    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    // 获取账单数据
    const billsResponse = await accountService.getAccounts('', 1, 50, {
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    });

    // 获取统计数据
    const statsResponse = await statisticsService.getStatistics({
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    });

    // 准备分析数据
    const analysisData = {
      bills: billsResponse.data,
      statistics: statsResponse.data,
      period: {
        start: lastMonth.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      },
    };

    // 调用AI分析接口
    const aiResponse = await api.post('/ai/analysis', {
      data: analysisData,
    });

    // 添加AI分析结果到对话历史
    if (
      aiResponse.data &&
      aiResponse.data.data &&
      aiResponse.data.data.choices
    ) {
      messages.value.push({
        role: 'assistant',
        content: aiResponse.data.data.choices[0].message.content,
      });
    } else {
      messages.value.push({
        role: 'assistant',
        content: '抱歉，无法分析你的账单数据，请稍后再试。',
      });
    }
  } catch (error) {
    console.error('账单分析失败:', error);
    throw error;
  }
};

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  setTimeout(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight;
    }
  }, 100);
};

// 监听消息变化，自动滚动到底部
watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

// 组件挂载后滚动到底部
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
/* AI面板容器 */
.ai-panel {
  position: fixed;
  right: 0;
  top: 100px;
  min-width: 280px;
  max-width: 600px;
  background-color: white;
  border-radius: 12px 0 0 12px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: box-shadow 0.3s ease;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 拖拽条 */
.ai-panel-resizer {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
  border-radius: 12px 0 0 12px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-panel-resizer:hover {
  background-color: rgba(102, 126, 234, 0.2);
}

.ai-panel-resizer:active {
  background-color: rgba(102, 126, 234, 0.4);
}

.resizer-icon {
  color: #ccc;
  font-size: 12px;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.2s ease;
  writing-mode: vertical-rl;
}

.ai-panel-resizer:hover .resizer-icon,
.ai-panel-resizer:active .resizer-icon {
  opacity: 1;
}

/* 面板头部 */
.ai-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 0 0 0;
}

.ai-panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-icon {
  font-size: 18px;
}

.ai-panel-toggle {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.ai-panel-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 面板内容 */
.ai-panel-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 56px);
  transition: all 0.3s ease;
  overflow: hidden;
}

/* 对话历史 */
.ai-chat-history {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f8f9fa;
}

/* 滚动条样式 */
.ai-chat-history::-webkit-scrollbar {
  width: 6px;
}

.ai-chat-history::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.ai-chat-history::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.ai-chat-history::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* 消息样式 */
.ai-message {
  display: flex;
  gap: 10px;
  max-width: 100%;
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background-color: #e3f2fd;
}

.message-content {
  max-width: calc(100% - 46px);
  word-wrap: break-word;
}

.message-text {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
}

.ai-message:not(.user-message) .message-text {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 8px;
}

.user-message .message-text {
  background-color: #667eea;
  color: white;
  border-bottom-right-radius: 8px;
}

/* 加载状态 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

.send-loading {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 输入区域 */
.ai-input-area {
  padding: 16px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.input-wrapper textarea {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  resize: none;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.4;
  transition: all 0.3s ease;
  min-height: 40px;
  max-height: 120px;
  overflow-y: auto;
}

.input-wrapper textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.input-wrapper textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.send-button {
  padding: 0 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 输入提示 */
.input-hint {
  font-size: 12px;
  color: #999;
  text-align: center;
  line-height: 1.2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-panel {
    width: 100%;
    right: 0;
    left: 0;
    top: auto;
    bottom: 0;
    border-radius: 12px 12px 0 0;
    max-height: 60vh;
  }

  .ai-panel-header {
    border-radius: 12px 12px 0 0;
  }

  .ai-panel-content {
    height: calc(60vh - 56px);
  }
}
</style>
