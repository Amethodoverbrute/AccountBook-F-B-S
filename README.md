# 记账本应用

一个基于前后端分离架构的个人记账本应用，支持用户管理、账单记录管理、分类管理和统计分析等功能，具有现代化的技术栈和清晰的代码结构。

## 项目架构

采用前后端分离架构，前端和后端完全独立开发和部署：

- **前端**：位于 `frontend/` 目录，负责用户界面和交互
- **后端**：位于 `backend/` 目录，负责 API 服务和数据管理
- **通信方式**：通过 RESTful API 进行数据交互

## 技术栈

### 前端

| 技术       | 版本 | 用途        |
| ---------- | ---- | ----------- |
| Vue.js     | 3.x  | 前端框架    |
| Vite       | 7.x  | 构建工具    |
| Vue Router | 4.x  | 路由管理    |
| Axios      | 1.x  | HTTP 客户端 |
| ECharts    | 6.x  | 图表库      |

### 后端

| 技术       | 版本 | 用途        |
| ---------- | ---- | ----------- |
| Node.js    | -    | 运行环境    |
| Express.js | 4.x  | Web 框架    |
| MongoDB    | 9.x  | 数据库      |
| Mongoose   | 9.x  | MongoDB ODM |
| JWT        | 9.x  | 身份认证    |
| CORS       | 2.x  | 跨域支持    |
| Moment.js  | 2.x  | 时间处理    |
| Nodemon    | 3.x  | 开发热重载  |
| Winston    | -    | 日志管理    |
| Swagger    | 6.x  | API 文档    |

## 项目特点

### 技术特点

- **前后端分离架构**：前端和后端完全分离，职责清晰，便于团队协作和维护
- **现代化前端技术栈**：采用 Vue 3 + Vite + Vue Router + Axios，具有良好的开发体验和性能
- **RESTful API 设计**：后端 API 遵循 RESTful 设计规范，便于前端调用和扩展
- **JWT 认证机制**：实现了基于 JWT 的安全身份验证，支持 token 过期验证
- **用户数据隔离**：每个用户只能访问自己的账单数据，确保数据安全性
- **响应式设计**：前端页面采用响应式布局，适配不同设备的访问
- **模块化代码结构**：代码组织清晰，便于扩展和维护
- **完整的日志记录**：使用 Winston 实现了全面的日志记录
- **API 文档自动生成**：使用 Swagger 自动生成 API 文档

### 功能特点

- **用户管理**：支持用户注册、登录和退出登录功能
- **账单管理**：支持账单的添加、查询、编辑和删除功能
- **账单分类**：支持收入和支出两种账单类型
- **动态样式**：根据账单类型动态显示不同的颜色和样式
- **实时数据更新**：添加账单后实时更新账单列表
- **统计分析**：提供收支趋势图和分布饼图等统计功能
- **自定义确认对话框**：替代原生confirm()，提供美观一致的确认提示
- **优化的页面布局**：合理的间距和边距，提升用户体验
- **响应式设计**：适配不同设备的访问

## 功能模块

### 前端功能模块

| 模块名称 | 主要功能 | 核心组件 |
| ------- | ------- | ------- |
| 用户认证 | 登录、注册、退出 | Login.vue, Register.vue |
| 账单管理 | 添加、编辑、删除、查询账单 | Home.vue |
| 统计分析 | 收支趋势图、分布饼图 | Statistics.vue |
| 确认对话框 | 操作确认提示 | ConfirmDialog.vue |
| 首页 | 账单列表展示 | Home.vue |
| 分类管理 | 分类选择和过滤 | Home.vue（分类下拉框） |

### 后端功能模块

| 模块名称 | 主要功能 | 核心文件 |
| ------- | ------- | ------- |
| 用户认证 | 登录、注册、获取用户信息 | routes/api/auth.js |
| 账单管理 | 账单的增删改查 | routes/api/account.js |
| 分类管理 | 分类的增删改查 | routes/api/category.js |
| 统计分析 | 账单统计数据生成 | routes/api/statistics.js |
| 中间件 | JWT 验证、登录检查 | middlewares/checkTokenMiddleware.js |
| 数据模型 | 账单、用户、分类模型 | models/ |

## 项目结构

### 前端结构

