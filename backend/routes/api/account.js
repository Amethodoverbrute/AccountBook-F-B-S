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
// 导入自定义日志
const logger = require("../../config/logger");

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

      logger.info(`获取单个账单请求 - userId: ${userId}, billId: ${id}`);

      // 查询数据（添加用户ID过滤）
      const data = await AccountModel.findOne({ _id: id, userId });
      if (!data) {
        logger.warn(
          `获取单个账单失败 - userId: ${userId}, billId: ${id}: 记录不存在或无权访问`
        );
        return res.status(404).json({
          code: "4041",
          msg: "记录不存在或无权访问",
          data: null,
        });
      }

      logger.info(`获取单个账单成功 - userId: ${userId}, billId: ${id}`);
      res.json({
        code: "0000",
        msg: "获取数据成功",
        data: data,
      });
    } catch (err) {
      logger.error(
        `获取单个账单失败 - userId: ${req.user?.userId || "unknown"}, billId: ${
          req.params.id
        }: ${err.message}`
      );
      res.json({
        code: "0001",
        msg: "获取数据失败",
        data: null,
      });
    }
  }
);

// 读取记账本列表
router.get("/account", checkTokenMiddleware, async function (req, res, next) {
  try {
    // 获取当前用户ID
    const { userId } = req.user;

    logger.info(`获取账单列表请求 - userId: ${userId}`);

    // 从MongoDB获取记账本列表数据并按时间倒序排序（添加用户ID过滤）
    const data = await AccountModel.find({ userId }).sort({ time: -1 });

    logger.info(`获取账单列表成功 - userId: ${userId}, count: ${data.length}`);
    res.json({
      code: "0000",
      msg: "获取数据成功",
      data,
    });
  } catch (err) {
    logger.error(
      `获取账单列表失败 - userId: ${req.user?.userId || "unknown"}: ${
        err.message
      }`
    );
    res.json({
      code: "0001",
      msg: "获取数据失败",
      data: null,
    });
  }
});

// 添加记录
router.post("/account", checkTokenMiddleware, async function (req, res, next) {
  try {
    // 获取当前用户ID
    const { userId } = req.user;

    logger.info(
      `添加账单请求 - userId: ${userId}, title: ${
        req.body.title || req.body.item
      }`
    );

    // 检查必填字段 - 支持item和title两种字段名
    const title = req.body.title || req.body.item;
    const amount = req.body.amount;

    if (!title || !amount) {
      logger.warn(
        `添加账单失败 - userId: ${userId}: 缺少必填字段: title/item 或 amount`
      );
      return res.status(400).json({
        code: "4001",
        msg: "缺少必填字段: title/item 或 amount",
        data: null,
      });
    }

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

    logger.info(`添加账单成功 - userId: ${userId}, billId: ${data._id}`);
    res.json({
      code: "0000",
      msg: "添加成功",
      data: data,
    });
  } catch (err) {
    logger.error(
      `添加账单失败 - userId: ${req.user?.userId || "unknown"}: ${err.message}`
    );
    res.status(500).json({
      code: "5001",
      msg: "添加失败",
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

      logger.info(`更新账单请求 - userId: ${userId}, billId: ${id}`);

      // 更新数据（添加用户ID过滤）
      const data = await AccountModel.findOneAndUpdate(
        { _id: id, userId },
        req.body,
        {
          new: true,
        }
      );
      if (!data) {
        logger.warn(
          `更新账单失败 - userId: ${userId}, billId: ${id}: 记录不存在或无权访问`
        );
        return res.status(404).json({
          code: "4041",
          msg: "记录不存在或无权访问",
          data: null,
        });
      }

      logger.info(`更新账单成功 - userId: ${userId}, billId: ${id}`);
      res.json({
        code: "0000",
        msg: "更新成功",
        data: data,
      });
    } catch (err) {
      logger.error(
        `更新账单失败 - userId: ${req.user?.userId || "unknown"}, billId: ${
          req.params.id
        }: ${err.message}`
      );
      res.json({
        code: "0001",
        msg: "更新失败",
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

      logger.info(`删除账单请求 - userId: ${userId}, billId: ${id}`);

      // 删除数据（添加用户ID过滤）
      const result = await AccountModel.findOneAndDelete({ _id: id, userId });
      if (!result) {
        logger.warn(
          `删除账单失败 - userId: ${userId}, billId: ${id}: 记录不存在或无权访问`
        );
        return res.status(404).json({
          code: "4041",
          msg: "记录不存在或无权访问",
          data: null,
        });
      }

      logger.info(`删除账单成功 - userId: ${userId}, billId: ${id}`);
      res.json({
        code: "0000",
        msg: "删除成功",
        data: null,
      });
    } catch (err) {
      logger.error(
        `删除账单失败 - userId: ${req.user?.userId || "unknown"}, billId: ${
          req.params.id
        }: ${err.message}`
      );
      res.json({
        code: "0001",
        msg: "删除失败",
        data: null,
      });
    }
  }
);

module.exports = router;
