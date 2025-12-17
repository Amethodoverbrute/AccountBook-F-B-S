<template>
  <!-- 搜索组件 -->
  <div class="search-container">
    <!-- 基础搜索行 -->
    <div class="search-box" ref="searchBoxRef">
      <input
        type="text"
        v-model="localKeyword"
        placeholder="搜索账单标题..."
        class="search-input"
        @keyup.enter="handleSearch"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <button @click="handleSearch" class="search-btn">搜索</button>
      <button
        @click="handleResetSearch"
        class="reset-btn"
        v-if="hasSearchCriteria"
      >
        重置
      </button>
      <button @click="handleAddBill" class="nav-btn add-btn-search">
        添加账单
      </button>
      <button @click="handleGoToStatistics" class="nav-btn stats-btn-search">
        账单统计
      </button>
      <!-- 搜索建议下拉列表 -->
      <div
        v-if="showSuggestions && suggestions.length > 0"
        class="suggestions-list"
      >
        <div
          v-for="suggestion in suggestions"
          :key="suggestion._id"
          class="suggestion-item"
          @click="selectSuggestion(suggestion.title)"
          @mousedown.prevent
        >
          <span class="suggestion-text">{{ suggestion.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

// 定义组件属性
const props = defineProps({
  keyword: {
    type: String,
    default: "",
  },
  accounts: {
    type: Array,
    default: () => [],
  },
});

// 定义组件事件
const emit = defineEmits([
  "search",
  "add-bill",
  "go-to-statistics",
  "reset-search",
]);

// 本地搜索关键词
const localKeyword = ref(props.keyword);

// 计算属性：判断是否有搜索条件
const hasSearchCriteria = computed(() => {
  return localKeyword.value.trim() !== "";
});

// 监听props.keyword变化，更新本地keyword
watch(
  () => props.keyword,
  (newVal) => {
    localKeyword.value = newVal;
  }
);

// 搜索相关状态
const suggestions = ref([]);
const showSuggestions = ref(false);
const searchBoxRef = ref(null);

/**
 * 防抖定时器，用于延迟执行搜索建议生成
 * 作用：避免用户输入时频繁触发搜索建议计算，提高性能
 */
let debounceTimer = null;

/**
 * 处理输入事件，生成搜索建议（带防抖功能）
 * 防抖机制：延迟300ms执行搜索建议生成，避免频繁计算
 * 功能：
 * 1. 清空旧的防抖定时器
 * 2. 如果搜索关键词为空，清除建议列表并隐藏
 * 3. 否则，延迟300ms执行搜索建议生成
 * 4. 从账单列表中筛选匹配的标题
 * 5. 对建议进行去重处理
 * 6. 限制建议数量为最多10条
 */
const handleInput = () => {
  // 清除之前的定时器，实现防抖效果
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // 如果搜索关键词为空，清空建议列表
  if (!localKeyword.value.trim()) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  // 延迟300毫秒执行搜索建议生成，减少计算频率
  debounceTimer = setTimeout(() => {
    // 从所有账单标题中筛选匹配的建议（不区分大小写）
    const filtered = props.accounts
      .filter((account) =>
        account.title.toLowerCase().includes(localKeyword.value.toLowerCase())
      )
      .map((account) => ({
        _id: account._id,
        title: account.title,
      }));

    // 使用Map去重，确保每个标题只出现一次
    const uniqueSuggestions = Array.from(
      new Map(filtered.map((item) => [item.title, item])).values()
    );

    // 限制建议数量，最多显示10条，避免界面过长
    suggestions.value = uniqueSuggestions.slice(0, 10);
    // 只有当有建议时才显示建议列表
    showSuggestions.value = suggestions.value.length > 0;
  }, 300);
};

/**
 * 处理搜索提交
 * 功能：
 * 1. 触发search事件，将搜索关键词传递给父组件
 * 2. 隐藏搜索建议列表
 */
const handleSearch = () => {
  // 触发搜索事件，传递搜索关键词
  emit("search", localKeyword.value);

  // 搜索后隐藏建议列表
  showSuggestions.value = false;
};

/**
 * 处理重置搜索
 * 功能：
 * 1. 清空本地搜索关键词
 * 2. 清空建议列表
 * 3. 隐藏建议列表
 * 4. 触发reset-search事件，通知父组件重置搜索
 */
const handleResetSearch = () => {
  localKeyword.value = "";

  suggestions.value = [];
  showSuggestions.value = false;
  emit("reset-search");
};

/**
 * 处理搜索框聚焦事件
 * 功能：当搜索关键词非空且有建议时，显示搜索建议列表
 */
const handleFocus = () => {
  if (localKeyword.value.trim() && suggestions.value.length > 0) {
    showSuggestions.value = true;
  }
};

/**
 * 处理搜索框失焦事件
 * 功能：隐藏搜索建议列表
 * 注意：使用setTimeout延迟200ms，确保点击建议项的事件能被触发
 */
const handleBlur = () => {
  // 使用setTimeout确保点击建议项的事件能被触发
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

/**
 * 选择搜索建议项
 * @param {string} title - 选择的建议标题
 * 功能：
 * 1. 将选择的标题设置为当前搜索关键词
 * 2. 触发search事件，执行搜索
 */
const selectSuggestion = (title) => {
  localKeyword.value = title;
  emit("search", title);
};

/**
 * 处理添加账单按钮点击事件
 * 功能：触发add-bill事件，通知父组件打开添加账单表单
 */
const handleAddBill = () => {
  emit("add-bill");
};

/**
 * 处理跳转到统计页面
 * 功能：触发go-to-statistics事件，通知父组件跳转到统计页面
 */
const handleGoToStatistics = () => {
  emit("go-to-statistics");
};
</script>

<style scoped>
/* 搜索组件样式 */
.search-container {
  background-color: white;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.search-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.search-box {
  display: flex;
  gap: 12px;
  align-items: center;
  position: relative;
  width: 100%;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  transform: translateY(-1px);
}

/* 按钮基础样式 */
.search-btn,
.reset-btn,
.nav-btn {
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

/* 搜索按钮 */
.search-btn {
  background-color: #1890ff;
  color: white;
}

.search-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

/* 重置按钮 */
.reset-btn {
  background-color: #f0f0f0;
  color: #666;
  border: 1px solid #d9d9d9;
}

.reset-btn:hover {
  background-color: #e8e8e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 导航按钮 */
.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

/* 搜索栏中的导航按钮 */
.add-btn-search {
  background-color: #fa8c16;
  color: white;
  margin-left: 8px;
}

.add-btn-search:hover {
  background-color: #ffad33;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(250, 140, 22, 0.2);
}

.stats-btn-search {
  background-color: #52c41a;
  color: white;
  margin-left: 8px;
}

.stats-btn-search:hover {
  background-color: #73d13d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.2);
}

/* 搜索建议样式 */
.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
  color: #1890ff;
}

.suggestion-item:active {
  background-color: #e6f7ff;
}

.suggestion-text {
  font-size: 14px;
  color: #333;
}

.suggestion-item:hover .suggestion-text {
  color: #1890ff;
}

/* 滚动条样式 */
.suggestions-list::-webkit-scrollbar {
  width: 6px;
}

.suggestions-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 搜索框 */
  .search-box {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    min-width: auto;
  }
}
</style>
