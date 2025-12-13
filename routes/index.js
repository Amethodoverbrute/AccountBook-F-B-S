var express = require("express");
var router = express.Router();
// 导入 lowdb，用于操作 JSON 文件数据库。（后面就就用不到了）
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync(__dirname + "/../data/db.json");
// 获取 db 实例对象（后面就用不到了）
const db = low(adapter);

// 导入 shortid 模块（后面就用不到了）
// shortid 用于生成唯一的短 ID 字符串，常用于数据库主键或文件名
const shortid = require("shortid");
// 导入 moment 模块
const moment = require("moment");
const AccountModel = require("../models/accountModel");

// 测试 格式化时间
// console.log(moment("2025-12-13T10:16"));
// console.log(moment("2025-12-13T10:16").toDate());
// 2025-12-13T10:16 => 2025-12-13 10:16
// const formatTime = (time) => moment(time).format("YYYY-MM-DD HH:mm");

/* GET home page. */
// 记账本列表
router.get("/account", async function (req, res, next) {
  try {
    // 从MongoDB获取记账本列表数据
    const accountList = await AccountModel.find().sort({ time: -1 });
    console.log("从MongoDB获取的数据:", accountList);
    res.render("list", { accountList });
  } catch (err) {
    console.error("获取数据失败:", err);
    res.status(500).send("获取数据失败");
  }
});

// 添加记录
router.get("/account/create", function (req, res, next) {
  res.render("create");
});

// 添加记录
router.post("/account", async function (req, res, next) {
  // const { item, type, amount } = req.body;
  // time: '2025-12-13T10:16' => new Date()
  // time: '2025-12-13T10:16' => Object（可借助moment包） => new Date()
  // console.log(req.body);

  try {
    // 插入数据库
    await AccountModel.create({
      ...req.body,
      // 将前端的item字段映射为后端模型的title字段
      title: req.body.item,
      // 修改 time 属性的值为格式化后的时间
      time: moment(req.body.time).toDate(),
    });
    // 成功添加数据后，渲染成功页面
    res.render("success", { msg: "添加成功~~", url: "/account" });
  } catch (err) {
    res.status(500).send("添加失败");
    console.log(err);
    return;
  }
});

// 删除记录
router.get("/account/delete/:id", async function (req, res, next) {
  try {
    // 获取路由参数 id
    let id = req.params.id;
    // 删除数据
    await AccountModel.findByIdAndDelete(id);
    res.render("success", { msg: "删除成功~~", url: "/account" });
  } catch (err) {
    console.error("删除数据失败:", err);
    res.status(500).send("删除失败");
  }
});

module.exports = router;
