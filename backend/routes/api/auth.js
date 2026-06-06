/**
 * 认证路由模块
 * 功能：处理用户登录、注册、退出登录和获取当前用户信息等认证相关操作
 * 作者：系统自动生成
 * 时间：2025-04-02
 */
const express = require('express');
const router = express.Router();

// 导入 jsonwebtoken 模块
const jwt = require('jsonwebtoken');
// 导入用户模型
const UserModel = require('../../models/userModel');
// 导入分类模型
const CategoryModel = require('../../models/categoryModel');
// 导入md5加密模块
const md5 = require('md5');
// 导入配置文件
const { SECRET } = require('../../config');
// 导入自定义日志
const logger = require('../../config/logger');
// 导入token验证中间件
const checkTokenMiddleware = require('../../middlewares/checkTokenMiddleware');

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: '0000'
 *                 msg:
 *                   type: string
 *                   example: '用户登录成功'
 *                 token:
 *                   type: string
 *                   description: JWT令牌
 *       400:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
// 登录 用户
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  logger.info(`用户登录请求: ${username}`);

  // 做表单验证
  if (!username || !password) {
    logger.warn(`登录失败 - ${username}: 用户名和密码不能为空`);
    return res.status(400).json({
      code: '400',
      msg: '用户名和密码不能为空',
    });
  }

  try {
    // 查询数据库，验证用户名是否已存在
    const user = await UserModel.findOne({ username });
    if (!user) {
      logger.warn(`登录失败 - ${username}: 用户名不存在`);
      return res.json({
        code: '400',
        msg: '用户名不存在',
      });
    }

    // 验证密码是否正确
    if (user.password !== md5(password)) {
      logger.warn(`登录失败 - ${username}: 密码错误`);
      return res.json({
        code: '400',
        msg: '密码错误',
      });
    }

    // 检查用户是否已有分类，如果没有则添加默认分类
    const existingCategories = await CategoryModel.find({ userId: user._id });
    if (existingCategories.length === 0) {
      // 为用户创建默认分类
      const defaultCategories = [
        // 支出分类
        { name: '工作', type: 'expense', userId: user._id },
        { name: '生活', type: 'expense', userId: user._id },
        { name: '其他', type: 'expense', userId: user._id },
        // 收入分类
        { name: '工作', type: 'income', userId: user._id },
        { name: '生活', type: 'income', userId: user._id },
        { name: '其他', type: 'income', userId: user._id },
      ];

      // 批量创建默认分类
      await CategoryModel.insertMany(defaultCategories);
      logger.info(`为用户 ${username} 创建默认分类成功`);
    }

    // 登录成功，生成token返回给客户端
    const token = jwt.sign({ userId: user._id }, SECRET, {
      expiresIn: '1h',
    });

    logger.info(`登录成功 - ${username}`);
    res.json({
      code: '0000',
      msg: '用户登录成功',
      token,
    });
  } catch (error) {
    logger.error(`登录失败 - ${username}: ${error.message}`);
    res.status(500).json({
      code: '500',
      msg: '登录失败，服务器错误',
    });
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: 用户退出登录
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 退出登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
// 退出登录，使用POST方法更安全比GET方法
router.post('/auth/logout', (req, res) => {
  // 前后端分离架构下，退出登录只需要前端清除token即可
  logger.info('用户退出登录');
  res.json({
    code: '0000',
    msg: '用户退出登录成功',
  });
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: 获取当前登录用户信息
 *     tags: [认证]
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
 *                   example: '0000'
 *                 msg:
 *                   type: string
 *                   example: '获取用户信息成功'
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     userId:
 *                       type: string
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
// 获取当前登录用户信息 - 使用checkTokenMiddleware中间件简化代码
router.get('/auth/me', checkTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    logger.info(`获取用户信息请求: userId=${userId}`);

    // 使用async/await简化异步操作
    const user = await UserModel.findById(userId).select('-password');

    if (!user) {
      logger.warn(`获取用户信息失败: userId=${userId} 不存在`);
      return res.status(404).json({
        code: '404',
        msg: '用户不存在',
      });
    }

    logger.info(
      `获取用户信息成功: userId=${userId}, username=${user.username}, role=${user.role}`
    );

    res.json({
      code: '0000',
      msg: '获取用户信息成功',
      data: {
        username: user.username,
        userId: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`获取用户信息失败: 错误信息: ${error.message}`);
    return res.status(500).json({
      code: '500',
      msg: '服务器内部错误',
    });
  }
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 注册失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
// 注册用户
router.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  logger.info(`用户注册请求: ${username}`);

  // 做表单验证
  if (!username || !password) {
    logger.warn(`注册失败 - ${username}: 用户名和密码不能为空`);
    return res.status(400).json({
      code: '400',
      msg: '用户名和密码不能为空',
    });
  }

  try {
    // 验证用户名是否已存在
    const user = await UserModel.findOne({ username });
    if (user) {
      logger.warn(`注册失败 - ${username}: 用户名已存在`);
      return res.status(400).json({
        code: '400',
        msg: '用户名已存在',
      });
    }

    // 创建新用户
    const newUser = new UserModel({
      username,
      password: md5(password),
    });

    // 保存用户到数据库
    const savedUser = await newUser.save();

    // 为新用户创建默认分类
    const defaultCategories = [
      // 支出分类
      { name: '工作', type: 'expense', userId: savedUser._id },
      { name: '生活', type: 'expense', userId: savedUser._id },
      { name: '其他', type: 'expense', userId: savedUser._id },
      // 收入分类
      { name: '工作', type: 'income', userId: savedUser._id },
      { name: '生活', type: 'income', userId: savedUser._id },
      { name: '其他', type: 'income', userId: savedUser._id },
    ];

    // 批量创建默认分类
    await CategoryModel.insertMany(defaultCategories);
    logger.info(`为用户 ${username} 创建默认分类成功`);

    logger.info(`注册成功 - ${username}`);
    res.status(201).json({
      code: '0000',
      msg: '用户注册成功',
    });
  } catch (error) {
    logger.error(`注册失败 - ${username}: ${error.message}`);
    res.status(500).json({
      code: '500',
      msg: '注册失败，服务器错误',
    });
  }
});

module.exports = router;
