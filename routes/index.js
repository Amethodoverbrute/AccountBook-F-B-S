var express = require("express");
var router = express.Router();

/* GET home page. */
// 记账本列表
router.get("/account", function (req, res, next) {
  res.render("list");
});

// 添加记录
router.get("/account/create", function (req, res, next) {
  res.render("create");
});

// 新增记录
router.post("/account", function (req, res, next) {
  // 获取请求体数据
  const { item, type, amount } = req.body;
  console.log(req.body);
  res.send("新增记录");
});

module.exports = router;
