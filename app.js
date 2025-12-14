var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// 导入会话中间件
var session = require("express-session");
// 导入会话存储中间件
const { default: MongoStore } = require("connect-mongo");
// 导入配置项
const { DBHOST, DBPORT, DBNAME } = require("./config");

var indexRouter = require("./routes/web/index");
// 导入auth 接口路由文件
var authRouter = require("./routes/web/auth");
// 导入 auth 接口路由文件
const authApiRouter = require("./routes/api/auth");
// 导入account 接口路由文件
var accountRouter = require("./routes/api/account");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 配置会话中间件
app.use(
  session({
    // 会话名称
    name: "sid", // 设置cookie的会话名称，默认值为 connect.sid
    secret: "amob",
    resave: false, // 强制会话在每次请求后保存，默认值为 true
    saveUninitialized: false, // 强制未初始化的会话在每次请求后保存，默认值为 true
    // 会话存储
    store: new MongoStore({
      mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 会话有效期为一天
      httpOnly: true, // 只能通过 HTTP 协议访问，不能通过 JavaScript 访问
    },
  })
);
app.use(express.static(path.join(__dirname, "public")));

// 挂载 web 路由模块（针对网页端）
app.use("/", indexRouter);
// 挂载 auth 路由模块（针对登录注册等）
app.use("/", authRouter);
// 挂载 account 路由模块（针对 API 端，如移动端，PAD端，车机端等）
app.use("/api", accountRouter);
// 挂载 auth 路由模块（针对 API 端，如移动端，PAD端，车机端等）
app.use("/api", authApiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // 渲染 404 页面
  res.status(404).render("404");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
