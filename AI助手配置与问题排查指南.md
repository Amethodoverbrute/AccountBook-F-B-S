# AI助手配置与问题排查指南

## 一、AI助手配置说明

### 1.1 火山引擎API配置

AI助手使用火山引擎ARK平台的豆包模型（doubao-seed-2-0-mini）。

#### 配置步骤：

1. **注册火山引擎账号**
   - 访问 [火山引擎控制台](https://console.volcengine.com/)
   - 注册并完成实名认证

2. **开通ARK服务**
   - 在控制台中找到"ARK大模型服务"
   - 开通服务并创建API密钥

3. **获取API密钥**
   - 在ARK控制台中创建API密钥
   - 密钥格式：`ark-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

4. **配置环境变量**
   - 编辑 `backend/.env` 文件
   - 添加以下配置：
   ```env
   # 火山引擎ARK API Key
   ARK_API_KEY=ark-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

### 1.2 后端服务配置

后端服务通过 `backend/services/aiService.js` 配置AI服务：

- **API基础URL**: `https://ark.cn-beijing.volces.com/api/v3`
- **模型名称**: `doubao-seed-2-0-mini-260428`（免费模型）
- **认证方式**: Bearer Token

### 1.3 前端配置

前端通过 `frontend/src/services/auth.js` 配置API请求：

- **请求超时时间**: 30000ms（30秒）
- **请求路径**: `/api/ai/conversation`

---

## 二、常见问题与解决方案

### 2.1 问题：AI助手不回答/显示"服务暂时不可用"

**可能原因及解决方案：**

#### 原因1：API密钥配置错误

- **表现**: 后端日志显示401认证错误
- **解决方案**:
  1. 检查 `.env` 文件中的 `ARK_API_KEY` 是否正确
  2. 确保密钥格式正确（不含空格、逗号等特殊字符）
  3. 在火山引擎控制台确认密钥有效且未过期

#### 原因2：网络超时

- **表现**: 前端控制台显示 `timeout of 5000ms exceeded`
- **解决方案**:
  1. 增加前端axios超时时间（默认5秒改为30秒）
  2. 修改文件：`frontend/src/services/auth.js`
  ```javascript
  const api = axios.create({
    baseURL: "/api",
    timeout: 30000, // 改为30秒
  });
  ```

#### 原因3：MongoDB未启动

- **表现**: 前端显示"网络错误，请稍后重试"
- **解决方案**:
  1. 启动MongoDB服务
  2. 命令：`mongod --dbpath "C:\data\db"`
  3. 确保端口27017未被占用

#### 原因4：后端服务未启动

- **表现**: 请求无法到达后端
- **解决方案**:
  1. 启动后端服务：`npm run dev`
  2. 确保端口3000正常监听

### 2.2 问题：AI响应内容显示不全

**解决方案：**

1. **调整面板宽度**
   - AI面板支持向左拖动调整宽度
   - 将鼠标移到面板左侧边缘，当鼠标变成双向箭头时拖动

2. **修改最小/最大宽度限制**（可选）
   - 编辑 `frontend/src/components/ui/AIPanelComponent.vue`
   ```javascript
   const minWidth = 280; // 最小宽度
   const maxWidth = 600; // 最大宽度
   ```

### 2.3 问题：返回时间显示异常（已修复）

**问题描述**: AI响应中的时间显示为乱码或异常格式

**根本原因**: 后端服务启动时环境变量未正确加载

**解决方案**:

1. **重启后端服务**

   ```bash
   cd backend
   npm run dev
   ```

2. **确保dotenv正确配置**
   - 检查 `backend/app.js` 中是否正确加载dotenv：

   ```javascript
   require("dotenv").config();
   ```

3. **验证环境变量注入**
   - 启动日志应显示：`injecting env (13) from .env`

---

## 三、服务启动顺序

为确保AI助手正常工作，请按照以下顺序启动服务：

1. **启动MongoDB**

   ```bash
   mongod --dbpath "C:\data\db"
   ```

2. **启动后端服务**

   ```bash
   cd backend
   npm run dev
   ```

3. **启动前端服务**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 四、测试验证

### 4.1 API测试脚本

在 `backend/test-ai-api.js` 中包含了API测试脚本：

```bash
cd backend
node test-ai-api.js
```

### 4.2 预期输出

```
=== 火山引擎API测试 ===

API Key长度: 46
API URL: https://ark.cn-beijing.volces.com/api/v3/chat/completions
模型: doubao-seed-2-0-mini-260428

正在发送请求...
请求数据: {...}

=== 成功！API响应 ===
状态码: 200
响应数据: {...}
AI回复: 你好！我是你的智能记账助手...
```

---

## 五、文件结构说明

```
backend/
├── .env                    # 环境变量配置（API密钥）
├── services/
│   └── aiService.js        # AI服务核心逻辑
├── routes/
│   └── api/
│       └── ai.js           # AI接口路由
├── test-ai-api.js          # API测试脚本
└── package.json            # 依赖配置

frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── AIPanelComponent.vue  # AI面板组件
│   └── services/
│       └── auth.js         # API请求配置
└── package.json            # 依赖配置
```

---

## 六、注意事项

1. **API密钥安全**
   - 不要将密钥提交到版本控制系统
   - 将 `.env` 文件添加到 `.gitignore`

2. **免费模型限制**
   - doubao-seed-2-0-mini 是免费模型
   - 有调用次数限制，大量使用可能需要付费

3. **网络环境**
   - 确保服务器能访问火山引擎API
   - 如果在代理环境下，可能需要配置代理

4. **服务重启**
   - 修改环境变量后需要重启后端服务
   - 修改前端代码后Vite会自动热更新
