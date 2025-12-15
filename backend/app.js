var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var cors = require("cors");

// 导入配置项
const { DBHOST, DBPORT, DBNAME } = require("./config");

// 导入自定义日志配置
const logger = require("./config/logger");
// 导入日志中间件
const loggerMiddleware = require("./middlewares/loggerMiddleware");

// 导入Swagger配置
const swaggerSpec = require("./config/swagger");
const swaggerUi = require("swagger-ui-express");

// 导入 auth 接口路由文件
const authApiRouter = require("./routes/api/auth");
// 导入account 接口路由文件
var accountRouter = require("./routes/api/account");
// 导入统计接口路由文件
const statisticsRouter = require("./routes/api/statistics");
// 导入分类接口路由文件
const categoryRouter = require("./routes/api/category");

var app = express();

// 使用自定义日志中间件
app.use(loggerMiddleware);

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// 应用启动日志
logger.info("Application started successfully");

// 配置Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
logger.info("Swagger UI configured at /api-docs");

// 挂载 account 路由模块（针对 API 端，如移动端，PAD端，车机端等）
app.use("/api", accountRouter);
// 挂载 auth 路由模块（针对 API 端，如移动端，PAD端，车机端等）
app.use("/api", authApiRouter);
// 挂载统计路由模块
app.use("/api", statisticsRouter);
// 挂载分类路由模块
app.use("/api", categoryRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json({
    code: "404",
    msg: "接口不存在",
  });
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    code: "" + (err.status || 500), // 确保code是字符串格式
    msg: err.message,
  });
});

module.exports = app;
