<template>
  <div class="statistics-container">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-buttons left">
        <button @click="goBack" class="back-btn">返回首页</button>
      </div>
      <h1 class="app-title">
        {{ userInfo ? `${userInfo.username}的账单统计` : "账单统计" }}
      </h1>
      <div class="nav-buttons">
        <button @click="showLogoutConfirm = true" class="logout-btn">
          退出登录
        </button>
      </div>
    </div>

    <!-- 退出登录确认对话框 -->
    <ConfirmDialog
      v-model:visible="showLogoutConfirm"
      title="退出登录"
      message="确定要退出登录吗？"
      @confirm="handleLogoutConfirm"
      @cancel="showLogoutConfirm = false"
    />

    <!-- 统计图表 -->
    <div class="stats-wrapper">
      <h2 class="stats-title">账单统计</h2>

      <!-- 统计摘要 -->
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-label">总收入</span>
          <span class="stat-value income" :class="{ loading: isStatsLoading }">
            {{ statistics?.totalIncome || 0 }} 元
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总支出</span>
          <span class="stat-value expense" :class="{ loading: isStatsLoading }">
            {{ statistics?.totalExpense || 0 }} 元
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">结余</span>
          <span class="stat-value balance" :class="{ loading: isStatsLoading }">
            {{ statistics?.balance || 0 }} 元
          </span>
        </div>
      </div>

      <!-- 图表容器 -->
      <div class="charts-container">
        <div class="chart-item">
          <h4>收支趋势</h4>
          <div id="trend-chart" ref="trendChart" class="chart"></div>
        </div>
        <div class="chart-item">
          <h4>收支分布</h4>
          <div id="pie-chart" ref="pieChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-overlay" v-if="isStatsLoading">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>
  </div>
</template>

<script setup>
/**
 * 账单统计页面组件
 * 功能：展示用户的账单统计数据，包括收支趋势图和分布饼图
 */
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { authService, statisticsService } from "../services/auth";
import * as echarts from "echarts";
import ConfirmDialog from "./ConfirmDialog.vue";

const router = useRouter();

// 用户信息 - 当前登录用户的基本信息
const userInfo = ref(null);

// 统计数据 - 包含总收入、总支出、余额、分类数据和日期数据
const statistics = ref(null);
const isStatsLoading = ref(false); // 统计数据加载状态

// 图表实例 - 用于管理和操作ECharts图表
let chartInstance = null; // 趋势图实例
let pieChartInstance = null; // 饼图实例

// 图表容器引用 - 用于挂载ECharts图表
const trendChart = ref(null); // 趋势图容器
const pieChart = ref(null); // 饼图容器

// 退出登录确认对话框状态
const showLogoutConfirm = ref(false);

/**
 * 返回首页
 * 功能：点击返回按钮时跳转到首页
 */
const goBack = () => {
  router.push("/dashboard");
};

/**
 * 退出登录
 * 功能：清除用户登录状态并跳转到登录页
 */
const handleLogoutConfirm = () => {
  showLogoutConfirm.value = false;
  authService.logout();
  router.push("/login");
};

/**
 * 获取当前登录用户信息
 * 功能：从服务器获取当前登录用户的基本信息
 * 处理：未授权时跳转到登录页
 */
const fetchUserInfo = async () => {
  try {
    const response = await authService.getCurrentUser();
    if (response && response.code === "0000") {
      userInfo.value = response.data;
    } else if (response && response.code === "401") {
      // 未授权，跳转到登录页
      router.push("/login");
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    // 如果获取用户信息失败，跳转到登录页
    router.push("/login");
  }
};

/**
 * 获取统计数据
 * 功能：从服务器获取用户的账单统计数据
 * 处理：获取成功后更新图表数据
 */
const fetchStatistics = async () => {
  try {
    isStatsLoading.value = true;
    const response = await statisticsService.getStatistics();
    if (response.code === "0000") {
      statistics.value = response.data;
      // 更新图表
      updateCharts();
    }
  } catch (err) {
    console.error("获取统计数据失败:", err);
  } finally {
    isStatsLoading.value = false;
  }
};

/**
 * 初始化趋势图
 * 功能：创建收支趋势图的ECharts实例并配置基本选项
 */
const initTrendChart = () => {
  if (!trendChart.value) return;

  chartInstance = echarts.init(trendChart.value);

  const option = {
    title: {
      text: "收支趋势",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    legend: {
      data: ["收入", "支出"],
      bottom: 0,
    },
    xAxis: {
      type: "category",
      data: [],
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: "value",
      name: "金额（元）",
    },
    series: [
      {
        name: "收入",
        type: "line",
        data: [],
        itemStyle: {
          color: "#73d13d",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(115, 209, 61, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(115, 209, 61, 0.1)",
              },
            ],
          },
        },
      },
      {
        name: "支出",
        type: "line",
        data: [],
        itemStyle: {
          color: "#ffa940",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(255, 169, 64, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(255, 169, 64, 0.1)",
              },
            ],
          },
        },
      },
    ],
  };

  chartInstance.setOption(option);
};

