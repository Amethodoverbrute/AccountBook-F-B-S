var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");

// 导入 moment 模块
const moment = require("moment");
const AccountModel = require("../../models/accountModel");

// 测试 格式化时间
// console.log(moment("2025-12-13T10:16"));
// console.log(moment("2025-12-13T10:16").toDate());
// 2025-12-13T10:16 => 2025-12-13 10:16
// const formatTime = (time) => moment(time).format("YYYY-MM-DD HH:mm");

// 导入 token 中间件
const checkTokenMiddleware = require("../../middlewares/checkTokenMiddleware");
// 导入配置文件
const { SECRET } = require("../../config");

/* GET home page. */
// 获取单个记录
router.get(
  "/account/:id",
  checkTokenMiddleware,
  async function (req, res, next) {
    try {
      // 获取路由参数 id
      let id = req.params.id;
      // 获取当前用户ID
      const { userId } = req.user;
      // 查询数据（添加用户ID过滤）
      const data = await AccountModel.findOne({ _id: id, userId });
      if (!data) {
        return res.status(404).json({
          code: "4041",
          msg: "记录不存在或无权访问",
          data: null,
        });
      }
      res.json({
        // 响应编号
        code: "0000",
        // 响应的信息
        msg: "获取数据成功",
        // 响应的数据
        data: data,
      });
    } catch (err) {
      console.error("获取数据失败:", err);
      res.json({
        // 响应编号
        code: "0001",
        // 响应的信息
        msg: "获取数据失败",
        // 响应的数据
        data: null,
      });
    }
  }
);

// 读取记账本列表
router.get("/account", checkTokenMiddleware, async function (req, res, next) {
  // 从请求对象中获取用户信息
  console.log(req.user);
  try {
    // 获取当前用户ID
    const { userId } = req.user;
    // 从MongoDB获取记账本列表数据并按时间倒序排序（添加用户ID过滤）
    const data = await AccountModel.find({ userId }).sort({ time: -1 });
    // 响应成功的提示
    res.json({
      // 响应编号
      code: "0000",
      // 响应的信息
      msg: "获取数据成功",
      // 响应的数据
      data,
    });
  } catch (err) {
    console.error("获取数据失败:", err);
    res.json({
      // 响应编号
      code: "0001",
      // 响应的信息
      msg: "获取数据失败",
      // 响应的数据
      data: null,
    });
  }
});

// 添加记录
router.post("/account", checkTokenMiddleware, async function (req, res, next) {
  // 可以补充更完善的“表单验证”逻辑，例如检查必填字段、字段类型等
  try {
    // 打印请求体，用于调试
    console.log("请求体内容:", req.body);

    // 检查必填字段 - 支持item和title两种字段名
    const title = req.body.title || req.body.item;
    const amount = req.body.amount;

    if (!title || !amount) {
      return res.status(400).json({
        code: "4001",
        msg: "缺少必填字段: title/item 或 amount",
        data: null,
      });
    }

    // 获取当前用户ID
    const { userId } = req.user;

    // 插入数据库（关联当前用户ID）
    const data = await AccountModel.create({
      ...req.body,
      // 使用title字段（优先使用req.body.title，其次是req.body.item）
      title: title,
      // 关联当前用户ID
      userId,
      // 修改 time 属性的值为格式化后的时间
      time: req.body.time ? moment(req.body.time).toDate() : new Date(),
    });
    res.json({
      // 响应编号
      code: "0000",
      // 响应的信息
      msg: "添加成功",
      // 响应的数据
      data: data,
    });
  } catch (err) {
    console.error("添加数据失败详细错误:", err);
    res.status(500).json({
      code: "5001",
      msg: "添加失败",
      // 响应的数据
      data: null,
      error: err.message,
    });
  }
});

// 更新单个账单信息
router.patch(
  "/account/:id",
  checkTokenMiddleware,
  async function (req, res, next) {
    try {
      // 获取路由参数 id
      let id = req.params.id;
      // 获取当前用户ID
      const { userId } = req.user;
      // 更新数据（添加用户ID过滤）
      const data = await AccountModel.findOneAndUpdate(
        { _id: id, userId },
        req.body,
        {
          new: true,
        }
      );
      if (!data) {
        return res.status(404).json({
          code: "4041",
          msg: "记录不存在或无权访问",
          data: null,
        });
      }
      res.json({
        // 响应编号
        code: "0000",
        // 响应的信息
        msg: "更新成功",
        // 响应的数据
        data: data,
      });
    } catch (err) {
      console.error("更新数据失败:", err);
      res.json({
        // 响应编号
        code: "0001",
        // 响应的信息
        msg: "更新失败",
        // 响应的数据
        data: null,
      });
    }
  }
);

// 删除账单
router.delete(
  "/account/:id",
  checkTokenMiddleware,
  async function (req, res, next) {
    try {
      // 获取路由参数 id
      let id = req.params.id;
      // 获取当前用户ID
      const { userId } = req.user;
      // 删除数据（添加用户ID过滤）
      const result = await AccountModel.findOneAndDelete({ _id: id, userId });
      if (!result) {
        return res.status(404).json({
          code: "4041",
          msg: "记录不存在或无权访问",
          data: null,
        });
      }
      res.json({
        // 响应编号
        code: "0000",
        // 响应的信息
        msg: "删除成功",
        // 响应的数据
        data: null,
      });
    } catch (err) {
      console.error("删除数据失败:", err);
      res.json({
        // 响应编号
        code: "0001",
        // 响应的信息
        msg: "删除失败",
        // 响应的数据
        data: null,
      });
    }
  }
);

module.exports = router;
