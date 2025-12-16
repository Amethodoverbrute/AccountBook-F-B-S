/**
 * 应用入口文件
 * 功能：配置和启动Express应用，设置中间件和路由
 * 主要模块：
 * - 依赖导入：加载所需的第三方库和自定义模块
 * - 中间件配置：设置请求处理、日志记录、CORS等
 * - Swagger配置：API文档生成和展示
 * - 路由挂载：配置各API路由模块
 * - 错误处理：处理404和其他错误
 */
var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var cors = require("cors");

// 导入数据库配置
const { DBHOST, DBPORT, DBNAME } = require("./config");

// 导入自定义日志配置
const logger = require("./config/logger");
// 导入日志中间件：用于记录所有请求的日志
const loggerMiddleware = require("./middlewares/loggerMiddleware");

// 导入Swagger配置：用于生成API文档
const swaggerSpec = require("./config/swagger");
const swaggerUi = require("swagger-ui-express");

// 导入API路由模块
const authApiRouter = require("./routes/api/auth"); // 认证相关路由
var accountRouter = require("./routes/api/account"); // 账单相关路由
const statisticsRouter = require("./routes/api/statistics"); // 统计相关路由
const categoryRouter = require("./routes/api/category"); // 分类相关路由

// 创建Express应用实例
var app = express();

// 使用自定义日志中间件：记录所有HTTP请求
app.use(loggerMiddleware);

// 配置核心中间件
app.use(express.json()); // 解析JSON格式的请求体
app.use(express.urlencoded({ extended: false })); // 解析URL编码的请求体
app.use(cookieParser()); // 解析Cookie
app.use(cors()); // 启用CORS，允许跨域请求

// 应用启动日志
logger.info("Application started successfully");

// 配置Swagger UI：API文档访问路径为 /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
logger.info("Swagger UI configured at /api-docs");

// 挂载API路由模块
app.use("/api", accountRouter); // 账单相关API
app.use("/api", authApiRouter); // 认证相关API（登录、注册、退出等）
app.use("/api", statisticsRouter); // 统计相关API
app.use("/api", categoryRouter); // 分类相关API

// 404处理中间件：当请求的API不存在时返回404响应
app.use(function (req, res, next) {
  res.status(404).json({
    code: "404",
    msg: "接口不存在",
  });
});

// 全局错误处理中间件：处理应用中所有未捕获的错误
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    code: "" + (err.status || 500), // 确保code是字符串格式
    msg: err.message,
  });
});

module.exports = app;
