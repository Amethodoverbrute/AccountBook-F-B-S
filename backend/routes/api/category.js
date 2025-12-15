const express = require("express");
const router = express.Router();
const CategoryModel = require("../../models/categoryModel");
const checkTokenMiddleware = require("../../middlewares/checkTokenMiddleware");
const logger = require("../../config/logger");

// 获取分类列表
router.get("/categories", checkTokenMiddleware, async function (req, res, next) {
  try {
    // 获取当前用户ID
    const { userId } = req.user;
    
    logger.info(`获取分类列表请求 - userId: ${userId}`);
    
    // 获取查询参数，支持按类型过滤
    const { type } = req.query;
    
    // 构建查询条件
    const query = { userId };
    if (type) {
      query.type = type;
    }
    
    // 查询分类列表
    const categories = await CategoryModel.find(query).sort({ createdAt: -1 });
    
    logger.info(`获取分类列表成功 - userId: ${userId}, count: ${categories.length}`);
    
    res.json({
      code: "0000",
      msg: "获取分类列表成功",
      data: categories,
    });
  } catch (err) {
    logger.error(`获取分类列表失败 - userId: ${req.user?.userId || 'unknown'}: ${err.message}`);
    res.json({
      code: "0001",
      msg: "获取分类列表失败",
      data: null,
    });
  }
});

// 获取单个分类
router.get("/categories/:id", checkTokenMiddleware, async function (req, res, next) {
  try {
    // 获取路由参数 id
    let id = req.params.id;
    // 获取当前用户ID
    const { userId } = req.user;
    
    logger.info(`获取单个分类请求 - userId: ${userId}, categoryId: ${id}`);
    
    // 查询数据（添加用户ID过滤）
    const category = await CategoryModel.findOne({ _id: id, userId });
    if (!category) {
      logger.warn(`获取单个分类失败 - userId: ${userId}, categoryId: ${id}: 分类不存在或无权访问`);
      return res.status(404).json({
        code: "4041",
        msg: "分类不存在或无权访问",
        data: null,
      });
    }
    
    logger.info(`获取单个分类成功 - userId: ${userId}, categoryId: ${id}`);
    res.json({
      code: "0000",
      msg: "获取分类成功",
      data: category,
    });
  } catch (err) {
    logger.error(`获取单个分类失败 - userId: ${req.user?.userId || 'unknown'}, categoryId: ${req.params.id}: ${err.message}`);
    res.json({
      code: "0001",
      msg: "获取分类失败",
      data: null,
    });
  }
});

// 添加分类
router.post("/categories", checkTokenMiddleware, async function (req, res, next) {
  try {
    // 获取当前用户ID
    const { userId } = req.user;
    
    logger.info(`添加分类请求 - userId: ${userId}, name: ${req.body.name}`);
    
    // 检查必填字段
    const { name, type } = req.body;
    if (!name || !type) {
      logger.warn(`添加分类失败 - userId: ${userId}: 缺少必填字段: name 或 type`);
      return res.status(400).json({
        code: "4001",
        msg: "缺少必填字段: name 或 type",
        data: null,
      });
    }
    
    // 插入数据库（关联当前用户ID）
    const category = await CategoryModel.create({
      ...req.body,
      userId,
    });
    
    logger.info(`添加分类成功 - userId: ${userId}, categoryId: ${category._id}`);
    res.json({
      code: "0000",
      msg: "添加分类成功",
      data: category,
    });
  } catch (err) {
    logger.error(`添加分类失败 - userId: ${req.user?.userId || 'unknown'}: ${err.message}`);
    res.status(500).json({
      code: "5001",
      msg: "添加分类失败",
      data: null,
      error: err.message,
    });
  }
});

// 更新分类
router.patch("/categories/:id", checkTokenMiddleware, async function (req, res, next) {
  try {
    // 获取路由参数 id
    let id = req.params.id;
    // 获取当前用户ID
    const { userId } = req.user;
    
    logger.info(`更新分类请求 - userId: ${userId}, categoryId: ${id}`);
    
    // 更新数据（添加用户ID过滤）
    const category = await CategoryModel.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      {
        new: true,
      }
    );
    if (!category) {
      logger.warn(`更新分类失败 - userId: ${userId}, categoryId: ${id}: 分类不存在或无权访问`);
      return res.status(404).json({
        code: "4041",
        msg: "分类不存在或无权访问",
        data: null,
      });
    }
    
    logger.info(`更新分类成功 - userId: ${userId}, categoryId: ${id}`);
    res.json({
      code: "0000",
      msg: "更新分类成功",
      data: category,
    });
  } catch (err) {
    logger.error(`更新分类失败 - userId: ${req.user?.userId || 'unknown'}, categoryId: ${req.params.id}: ${err.message}`);
    res.json({
      code: "0001",
      msg: "更新分类失败",
      data: null,
    });
  }
});

// 删除分类
router.delete("/categories/:id", checkTokenMiddleware, async function (req, res, next) {
  try {
    // 获取路由参数 id
    let id = req.params.id;
    // 获取当前用户ID
    const { userId } = req.user;
    
    logger.info(`删除分类请求 - userId: ${userId}, categoryId: ${id}`);
    
    // 删除数据（添加用户ID过滤）
    const result = await CategoryModel.findOneAndDelete({ _id: id, userId });
    if (!result) {
      logger.warn(`删除分类失败 - userId: ${userId}, categoryId: ${id}: 分类不存在或无权访问`);
      return res.status(404).json({
        code: "4041",
        msg: "分类不存在或无权访问",
        data: null,
      });
    }
    
    logger.info(`删除分类成功 - userId: ${userId}, categoryId: ${id}`);
    res.json({
      code: "0000",
      msg: "删除分类成功",
      data: null,
    });
  } catch (err) {
    logger.error(`删除分类失败 - userId: ${req.user?.userId || 'unknown'}, categoryId: ${req.params.id}: ${err.message}`);
    res.json({
      code: "0001",
      msg: "删除分类失败",
      data: null,
    });
  }
});

module.exports = router;