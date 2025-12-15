const logger = require('../config/logger');

// 日志中间件，记录所有HTTP请求
module.exports = (req, res, next) => {
  // 记录请求开始时间
  const start = Date.now();
  
  // 记录请求方法、URL和IP
  logger.info(`[${req.method}] ${req.url} - ${req.ip}`);
  
  // 监听响应结束事件，记录响应状态码和响应时间
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`[${req.method}] ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  // 监听响应错误事件
  res.on('error', (err) => {
    logger.error(`[${req.method}] ${req.url} - Error: ${err.message}`);
  });
  
  next();
};