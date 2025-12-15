var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

// 导入配置项
const { DBHOST, DBPORT, DBNAME } = require("./config");

// 导入 auth 接口路由文件
const authApiRouter = require("./routes/api/auth");
// 导入account 接口路由文件
var accountRouter = require("./routes/api/account");

var app = express();

app.use(logger("dev"));
// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// 挂载 account 路由模块（针对 API 端，如移动端，PAD端，车机端等）
app.use("/api", accountRouter);
// 挂载 auth 路由模块（针对 API 端，如移动端，PAD端，车机端等）
app.use("/api", authApiRouter);

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