/**
 * 初始化饼图
 * 功能：创建收支分布饼图的ECharts实例并配置基本选项
 */
const initPieChart = () => {
  if (!pieChart.value) return;

  pieChartInstance = echarts.init(pieChart.value);

  const option = {
    title: {
      text: "收支分布",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "收支分布",
        type: "pie",
        radius: "50%",
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  pieChartInstance.setOption(option);
};

/**
 * 更新图表数据
 * 功能：将获取到的统计数据更新到ECharts图表中
 */
const updateCharts = () => {
  if (!statistics.value) return;

  // 更新趋势图 - 设置日期、收入和支出数据
  if (chartInstance) {
    const dates = statistics.value.dateData.map((item) => item.date);
    const incomes = statistics.value.dateData.map((item) => item.income);
    const expenses = statistics.value.dateData.map((item) => item.expense);

    chartInstance.setOption({
      xAxis: {
        data: dates,
      },
      series: [
        {
          name: "收入",
          data: incomes,
        },
        {
          name: "支出",
          data: expenses,
        },
      ],
    });
  }

  // 更新饼图 - 设置收入和支出的分布数据
  if (pieChartInstance) {
    const pieData = [
      {
        name: "收入",
        value: statistics.value.totalIncome,
        itemStyle: {
          color: "#73d13d",
        },
      },
      {
        name: "支出",
        value: statistics.value.totalExpense,
        itemStyle: {
          color: "#ffa940",
        },
      },
    ];

    pieChartInstance.setOption({
      series: [
        {
          data: pieData,
        },
      ],
    });
  }
};

/**
 * 窗口大小变化时调整图表大小
 * 功能：确保图表在窗口大小变化时能正确显示
 */
const handleResize = () => {
  chartInstance?.resize();
  pieChartInstance?.resize();
};

/**
 * 组件挂载生命周期钩子
 * 功能：初始化数据和图表，设置事件监听
 */
onMounted(async () => {
  // 获取用户信息
  await fetchUserInfo();
  // 获取统计数据
  fetchStatistics();

  // 初始化图表
  initTrendChart();
  initPieChart();

  // 监听窗口大小变化，调整图表大小
  window.addEventListener("resize", handleResize);
});

/**
 * 组件卸载生命周期钩子
 * 功能：销毁图表实例，清理事件监听
 */
onUnmounted(() => {
  // 销毁图表实例，释放资源
  chartInstance?.dispose();
  pieChartInstance?.dispose();
  // 移除事件监听
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.statistics-container {
  max-width: 2100px;
  width: 1080px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}

.nav-buttons {
  display: flex;
  gap: 16px;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
}

.left {
  justify-content: flex-start;
}

.app-title {
  color: white;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  flex: 2;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 统一按钮样式 */
.back-btn,
.logout-btn {
  padding: 12px 24px;
  height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  min-width: 120px;
  margin: 0;
}

.back-btn:hover,
.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 返回按钮样式 */
.back-btn {
  background-color: #1890ff;
  color: white;
}

.back-btn:hover {
  background-color: #40a9ff;
}

/* 退出登录按钮样式 */
.logout-btn {
  background-color: #ff4d4f;
  color: white;
}

.logout-btn:hover {
  background-color: #ff7875;
}

/* 统计包装容器 */
.stats-wrapper {
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stats-wrapper:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stats-title {
  color: #333;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
}

/* 统计摘要 */
.stats-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
  flex-wrap: wrap;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px 25px;
  background-color: #fafafa;
  border-radius: 8px;
  flex: 1;
  min-width: 200px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.stat-value.income {
  color: #73d13d;
}

.stat-value.expense {
  color: #ffa940;
}

.stat-value.balance {
  color: #1890ff;
}

.stat-value.loading {
  opacity: 0.5;
  animation: pulse 1.5s infinite;
}

/* 图表容器 */
.charts-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.chart-item {
  flex: 1;
  min-width: 400px;
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.chart-item h4 {
  color: #333;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

.chart {
  height: 300px;
  width: 100%;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999;
  animation: fadeIn 0.3s ease-in-out;
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

.loading-text {
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

/* 动画效果 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics-container {
    width: 95%;
    padding: 15px;
  }

  .top-nav {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .nav-buttons {
    justify-content: space-between;
  }

  .app-title {
    font-size: 24px;
  }

  .stats-summary {
    flex-direction: column;
    gap: 15px;
  }

  .stat-item {
    min-width: auto;
  }

  .charts-container {
    flex-direction: column;
  }

  .chart-item {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .nav-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .back-btn,
  .logout-btn {
    width: 100%;
  }

  .app-title {
    font-size: 20px;
  }

  .stats-title {
    font-size: 18px;
  }

  .stat-value {
    font-size: 20px;
  }

  .chart {
    height: 250px;
  }
}
</style>
