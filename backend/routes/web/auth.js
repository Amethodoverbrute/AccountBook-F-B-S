/**
 * 用户认证路由模块
 * --------------------------
 * 功能：处理用户注册、登录和退出登录的HTTP请求
 * 技术栈：
 * - Express Router：路由管理
 * - MongoDB (Mongoose)：用户数据存储
 * - MD5：密码加密（注意：生产环境建议使用bcrypt等更安全的加密方式）
 * - Session：用户登录状态管理
 *
 * 路由列表：
 * - GET    /register    - 渲染注册页面
 * - POST   /register    - 处理用户注册请求
 * - GET    /login       - 渲染登录页面
 * - POST   /login       - 处理用户登录请求
 * - POST   /logout      - 处理用户退出登录请求
 */
const express = require("express");
const router = express.Router();

// 导入用户模型
const UserModel = require("../../models/userModel");
// 导入md5加密模块
const md5 = require("md5");

/**
 * GET /register
 * 渲染用户注册页面
 */
router.get("/register", (req, res) => {
  // 渲染注册页面模板
  res.render("auth/register");
});

/**
 * POST /register
 * 处理用户注册请求
 * 流程：
 * 1. 获取并验证用户输入
 * 2. 检查用户名是否已存在
 * 3. 加密密码并创建新用户
 * 4. 保存到数据库并返回结果
 */
router.post("/register", (req, res) => {
  // 开发调试：打印请求体内容
  console.log(req.body);

  // 1. 获取用户提交的注册信息
  const { username, password } = req.body;

  // 2. 验证用户输入完整性
  if (!username || !password) {
    return res.status(400).send("用户名和密码不能为空");
  }

  // 3. 检查用户名是否已存在
  UserModel.findOne({ username })
    .then((user) => {
      if (user) {
        return res.status(400).send("用户名已存在");
      }

      // 4. 加密密码并创建新用户
      const newUser = new UserModel({
        username,
        password: md5(password), // 使用MD5加密密码
      });

      // 5. 保存用户到数据库
      newUser
        .save()
        .then(() => {
          // 注册成功，渲染成功页面，自动跳转至登录页
          res.status(201).render("success", {
            msg: "用户注册成功",
            url: "/login",
          });
        })
        .catch((error) => {
          // 数据库保存失败
          console.error("注册失败:", error);
          res.status(500).send("注册失败，请稍后重试");
        });
    })
    .catch((error) => {
      // 数据库查询失败
      console.error("查询用户失败:", error);
      res.status(500).send("注册失败，请稍后重试");
    });
});

/**
 * GET /login
 * 渲染用户登录页面
 */
router.get("/login", (req, res) => {
  // 渲染登录页面模板
  res.render("auth/login");
});

/**
 * POST /login
 * 处理用户登录请求
 * 流程：
 * 1. 获取并验证用户输入
 * 2. 检查用户名是否存在
 * 3. 验证密码是否正确
 * 4. 登录成功则写入Session
 * 5. 返回登录结果
 */
router.post("/login", (req, res) => {
  // 开发调试：打印请求体内容
  console.log(req.body);

  // 1. 获取用户提交的登录信息
  const { username, password } = req.body;

  // 2. 验证用户输入完整性
  if (!username || !password) {
    return res.status(400).send("用户名和密码不能为空");
  }

  // 3. 查询数据库，验证用户名是否存在
  UserModel.findOne({ username })
    .then((user) => {
      if (!user) {
        // 用户名不存在，返回带注册链接的HTML响应
        return res
          .status(400)
          .type("text/html")
          .send("用户名不存在，请先<a href='/register'>注册</a>");
      }

      // 4. 验证密码是否正确
      if (user.password !== md5(password)) {
        return res.status(400).send("密码错误");
      }

      // 5. 登录成功，将用户信息写入Session
      req.session.user = user;

      // 6. 渲染成功页面，自动跳转至账单页
      res.status(200).render("success", {
        msg: "用户登录成功",
        url: "/account",
      });
    })
    .catch((error) => {
      // 数据库查询失败
      console.error("登录失败:", error);
      res.status(500).send("登录失败，请稍后重试");
    });
});

/**
 * POST /logout
 * 处理用户退出登录请求
 * 注意：使用POST方法比GET更安全，防止CSRF攻击
 */
router.post("/logout", (req, res) => {
  // 销毁当前用户的Session
  req.session.destroy((err) => {
    if (err) {
      // Session销毁失败
      console.error("退出登录失败:", err);
      return res.status(500).send("退出登录失败");
    }

    // 退出成功，渲染成功页面，自动跳转至登录页
    res.render("success", {
      msg: "用户退出登录成功",
      url: "/login",
    });
  });
});

module.exports = router;
