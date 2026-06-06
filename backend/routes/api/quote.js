/**
 * 名言API路由模块
 * 功能：处理名言相关的API请求，包括获取随机名言、添加系统名言等
 */
const express = require('express');
const router = express.Router();

// 导入模型
const QuoteModel = require('../../models/quoteModel');
const UserModel = require('../../models/userModel');

// 导入中间件
const checkTokenMiddleware = require('../../middlewares/checkTokenMiddleware');
const checkAdminMiddleware = require('../../middlewares/checkAdminMiddleware');

// 导入日志配置
const logger = require('../../config/logger');

/**
 * @openapi
 * /quotes/random:
 *   get:
 *     summary: 获取随机名人名言
 *     tags: [名言]
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 msg:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                     author:
 *                       type: string
 *                     category:
 *                       type: string
 */
// 获取随机名人名言
router.get('/quotes/random', async (req, res) => {
  try {
    // 查询总数量
    const count = await QuoteModel.countDocuments();
    // 生成随机索引
    const randomIndex = Math.floor(Math.random() * count);
    // 查询随机名言
    const quote = await QuoteModel.findOne().skip(randomIndex);

    logger.info(`获取随机名言成功`);

    res.json({
      code: '0000',
      msg: '获取随机名言成功',
      data: quote,
    });
  } catch (error) {
    logger.error(`获取随机名言失败: ${error.message}`);
    res.status(500).json({
      code: '500',
      msg: '获取随机名言失败，服务器错误',
    });
  }
});

/**
 * @openapi
 * /quotes:
 *   post:
 *     summary: 添加系统名言（管理员）
 *     tags: [名言]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [励志, 财务, 生活, 学习, 工作, 其他]
 *     responses:
 *       200:
 *         description: 添加成功
 */
// 添加系统名言（管理员）
router.post(
  '/quotes',
  checkTokenMiddleware,
  checkAdminMiddleware,
  async (req, res) => {
    const { content, author, category } = req.body;

    try {
      // 创建新名言
      const newQuote = new QuoteModel({
        content,
        author,
        category,
      });

      // 保存到数据库
      await newQuote.save();

      logger.info(`添加系统名言成功: ${content} - ${author}`);

      res.json({
        code: '0000',
        msg: '添加系统名言成功',
      });
    } catch (error) {
      logger.error(`添加系统名言失败: ${error.message}`);
      res.status(500).json({
        code: '500',
        msg: '添加系统名言失败，服务器错误',
      });
    }
  }
);

/**
 * @openapi
 * /quotes/me:
 *   get:
 *     summary: 获取当前用户的名言（优先返回用户自定义，否则返回随机系统名言）
 *     tags: [名言]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
// 获取当前用户的名言（优先返回用户自定义，否则返回随机系统名言）
router.get('/quotes/me', checkTokenMiddleware, async (req, res) => {
  try {
    // 获取当前用户信息
    const userId = req.user.userId;

    // 查询用户信息
    const user = await UserModel.findById(userId);

    let quote = null;

    // 如果用户有自定义名言，返回该名言
    if (user.quote && user.quote.content) {
      quote = {
        content: user.quote.content,
        author: user.quote.author || user.username,
        isUserCustom: true,
      };
    } else {
      // 否则返回随机系统名言
      const count = await QuoteModel.countDocuments();
      const randomIndex = Math.floor(Math.random() * count);
      quote = await QuoteModel.findOne().skip(randomIndex);
      quote.isUserCustom = false;
    }

    logger.info(`获取当前用户名言成功: userId=${userId}`);

    res.json({
      code: '0000',
      msg: '获取当前用户名言成功',
      data: quote,
    });
  } catch (error) {
    logger.error(`获取当前用户名言失败: ${error.message}`);
    res.status(500).json({
      code: '500',
      msg: '获取当前用户名言失败，服务器错误',
    });
  }
});

module.exports = router;
