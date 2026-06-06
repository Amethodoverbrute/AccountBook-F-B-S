/**
 * 记账本主路由模块
 * --------------------------
 * 功能：处理记账本相关的HTTP请求，包括账单列表、添加、删除等操作
 * 技术栈：
 * - Express Router：路由管理
 * - MongoDB (Mongoose)：账单数据存储
 * - Moment.js：时间格式化和处理
 * - 自定义中间件：checkLoginMiddleware（用户登录状态检查）
 *
 * 历史说明：
 * - 早期版本使用 lowdb + shortid 实现基于 JSON 文件的数据库
 * - 当前版本已迁移到 MongoDB，使用 Mongoose ODM 进行数据操作
 *
 * 路由列表：
 * - GET    /                - 重定向到记账本列表页面
 * - GET    /account         - 获取记账本列表数据并渲染页面
 * - GET    /account/create  - 渲染添加账单页面
 * - POST   /account         - 处理添加账单请求
 * - GET    /account/delete/:id - 处理删除账单请求
 */
var express = require('express');
var router = express.Router();

// // 导入 lowdb，用于操作 JSON 文件数据库。（后面就就用不到了）
// const low = require("lowdb");
// const FileSync = require("lowdb/adapters/FileSync");
// const adapter = new FileSync(__dirname + "/../data/db.json");
// // 获取 db 实例对象（后面就用不到了）
// const db = low(adapter);

// // 导入 shortid 模块（后面就用不到了）
// // shortid 用于生成唯一的短 ID 字符串，常用于数据库主键或文件名
// const shortid = require("shortid");

// 导入 moment 模块
const moment = require('moment');
const AccountModel = require('../../models/accountModel');

// --------------------------
// 辅助功能与中间件
// --------------------------

// 开发测试代码：格式化时间（已注释）
// 用于测试moment库的时间格式化功能
// console.log(moment("2025-12-13T10:16"));
// console.log(moment("2025-12-13T10:16").toDate());

// 格式化时间函数（已注释）
// 用于将ISO时间格式转换为指定格式
// const formatTime = (time) => moment(time).format("YYYY-MM-DD HH:mm");

// 导入自定义中间件：检查用户登录状态
// 功能：验证用户是否已登录，未登录则重定向到登录页面
const checkLoginMiddleware = require('../../middlewares/checkLoginMiddleware');

// --------------------------
// 路由定义
// --------------------------

/**
 * GET /
 * 首页路由
 * 功能：当用户访问根路径时，重定向到记账本列表页面
 * 中间件：checkLoginMiddleware（验证用户登录状态）
 */
router.get('/', checkLoginMiddleware, (req, res) => {
  // 重定向到记账本列表页面
  res.redirect('/account');
});

/**
 * GET /account
 * 记账本列表页面
 * 功能：获取所有账单数据，按时间倒序排序，并渲染到列表页面
 * 中间件：checkLoginMiddleware（验证用户登录状态）
 * 响应：
 * - 成功：渲染list.ejs模板，传递accountList数据
 * - 失败：返回500状态码和错误信息
 */
router.get('/account', checkLoginMiddleware, async function (req, res, next) {
  try {
    // 从MongoDB获取记账本列表数据，按时间倒序排序
    const accountList = await AccountModel.find().sort({ time: -1 });
    // 开发调试：打印获取的数据
    console.log('从MongoDB获取的数据:', accountList);
    // 渲染列表页面
    res.render('list', { accountList });
  } catch (err) {
    // 错误处理：记录错误日志并返回500状态码
    console.error('获取数据失败:', err);
    res.status(500).send('获取数据失败');
  }
});

/**
 * GET /account/create
 * 添加账单页面
 * 功能：渲染添加账单的表单页面
 * 中间件：checkLoginMiddleware（验证用户登录状态）
 */
router.get('/account/create', checkLoginMiddleware, function (req, res, next) {
  // 渲染添加账单页面
  res.render('create');
});

/**
 * POST /account
 * 添加账单处理
 * 功能：处理表单提交，将新账单数据保存到数据库
 * 中间件：checkLoginMiddleware（验证用户登录状态）
 * 请求体：
 * - item：账单标题（前端字段名，映射到后端的title）
 * - type：账单类型（收入/支出）
 * - amount：金额
 * - time：时间（ISO格式）
 * - category：分类
 * - remark：备注
 * 响应：
 * - 成功：渲染success.ejs模板，提示添加成功并跳转到列表页
 * - 失败：返回500状态码和错误信息
 */
router.post('/account', checkLoginMiddleware, async function (req, res, next) {
  try {
    // 开发调试：打印请求体
    // console.log(req.body);

    // 将表单数据插入数据库
    await AccountModel.create({
      ...req.body,
      // 字段映射：前端item -> 后端title
      title: req.body.item,
      // 时间格式化：将ISO字符串转换为Date对象
      time: moment(req.body.time).toDate(),
    });

    // 添加成功，渲染成功页面
    res.render('success', { msg: '添加成功~~', url: '/account' });
  } catch (err) {
    // 错误处理：记录错误日志并返回500状态码
    console.error('添加数据失败:', err);
    res.status(500).send('添加失败');
    return;
  }
});

/**
 * GET /account/delete/:id
 * 删除账单处理
 * 功能：根据账单ID删除指定账单
 * 中间件：checkLoginMiddleware（验证用户登录状态）
 * 路由参数：
 * - id：账单ID（MongoDB ObjectId）
 * 响应：
 * - 成功：渲染success.ejs模板，提示删除成功并跳转到列表页
 * - 失败：返回500状态码和错误信息
 */
router.get(
  '/account/delete/:id',
  checkLoginMiddleware,
  async function (req, res, next) {
    try {
      // 获取路由参数ID
      let id = req.params.id;
      // 根据ID删除账单数据
      await AccountModel.findByIdAndDelete(id);
      // 删除成功，渲染成功页面
      res.render('success', { msg: '删除成功~~', url: '/account' });
    } catch (err) {
      // 错误处理：记录错误日志并返回500状态码
      console.error('删除数据失败:', err);
      res.status(500).send('删除失败');
    }
  }
);

module.exports = router;
