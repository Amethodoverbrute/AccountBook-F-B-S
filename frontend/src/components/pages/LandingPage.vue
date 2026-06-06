<template>
  <div class="landing-page">
    <!-- 顶部导航栏 -->
    <header class="landing-header">
      <div class="header-content">
        <!-- Logo -->
        <img
          src="/logo/AccountBookLogo.png"
          alt="记账本Logo"
          class="logo-img"
        />
        <!-- 标题 -->
        <h1 class="page-title">记账本</h1>
        <!-- 登录/注册按钮 -->
        <div class="auth-buttons">
          <a href="/login" class="login-btn">登录</a>
          <span class="separator">|</span>
          <a href="/register" class="register-btn">注册</a>
        </div>
      </div>
    </header>

    <!-- 轮播图区域 -->
    <main class="carousel-section">
      <div class="carousel-container">
        <!-- 轮播图 -->
        <div class="carousel" ref="carouselRef">
          <div class="carousel-item" :class="{ active: currentSlide === 0 }">
            <img
              src="/images/HomePage.png"
              alt="首页预览"
              class="carousel-image"
            />
          </div>
          <div class="carousel-item" :class="{ active: currentSlide === 1 }">
            <img
              src="/images/BillSummary.png"
              alt="账单统计"
              class="carousel-image"
            />
          </div>
          <div class="carousel-item" :class="{ active: currentSlide === 2 }">
            <img
              src="/images/AddBill.png"
              alt="添加账单"
              class="carousel-image"
            />
          </div>
          <div class="carousel-item" :class="{ active: currentSlide === 3 }">
            <img
              src="/images/EditBill.png"
              alt="编辑账单"
              class="carousel-image"
            />
          </div>
        </div>
        <!-- 轮播图控制按钮 -->
        <div class="carousel-controls">
          <button class="control-btn prev-btn" @click="prevSlide">&lt;</button>
          <div class="carousel-indicators">
            <span
              v-for="(item, index) in 4"
              :key="index"
              class="indicator"
              :class="{ active: currentSlide === index }"
              @click="goToSlide(index)"
            ></span>
          </div>
          <button class="control-btn next-btn" @click="nextSlide">&gt;</button>
        </div>
      </div>

      <!-- 名言显示区域 -->
      <QuoteDisplay :quote="randomQuote" :show-add-button="false" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
// 导入名言显示组件
import QuoteDisplay from '../ui/QuoteDisplay.vue';

// 轮播图相关状态
const carouselRef = ref(null);
const currentSlide = ref(0);
const slideInterval = ref(null);
const slideDuration = 3000; // 3秒自动切换

// 名言相关状态
const randomQuote = ref(null);
const isLoading = ref(true);

// 获取随机名言
const fetchRandomQuote = async () => {
  try {
    const response = await fetch('/api/quotes/random');
    const data = await response.json();
    if (data.code === '0000') {
      randomQuote.value = data.data;
    }
  } catch (error) {
    console.error('获取名言失败:', error);
    // 使用默认名言
    randomQuote.value = {
      content: '生活不是缺少美，而是缺少发现美的眼睛。',
      author: '罗丹',
    };
  } finally {
    isLoading.value = false;
  }
};

// 页面加载时获取名言
onMounted(() => {
  startAutoPlay();
  fetchRandomQuote();
});

// 轮播图方法：切换到下一张
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % 4;
};

// 轮播图方法：切换到上一张
const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + 4) % 4;
};

// 轮播图方法：跳转到指定幻灯片
const goToSlide = (index) => {
  currentSlide.value = index;
};

// 轮播图方法：开始自动播放
const startAutoPlay = () => {
  slideInterval.value = setInterval(() => {
    nextSlide();
  }, slideDuration);
};

// 轮播图方法：停止自动播放
const stopAutoPlay = () => {
  if (slideInterval.value) {
    clearInterval(slideInterval.value);
    slideInterval.value = null;
  }
};

// 页面加载时启动轮播图自动播放
onMounted(() => {
  startAutoPlay();
});

// 页面卸载时停止轮播图自动播放
onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
/* 全局样式 */
.landing-page {
  width: 100%;
  min-height: auto;
  background-color: #f5f7fa;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
}

/* 顶部导航栏样式 */
.landing-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  height: 80px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 100;
  backdrop-filter: blur(10px);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.header-content {
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

/* Logo样式 */
.logo-img {
  height: 40px;
  max-height: 100%;
  width: auto;
  cursor: pointer;
  transition: transform 0.3s ease;
  object-fit: contain;
}

.logo-img:hover {
  transform: scale(1.1);
}

/* 标题样式 */
.page-title {
  font-size: 28px;
  font-weight: 600;
  color: white;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 登录/注册按钮样式 */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-btn,
.register-btn {
  text-decoration: none;
  color: white;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-btn:hover,
.register-btn:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.separator {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
}

/* 轮播图区域样式 */
.carousel-section {
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 20px 40px;
  box-sizing: border-box;
}

/* 宣传语区域样式 */
.slogan-section {
  text-align: center;
  margin-top: 30px;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.slogan {
  font-size: 32px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .slogan {
    font-size: 24px;
  }

  .slogan-section {
    margin-top: 20px;
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .slogan {
    font-size: 20px;
  }

  .slogan-section {
    margin-top: 15px;
    padding: 10px;
  }
}
/* 轮播图容器样式 */
.carousel-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  background-color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.carousel {
  position: relative;
  height: 500px;
  overflow: hidden;
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.carousel-item.active {
  opacity: 1;
  z-index: 1;
}

/* 轮播图占位符样式 */
.carousel-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.carousel-placeholder h3 {
  margin: 0 0 10px 0;
  font-size: 36px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.carousel-placeholder p {
  margin: 0;
  font-size: 20px;
  font-weight: normal;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 账单表占位符样式 */
.bill-table {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 统计图表占位符样式 */
.statistics-chart {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* 轮播图图片样式 */
.carousel-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  background-color: white;
}

/* 轮播图控制按钮样式 */
.carousel-controls {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 10;
}

.control-btn {
  width: 60px;
  height: 60px;
  border: 2px solid white;
  border-radius: 50%;
  background-color: rgba(102, 126, 234, 0.9);
  color: white;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  opacity: 1;
  z-index: 10;
}

.control-btn:hover {
  background-color: #667eea;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  transform: scale(1.15);
  border-color: #764ba2;
}

/* 轮播图指示器样式 */
.carousel-indicators {
  display: flex;
  gap: 15px;
  align-items: center;
}

.indicator {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  width: 40px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 10px;
    padding: 10px 20px;
  }

  .page-title {
    position: static;
    transform: none;
    font-size: 24px;
  }

  .carousel {
    height: 400px;
  }

  .carousel-placeholder h3 {
    font-size: 28px;
  }

  .carousel-placeholder p {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .landing-header {
    height: auto;
    padding: 15px 0;
  }

  .header-content {
    gap: 15px;
  }

  .logo {
    font-size: 28px;
  }

  .page-title {
    font-size: 22px;
  }

  .auth-buttons {
    gap: 8px;
  }

  .login-btn,
  .register-btn {
    font-size: 14px;
    padding: 6px 12px;
  }

  .carousel {
    height: 300px;
  }

  .carousel-placeholder h3 {
    font-size: 24px;
  }

  .carousel-placeholder p {
    font-size: 14px;
  }

  .control-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .indicator {
    width: 12px;
    height: 12px;
  }

  .indicator.active {
    width: 30px;
  }
}
</style>
