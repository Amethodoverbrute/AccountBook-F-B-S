// 管理员权限检查中间件
// 功能：验证用户是否具有管理员或超级管理员权限

const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');
const UserModel = require('../models/userModel');
const logger = require('../config/logger');

module.exports = async (req, res, next) => {
  // 从请求头获取token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn('管理员权限检查失败: 未提供token');
    return res.status(401).json({
      code: '401',
      msg: '未授权，请先登录',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 验证token
    const decoded = jwt.verify(token, SECRET);

    // 根据userId查询用户信息
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      logger.warn(`管理员权限检查失败: userId=${decoded.userId} 不存在`);
      return res.status(404).json({
        code: '404',
        msg: '用户不存在',
      });
    }

    // 检查用户角色是否为管理员或超级管理员
    if (user.role !== 'admin' && user.role !== 'superAdmin') {
      logger.warn(`管理员权限检查失败: userId=${decoded.userId} 角色不足`);
      return res.status(403).json({
        code: '403',
        msg: '权限不足，需要管理员权限',
      });
    }

    // 将用户信息添加到请求对象中，供后续使用
    req.user = user;
    next();
  } catch (error) {
    logger.error(`管理员权限检查失败: ${error.message}`);
    return res.status(401).json({
      code: '401',
      msg: '无效的token',
    });
  }
};
