// 导入 jsonwebtoken 模块
const jwt = require('jsonwebtoken');
// 导入配置文件
const { SECRET } = require('../config');

// 声明 token 中间件
module.exports = (req, res, next) => {
  // 从请求头中获取 token
  // 从请求头中获取 token（支持两种方式）
  let token = req.headers.authorization || req.headers.token;
  if (!token) {
    return res.status(401).json({
      code: '4011',
      msg: '未授权',
      data: null,
    });
  }

  // 处理 Bearer token 格式
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  // 验证 token
  try {
    const decoded = jwt.verify(token, SECRET);
    // 验证通过，将解码后的用户信息添加到请求对象中
    req.user = decoded;
    // 验证通过，继续处理请求
    next();
  } catch (err) {
    return res.status(401).json({
      code: '4012',
      msg: '无效的 token',
      data: null,
    });
  }
};
