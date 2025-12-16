## 调整首页风格与Dashboard页面一致

### 问题分析

用户要求将 `http://localhost:5173/` 页面的风格调整为与 `http://localhost:5173/dashboard` 页面一致，同时使用public文件夹下的logo和轮播图资源。

### 资源分析

1. **Logo资源**：`public/logo/AccountBookLogo.png`
2. **轮播图资源**：`public/images/` 文件夹下的4张图片
3. **Dashboard风格**：使用渐变背景、现代化设计、响应式布局

### 解决方案

1. **更新头部导航栏**：
   - 使用与Dashboard相同的渐变背景
   - 替换文字Logo为实际图片Logo
   - 确保Logo响应式
   - 调整登录/注册按钮样式与Dashboard一致

2. **更新轮播图**：
   - 使用public/images文件夹下的实际图片
   - 保持轮播图功能不变
   - 调整轮播图样式与整体风格一致

3. **统一CSS样式**：
   - 确保整体风格与Dashboard页面一致
   - 保持响应式设计
   - 优化用户体验

### 修改步骤

#### 1. 更新模板结构

##### 1.1 替换Logo为图片

- 将第7行的文字Logo替换为`<img>`标签，使用public/logo/AccountBookLogo.png
- 添加响应式样式

##### 1.2 更新头部背景

- 将`.landing-header`的背景改为与Dashboard相同的渐变

##### 1.3 更新轮播图内容

- 将轮播图中的占位符替换为实际图片
- 使用public/images文件夹下的图片

#### 2. 修改CSS样式

##### 2.1 头部样式

- 将`landing-header`的背景改为渐变：`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- 调整文字颜色为白色
- 优化按钮样式

##### 2.2 Logo样式

- 添加响应式图片样式
- 确保Logo大小自适应

##### 2.3 轮播图样式

- 调整轮播图高度和样式
- 确保图片正确显示

### 修改内容

#### 1. 修改 `LandingPage.vue` 模板

- 替换Logo为图片
- 更新轮播图内容为实际图片

#### 2. 修改 `LandingPage.vue` 样式

- 更新头部背景为渐变
- 调整文字和按钮颜色
- 添加响应式Logo样式
- 优化轮播图样式

### 预期效果

- 首页与Dashboard页面风格一致
- 使用实际Logo和轮播图
- 响应式设计
- 现代化的视觉效果

### 注意事项

- 确保Logo大小自适应
- 确保轮播图正常工作
- 保持页面加载速度
- 确保响应式设计在不同设备上正常显示
