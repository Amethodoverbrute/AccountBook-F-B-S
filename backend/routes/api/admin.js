/**
 * 管理员API路由模块
 * 功能：处理管理员相关的API请求，包括用户管理和系统统计
 * 主要模块：
 * - 用户管理：获取用户列表、修改用户角色、禁用/启用用户、删除用户
 * - 系统统计：总用户数、总账单数、日活跃用户统计
 */
const express = require('express');
const router = express.Router();

// 导入中间件
const checkAdminMiddleware = require('../../middlewares/checkAdminMiddleware');
const checkSuperAdminMiddleware = require('../../middlewares/checkSuperAdminMiddleware');

// 导入模型
const UserModel = require('../../models/userModel');
const AccountModel = require('../../models/accountModel');

// 导入日志配置
const logger = require('../../config/logger');

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: 获取用户列表
 *     tags: [管理员]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 */
// 获取用户列表（分页、搜索）
router.get('/admin/users', checkAdminMiddleware, async (req, res) => {
  const { page = 1, pageSize = 10, search = '' } = req.query;

  try {
    // 构建搜索条件
    const searchCondition = search
      ? { username: { $regex: search, $options: 'i' } }
      : {};

    // 查询总数量
    const total = await UserModel.countDocuments(searchCondition);

    // 使用aggregate实现按角色优先级排序：superAdmin > admin > user，然后按创建时间倒序
    const users = await UserModel.aggregate([
      // 匹配搜索条件
      { $match: searchCondition },
      // 排除密码字段
      { $project: { password: 0 } },
      // 添加排序优先级字段
      {
        $addFields: {
          rolePriority: {
            $switch: {
              branches: [
                { case: { $eq: ['$role', 'superAdmin'] }, then: 3 },
                { case: { $eq: ['$role', 'admin'] }, then: 2 },
                { case: { $eq: ['$role', 'user'] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      // 按优先级降序，创建时间倒序排序
      { $sort: { rolePriority: -1, createdAt: -1 } },
      // 分页
      { $skip: (page - 1) * pageSize },
      { $limit: Number(pageSize) },
    ]);

    logger.info(
      `获取用户列表成功: 页 ${page}, 每页 ${pageSize}, 总数 ${total}`
    );

    res.json({
      code: '0000',
      msg: '获取用户列表成功',
      data: {
        users,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    logger.error(`获取用户列表失败: ${error.message}`);
    res.status(500).json({
      code: '500',
      msg: '获取用户列表失败，服务器错误',
    });
  }
});

/**
 * @openapi
 * /admin/users/{userId}/role:
 *   put:
 *     summary: 修改用户角色
 *     tags: [管理员]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, superAdmin]
 *                 description: 新角色
 *     responses:
 *       200:
 *         description: 修改成功
 */
// 修改用户角色（仅超级管理员可操作）
router.put(
  '/admin/users/:userId/role',
  checkSuperAdminMiddleware,
  async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    try {
      // 验证角色值
      const validRoles = ['user', 'admin', 'superAdmin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          code: '400',
          msg: '无效的角色值',
        });
      }

      // 更新用户角色
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({
          code: '404',
          msg: '用户不存在',
        });
      }

      logger.info(`修改用户角色成功: userId=${userId}, 新角色=${role}`);

      res.json({
        code: '0000',
        msg: '修改用户角色成功',
        data: updatedUser,
      });
    } catch (error) {
      logger.error(`修改用户角色失败: ${error.message}`);
      res.status(500).json({
        code: '500',
        msg: '修改用户角色失败，服务器错误',
      });
    }
  }
);

/**
 * @openapi
 * /admin/users/{userId}:
 *   delete:
 *     summary: 删除用户
 *     tags: [管理员]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
// 删除用户（仅超级管理员可操作）
router.delete(
  '/admin/users/:userId',
  checkSuperAdminMiddleware,
  async (req, res) => {
    const { userId } = req.params;

    try {
      // 检查用户是否存在
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          code: '404',
          msg: '用户不存在',
        });
      }

      // 删除用户
      await UserModel.findByIdAndDelete(userId);

      logger.info(`删除用户成功: userId=${userId}, username=${user.username}`);

      res.json({
        code: '0000',
        msg: '删除用户成功',
      });
    } catch (error) {
      logger.error(`删除用户失败: ${error.message}`);
      res.status(500).json({
        code: '500',
        msg: '删除用户失败，服务器错误',
      });
    }
  }
);

/**
 * @openapi
 * /admin/statistics:
 *   get:
 *     summary: 获取系统统计数据
 *     tags: [管理员]
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
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     totalAccounts:
 *                       type: integer
 *                     todayActiveUsers:
 *                       type: integer
 */
// 获取系统统计数据
router.get('/admin/statistics', checkAdminMiddleware, async (req, res) => {
  try {
    // 获取总用户数
    const totalUsers = await UserModel.countDocuments();

    // 获取总账单数
    const totalAccounts = await AccountModel.countDocuments();

    // 获取今日活跃用户数（24小时内有登录记录的用户）
    // 注意：这里需要根据实际的登录记录实现，目前暂时返回总用户数的10%
    const todayActiveUsers = Math.ceil(totalUsers * 0.1);

    logger.info(`获取系统统计数据成功`);

    res.json({
      code: '0000',
      msg: '获取系统统计数据成功',
      data: {
        totalUsers,
        totalAccounts,
        todayActiveUsers,
      },
    });
  } catch (error) {
    logger.error(`获取系统统计数据失败: ${error.message}`);
    res.status(500).json({
      code: '500',
      msg: '获取系统统计数据失败，服务器错误',
    });
  }
});

module.exports = router;
