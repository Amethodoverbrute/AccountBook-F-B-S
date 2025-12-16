/**
 * 日志配置文件
 * 功能：使用winston库配置应用日志系统
 * 配置说明：
 * - 日志级别：info（默认），支持error、warn、info、http、verbose、debug、silly
 * - 日志格式：包含时间戳、日志级别和消息内容
 * - 日志输出：
 *   1. 控制台输出：彩色格式化，便于开发调试
 *   2. 文件输出：
 *      - error.log：仅记录error级别的日志
 *      - combined.log：记录所有级别的日志
 * - 日志文件管理：
 *   - 单个文件大小限制：5MB
 *   - 最大文件数量：5个
 *   - 日志轮换：自动创建新文件，旧文件命名递增
 */
const winston = require('winston');

// 创建日志配置
const logger = winston.createLogger({
  // 日志级别：设置为info，低于该级别的日志不会被记录
  level: 'info',
  
  // 日志格式配置：组合时间戳和自定义输出格式
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss' // 时间戳格式
    }),
    // 自定义日志输出格式：时间戳 [日志级别] 日志消息
    winston.format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`)
  ),
  
  // 日志传输配置：定义日志输出方式
  transports: [
    // 控制台输出配置
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // 彩色输出
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`)
      )
    }),
    
    // 错误日志文件输出配置
    new winston.transports.File({
      filename: 'logs/error.log', // 错误日志文件路径
      level: 'error', // 仅记录error级别的日志
      maxsize: 5242880, // 单个文件最大5MB
      maxFiles: 5, // 最多保留5个文件
      tailable: true // 新日志追加到当前文件，满了再创建新文件
    }),
    
    // 所有日志文件输出配置
    new winston.transports.File({
      filename: 'logs/combined.log', // 所有日志文件路径
      maxsize: 5242880, // 单个文件最大5MB
      maxFiles: 5, // 最多保留5个文件
      tailable: true // 新日志追加到当前文件，满了再创建新文件
    })
  ]
});

// 确保logs目录存在，防止写入日志时出错
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
  logger.info('Logs directory created successfully');
}

module.exports = logger;