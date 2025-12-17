<template>
  <!-- 分页组件 -->
  <div class="page-footer">
    <div class="pagination-wrapper" v-if="totalPages > 1 || totalRecords > 0">
      <div class="pagination">
        <div class="pagination-info">
          <span>共 {{ totalRecords }} 条记录</span>
          <span>第 {{ currentPage }}/{{ totalPages }} 页</span>
        </div>
        <div class="pagination-controls">
          <div class="page-size-selector">
            <label>每页显示:</label>
            <select v-model="localPageSize" @change="handlePageSizeChange">
              <option :value="5">5条</option>
              <option :value="10">10条</option>
              <option :value="20">20条</option>
              <option :value="50">50条</option>
            </select>
          </div>
          <div class="pagination-nav">
            <button
              @click="handleFirstPage"
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              首页
            </button>
            <button
              @click="handlePrevPage"
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              上一页
            </button>
            <div class="current-page">{{ currentPage }}</div>
            <div class="page-jump">
              <input
                type="number"
                v-model="jumpPage"
                :min="1"
                :max="totalPages"
                class="page-input"
              />
              <button @click="handleJump" class="jump-button">跳转</button>
            </div>
            <button
              @click="handleNextPage"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              下一页
            </button>
            <button
              @click="handleLastPage"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              末页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

// 定义组件属性
const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 5
  },
  totalPages: {
    type: Number,
    default: 0
  },
  totalRecords: {
    type: Number,
    default: 0
  }
});

// 定义组件事件
const emit = defineEmits(['page-change', 'page-size-change']);

// 本地分页状态
const localPageSize = ref(props.pageSize);
const jumpPage = ref(props.currentPage);

// 监听props.currentPage变化，更新jumpPage
watch(() => props.currentPage, (newVal) => {
  jumpPage.value = newVal;
});

// 监听props.pageSize变化，更新localPageSize
watch(() => props.pageSize, (newVal) => {
  localPageSize.value = newVal;
});

// 跳转到首页
const handleFirstPage = () => {
  emit('page-change', 1);
};

// 跳转到上一页
const handlePrevPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1);
  }
};

// 跳转到下一页
const handleNextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('page-change', props.currentPage + 1);
  }
};

// 跳转到末页
const handleLastPage = () => {
  emit('page-change', props.totalPages);
};

// 处理页码跳转
const handleJump = () => {
  let page = parseInt(jumpPage.value);
  // 边界检查
  if (isNaN(page) || page < 1) page = 1;
  if (page > props.totalPages) page = props.totalPages;
  
  emit('page-change', page);
};

// 处理每页显示条数变化
const handlePageSizeChange = () => {
  emit('page-size-change', localPageSize.value);
};
</script>

<style scoped>
/* 页面底部样式 */
.page-footer {
  background-color: white;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding: 16px 0;
  margin: 15px 0 0 0;
}

/* 经典分页样式美化 */
.pagination-wrapper {
  max-width: 1080px;
  margin: 0 auto;
  width: 95%;
  box-sizing: border-box;
  padding: 0 20px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* 每页显示条数选择器 */
.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.page-size-selector label {
  font-weight: 500;
  color: #555;
}

.page-size-selector select {
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background-color: white;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-size-selector select:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.page-size-selector select:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

/* 分页导航 */
.pagination-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.pagination-btn {
  padding: 8px 14px;
  border: 1px solid #e1e5e9;
  background-color: white;
  color: #555;
  min-width: 65px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
  background-color: #f0f7ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  background-color: #f8f9fa;
  border-color: #e1e5e9;
  color: #c0c4c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination-btn:active:not(:disabled) {
  background-color: #e6f7ff;
  border-color: #40a9ff;
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(24, 144, 255, 0.2);
}

/* 当前页码样式 */
.current-page {
  padding: 8px 12px;
  border: 2px solid #1890ff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
  background-color: #f0f7ff;
  min-width: 40px;
  text-align: center;
}

/* 页码输入和跳转按钮 */
.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 6px;
}

.page-input {
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  width: 70px;
  text-align: center;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-input:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.page-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.jump-button {
  background-color: #1890ff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
  box-sizing: border-box;
}

.jump-button:hover {
  background-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transform: translateY(-1px);
}

.jump-button:active {
  background-color: #096dd9;
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 分页 */
  .pagination {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .pagination-info {
    justify-content: center;
  }

  .pagination-controls {
    justify-content: center;
  }

  .pagination-nav {
    justify-content: center;
  }

  .page-size-selector {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  /* 分页 */
  .pagination-nav {
    gap: 4px;
    padding: 6px;
  }

  .pagination-btn {
    padding: 6px 10px;
    min-width: 50px;
    font-size: 13px;
  }

  .page-input {
    width: 60px;
    padding: 6px 10px;
  }

  .jump-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .pagination-info {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>