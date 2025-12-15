const express = require("express");
const router = express.Router();

// 导入 jsonwebtoken 模块
const jwt = require("jsonwebtoken");
// 导入用户模型
const UserModel = require("../../models/userModel");
// 导入md5加密模块
const md5 = require("md5");
// 导入配置文件
const { SECRET } = require("../../config");

// 登录 用户
router.post("/auth/login", (req, res) => {
  console.log(req.body);
  // 做表单验证
  //   获取用户提交的登录信息
  const { username, password } = req.body;
  //   验证用户输入是否完整
  if (!username || !password) {
    return res.status(400).json({
      code: "400",
      msg: "用户名和密码不能为空",
    });
  }
  //   查询数据库，验证用户名是否已存在
  UserModel.findOne({ username }).then((user) => {
    if (!user) {
      res.json({
        code: "400",
        msg: "用户名不存在",
      });
      return;
    }
    //   验证密码是否正确
    if (user.password !== md5(password)) {
      res.json({
        code: "400",
        msg: "密码错误",
      });
      return;
    }
    // 登录成功，生成token返回给客户端
    const token = jwt.sign({ userId: user._id }, SECRET, {
      expiresIn: "1h",
    });
    res.json({
      code: "0000",
      msg: "用户登录成功",
      token,
    });
  });
});

// 退出登录，使用POST方法更安全比GET方法
router.post("/auth/logout", (req, res) => {
  // 前后端分离架构下，退出登录只需要前端清除token即可
  res.json({
    code: "0000",
    msg: "用户退出登录成功",
  });
});

// 获取当前登录用户信息
router.get("/auth/me", (req, res) => {
  // 从请求头获取token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      code: "401",
      msg: "未授权",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 验证token
    const decoded = jwt.verify(token, SECRET);

    // 根据userId查询用户信息
    UserModel.findById(decoded.userId)
      .select("-password") // 不返回密码
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            code: "404",
            msg: "用户不存在",
          });
        }

        res.json({
          code: "0000",
          msg: "获取用户信息成功",
          data: {
            username: user.username,
            userId: user._id,
          },
        });
      });
  } catch (error) {
    return res.status(401).json({
      code: "401",
      msg: "无效的token",
    });
  }
});

// 注册用户
router.post("/auth/register", (req, res) => {
  console.log(req.body);
  // 做表单验证
  // 获取用户提交的注册信息
  const { username, password } = req.body;
  // 验证用户输入是否完整
  if (!username || !password) {
    return res.status(400).json({
      code: "400",
      msg: "用户名和密码不能为空",
    });
  }
  // 验证用户名是否已存在
  UserModel.findOne({ username }).then((user) => {
    if (user) {
      return res.status(400).json({
        code: "400",
        msg: "用户名已存在",
      });
    }
    // 创建新用户
    const newUser = new UserModel({
      username,
      password: md5(password),
    });
    // 保存用户到数据库
    newUser.save().then(() => {
      res.status(201).json({
        code: "0000",
        msg: "用户注册成功",
      });
    });
  });
});

module.exports = router;
