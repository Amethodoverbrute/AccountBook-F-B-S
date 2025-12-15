const express = require("express");
const router = express.Router();

// 导入用户模型
const UserModel = require("../../models/userModel");
// 导入md5加密模块
const md5 = require("md5");

// 注册 页面
router.get("/register", (req, res) => {
  // 响应HTML内容，渲染注册页面
  res.render("auth/register");
});

// 注册 用户
router.post("/register", (req, res) => {
  console.log(req.body);
  // 做表单验证
  //   获取用户提交的注册信息
  const { username, password } = req.body;
  //   验证用户输入是否完整
  if (!username || !password) {
    return res.status(400).send("用户名和密码不能为空");
  }
  //   验证用户名是否已存在
  UserModel.findOne({ username }).then((user) => {
    if (user) {
      return res.status(400).send("用户名已存在");
    }
    //   创建新用户
    const newUser = new UserModel({
      username,
      password: md5(password),
    });
    //   保存用户到数据库
    newUser.save().then(() => {
      res.status(201).render("success", {
        msg: "用户注册成功",
        url: "/login",
      });
    });
  });
});

// 登录 页面
router.get("/login", (req, res) => {
  // 响应HTML内容，渲染登录页面
  res.render("auth/login");
});

// 登录 用户
router.post("/login", (req, res) => {
  console.log(req.body);
  // 做表单验证
  //   获取用户提交的登录信息
  const { username, password } = req.body;
  //   验证用户输入是否完整
  if (!username || !password) {
    return res.status(400).send("用户名和密码不能为空");
  }
  //   查询数据库，验证用户名是否已存在
  UserModel.findOne({ username }).then((user) => {
    if (!user) {
      return res
        .status(400)
        .type("text/html")
        .send("用户名不存在，请先<a href='/register'>注册</a>");
    }
    //   验证密码是否正确
    if (user.password !== md5(password)) {
      return res.status(400).send("密码错误");
    }
    // 登录成功，写入session返回给客户端
    req.session.user = user;
    res.status(200).render("success", {
      msg: "用户登录成功",
      url: "/account",
    });
  });
});

// 退出登录，使用POST方法更安全比GET方法
router.post("/logout", (req, res) => {
  // 销毁session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("退出登录失败");
    }
    // 退出成功，重定向到登录页面
    res.render("success", {
      msg: "用户退出登录成功",
      url: "/login",
    });
  });
});

module.exports = router;
