const express = require("express");
const router = express.Router();

// 导入 jsonwebtoken 模块
const jwt = require("jsonwebtoken");
// 导入用户模型
const UserModel = require("../../models/userModel");
// 导入md5加密模块
const md5 = require("md5");
// 导入配置文件
const { SECRET } = require("../../config/config");

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
      res.json({
        code: 400,
        msg: "用户名不存在",
      });
      return;
    }
    //   验证密码是否正确
    if (user.password !== md5(password)) {
      res.json({
        code: 400,
        msg: "密码错误",
      });
      return;
    }
    // 登录成功，生成token返回给客户端
    const token = jwt.sign({ userId: user._id }, SECRET, {
      expiresIn: "1h",
    });
    res.json({
      code: 200,
      msg: "用户登录成功",
      token,
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