```
frontend/
├── src/
│   ├── components/        # Vue 组件
│   │   ├── Home.vue          # 首页组件（账单管理）
│   │   ├── Login.vue         # 登录组件
│   │   ├── Register.vue      # 注册组件
│   │   ├── Statistics.vue    # 统计页面组件
│   │   ├── ConfirmDialog.vue # 自定义确认对话框组件
│   │   └── LandingPage.vue   # 首页引导组件
│   ├── router/           # 路由配置
│   │   └── index.js      # 路由定义
│   ├── services/         # 服务层
│   │   └── auth.js       # 认证、账单和统计服务
│   ├── assets/           # 静态资源
│   ├── style.css         # 全局样式
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── public/               # 静态资源
├── index.html            # HTML 模板
├── package.json          # 项目配置
└── vite.config.js        # Vite 配置
```

### 后端结构

```
backend/
├── bin/
│   └── www               # 应用入口
├── config/               # 配置文件
├── db/                   # 数据库连接
├── middlewares/          # 中间件
│   ├── checkLoginMiddleware.js # 登录检查
│   └── checkTokenMiddleware.js # Token 验证
├── models/               # 数据模型
│   ├── accountModel.js   # 账单模型
│   ├── categoryModel.js  # 分类模型
│   └── userModel.js      # 用户模型
├── routes/               # 路由
│   ├── api/              # API 路由
│   │   ├── account.js    # 账单 API
│   │   ├── auth.js       # 认证 API
│   │   ├── category.js   # 分类 API
│   │   └── statistics.js # 统计 API
│   └── web/              # Web 路由
├── app.js                # 应用配置
└── package.json          # 项目配置
```

## API 接口说明

### 认证接口

| 方法 | 路由 | 功能 | 认证要求 |
| ---- | ---- | ---- | -------- |
| POST | /api/auth/login | 用户登录 | 不需要 |
| POST | /api/auth/register | 用户注册 | 不需要 |
| GET | /api/auth/me | 获取当前登录用户信息 | 需要 JWT |
| POST | /api/auth/logout | 用户退出登录 | 需要 JWT |

### 账单接口

| 方法 | 路由 | 功能 | 认证要求 |
| ---- | ---- | ---- | -------- |
| GET | /api/account | 获取账单列表（带用户过滤） | 需要 JWT |
| GET | /api/account/:id | 获取单个账单（带用户过滤） | 需要 JWT |
| POST | /api/account | 添加账单 | 需要 JWT |
| PATCH | /api/account/:id | 更新账单（带用户过滤） | 需要 JWT |
| DELETE | /api/account/:id | 删除账单（带用户过滤） | 需要 JWT |

### 分类接口

| 方法 | 路由 | 功能 | 认证要求 |
| ---- | ---- | ---- | -------- |
| GET | /api/categories | 获取分类列表（带用户过滤） | 需要 JWT |
| POST | /api/categories | 添加分类 | 需要 JWT |
| PATCH | /api/categories/:id | 更新分类（带用户过滤） | 需要 JWT |
| DELETE | /api/categories/:id | 删除分类（带用户过滤） | 需要 JWT |

### 统计接口

| 方法 | 路由 | 功能 | 认证要求 |
| ---- | ---- | ---- | -------- |
| GET | /api/statistics | 获取账单统计数据（总收入、总支出、余额、收支趋势等） | 需要 JWT |

## API 文档

项目使用 Swagger 自动生成 API 文档，便于开发者查看和测试 API。

### 访问地址

```
http://localhost:3000/api-docs
```

### 功能特点

- 自动生成 API 文档
- 提供交互式 API 测试界面
- 支持 OpenAPI 规范
- 展示请求参数和响应格式

## 启动步骤

### 前端启动

1. 进入前端目录

```bash
cd frontend
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 访问前端应用

```
http://localhost:5173
```

### 后端启动

1. 进入后端目录

```bash
cd backend
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 后端 API 地址

```
http://localhost:3000
```

5. API 文档地址

```
http://localhost:3000/api-docs
```

## 开发说明

1. 确保 MongoDB 服务已启动
2. 前后端开发服务器分别启动
3. 前端通过 Axios 调用后端 API
4. 所有 API 请求都需要 JWT 令牌验证
5. 数据库连接配置在 `backend/config/config.js` 文件中
6. JWT 密钥配置在 `backend/config/config.js` 文件中
7. Swagger 文档配置在 `backend/config/swagger.js` 文件中

## 注意事项

- 开发环境下，前端默认端口为 5173，后端默认端口为 3000
- 生产环境需要配置环境变量和数据库连接
- 确保 CORS 配置正确，允许前端访问后端 API
- 密码加密使用的是 MD5，建议在生产环境中使用更安全的加密方式
- API 文档会自动生成，无需手动维护

## 许可证

MIT License
