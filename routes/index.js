var express = require("express");
var router = express.Router();
// 导入 lowdb
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync(__dirname + "/../data/db.json");
// 获取 db 实例对象
const db = low(adapter);

// 导入 shortid 模块
// shortid 用于生成唯一的短 ID 字符串，常用于数据库主键或文件名
const shortid = require("shortid");

/* GET home page. */
// 记账本列表
router.get("/account", function (req, res, next) {
  // 获取记账本列表数据
  const accountList = db.get("account").value();
  // console.log(accountList);
  res.render("list", { accountList });
});

// 添加记录
router.get("/account/create", function (req, res, next) {
  res.render("create");
});

// 新增记录
router.post("/account", function (req, res, next) {
  // 获取请求体数据
  // const { item, type, amount } = req.body;
  // console.log(req.body);
  // 生成唯一 ID
  let id = shortid.generate();
  // 写入数据
  db.get("account")
    .unshift({ id: id, ...req.body })
    .write();
  res.render("success", { msg: "添加成功~~", url: "/account" });
});

// 删除记录
router.get("/account/delete/:id", function (req, res, next) {
  // 获取路由参数 id
  let id = req.params.id;
  // 删除数据
  db.get("account").remove({ id: id }).write();
  res.render("success", { msg: "删除成功~~", url: "/account" });
});

module.exports = router;
