## 删除Dashboard页面中的轮播图

### 问题分析

用户要求删除 `http://localhost:5173/dashboard` 路径下的轮播图，该路径对应 `Home.vue` 组件。通过代码分析，我发现 `Home.vue` 中包含完整的轮播图实现，包括模板、脚本和样式。

### 解决方案

完全删除 `Home.vue` 中的轮播图相关代码，包括：

1. **模板部分**：删除轮播图的HTML结构
2. **脚本部分**：删除轮播图相关的变量、方法和生命周期钩子调用
3. **样式部分**：删除轮播图相关的CSS样式

### 修改步骤

#### 1. 删除模板中的轮播图结构

- 删除第35-68行的轮播图相关HTML代码
- 具体包括：
  - `<!-- 轮播图区域 -->` 注释
  - `.carousel-section` 容器
  - `.carousel` 轮播图主体
  - 轮播图项和占位符
  - 轮播图控制按钮
  - 指示器

#### 2. 删除脚本中的轮播图相关代码

- 删除轮播图相关变量（第348-351行）：
  - `carouselRef`
  - `currentSlide`
  - `slideInterval`
  - `slideDuration`

- 删除轮播图相关方法（第686-713行）：
  - `nextSlide()`
  - `prevSlide()`
  - `goToSlide()`
  - `startAutoPlay()`
  - `stopAutoPlay()`

- 删除生命周期钩子中的轮播图调用：
  - `onMounted` 中的 `startAutoPlay()`（第724行）
  - `onUnmounted` 中的 `stopAutoPlay()`（第729行）

#### 3. 删除样式中的轮播图相关CSS

- 删除第1888-2025行的轮播图相关样式
- 具体包括：
  - `.carousel-section`
  - `.carousel-container`
  - `.carousel`
  - `.carousel-item`
  - `.carousel-controls`
  - `.carousel-indicators`
  - `.carousel-placeholder`
  - 相关的响应式样式

### 预期效果

- `http://localhost:5173/dashboard` 页面不再显示轮播图
- 页面布局更加简洁，直接展示账单管理和统计功能
- 不影响其他功能的正常使用
- 代码更加精简，减少不必要的资源消耗

### 注意事项

- 确保只删除 `Home.vue` 中的轮播图代码，不要影响 `LandingPage.vue` 中的轮播图
- 验证删除后页面布局是否正常
- 确保所有功能按钮和交互正常工作

