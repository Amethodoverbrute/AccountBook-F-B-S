/**
 * 用户API路由模块
 * 功能：处理用户相关的API请求，包括获取用户信息、管理用户名言等
 */
const express = require('express');
const router = express.Router();

// 导入模型
const UserModel = require('../../models/userModel');

// 导入中间件
const checkTokenMiddleware = require('../../middlewares/checkTokenMiddleware');

// 导入日志配置
const logger = require('../../config/logger');

/**
 * @openapi
 * /users/quotes:
 *   get:
 *     summary: 获取用户自定义名言
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 */
// 获取用户自定义名言
router.get('/users/quotes', checkTokenMiddleware, async (req, res) => {
  try {
    // 获取当前用户ID
    const userId = req.user.userId;

    // 查询用户信息，只返回quotes字段
    const user = await UserModel.findById(userId).select('quotes');

    logger.info(`获取用户名言成功: userId=${userId}`);

    res.json({
      code: '0000',
      msg: '获取用户名言成功',
      data: user.quotes,
    });
  } catch (error) {
    logger.error(`获取用户名言失败: ${error.message}`);
    res.status(500).json({
      code: '500',
      msg: '获取用户名言失败，服务器错误',
    });
  }
});

/**
 * @openapi
 * /users/quotes:
 *   post:
 *     summary: 用户添加自定义名言
 *     tags: [用户]
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
 *                 description: 名言内容
 *                 required: true
 *     responses:
 *       200:
 *         description: 添加成功
 */
// 用户添加自定义名言（覆盖旧名言）
router.post('/users/quotes', checkTokenMiddleware, async (req, res) => {
  const { content, author } = req.body;

  try {
    // 获取当前用户ID
    const userId = req.user.userId;

    // 更新用户名言，覆盖旧名言，使用提供的作者，默认为当前用户
    await UserModel.findByIdAndUpdate(
      userId,
      {
        quote: {
          content,
          author: author || req.user.username,
          createdAt: Date.now(),
        },
      },
      { new: true }
    );

    logger.info(`用户添加名言成功: userId=${userId}`);

    res.json({
      code: '0000',
      msg: '添加名言成功',
    });
  } catch (error) {
    logger.error(`用户添加名言失败: ${error.message}`);
    res.status(500).json({
      code: '500',
      msg: '添加名言失败，服务器错误',
    });
  }
});

/**
 * @openapi
 * /users/quotes:
 *   delete:
 *     summary: 删除用户自定义名言（清空当前名言）
 *     tags: [用户管理]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 删除成功
 */
router.delete('/users/quotes', checkTokenMiddleware, async (req, res) => {
  try {
    // 获取当前用户ID
    const userId = req.user.userId;

    // 清空用户名言
    await UserModel.findByIdAndUpdate(
      userId,
      {
        quote: {
          content: undefined,
          author: undefined,
          createdAt: Date.now(),
        },
      },
      { new: true }
    );

    logger.info(`用户删除名言成功: userId=${userId}`);

    res.json({
      code: '0000',
      msg: '删除名言成功',
    });
  } catch (error) {
    logger.error(`用户删除名言失败: ${error.message}`);
    res.status(500).json({
      code: '500',
      msg: '删除名言失败，服务器错误',
    });
  }
});

module.exports = router;
