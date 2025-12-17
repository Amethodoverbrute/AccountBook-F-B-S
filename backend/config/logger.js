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
const winston = require("winston");

// 创建日志配置
const logger = winston.createLogger({
  // 日志级别：设置为info，低于该级别的日志不会被记录
  level: "info",

  // 日志格式配置：组合时间戳和自定义输出格式
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss", // 时间戳格式
    }),
    // 自定义日志输出格式：时间戳 [日志级别] 日志消息
    winston.format.printf(
      (info) => `${info.timestamp} [${info.level}] ${info.message}`
    )
  ),

  // 日志传输配置：定义日志输出方式
  transports: [
    // 控制台输出配置
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // 彩色输出
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.printf(
          (info) => `${info.timestamp} [${info.level}] ${info.message}`
        )
      ),
    }),

    // 错误日志文件输出配置
    new winston.transports.File({
      filename: "logs/error.log", // 错误日志文件路径
      level: "error", // 仅记录error级别的日志
      maxsize: 5242880, // 单个文件最大5MB
      maxFiles: 5, // 最多保留5个文件
      tailable: true, // 新日志追加到当前文件，满了再创建新文件
    }),

    // 所有日志文件输出配置
    new winston.transports.File({
      filename: "logs/combined.log", // 所有日志文件路径
      maxsize: 5242880, // 单个文件最大5MB
      maxFiles: 5, // 最多保留5个文件
      tailable: true, // 新日志追加到当前文件，满了再创建新文件
    }),
  ],
});

// --------------------------
// 日志目录初始化模块
// --------------------------
// 功能：确保日志目录存在，防止Winston写入日志文件时因目录不存在而报错
// 原因：Winston默认不会自动创建日志目录，因此需要在初始化日志系统前手动检查和创建

// 导入Node.js核心模块
const fs = require("fs"); // 文件系统模块，用于文件和目录操作
const path = require("path"); // 路径模块，用于处理文件路径

// 计算日志目录的绝对路径
// __dirname：当前文件所在目录（config目录）
// '../logs'：相对于当前目录的上级目录下的logs目录
const logDir = path.join(__dirname, "../logs");

// 检查日志目录是否存在
if (!fs.existsSync(logDir)) {
  // 如果目录不存在，则创建目录
  fs.mkdirSync(logDir);
  // 记录目录创建成功日志
  logger.info("Logs directory created successfully");
} else {
  // 目录已存在，无需创建，可选择记录调试日志（可选）
  // logger.debug('Logs directory already exists');
}

module.exports = logger;
