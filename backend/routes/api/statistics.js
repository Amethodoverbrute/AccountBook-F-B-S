/**
 * 统计管理路由模块
 * 功能：处理账单统计数据的获取，包括总收入、总支出、分类统计和日期统计等
 * 作者：系统自动生成
 * 时间：2025-04-02
 */
const express = require('express');
const router = express.Router();
const moment = require('moment');
const AccountModel = require('../../models/accountModel');
const checkTokenMiddleware = require('../../middlewares/checkTokenMiddleware');
const logger = require('../../config/logger');

/**
 * @openapi
 * /statistics:
 *   get:
 *     summary: 获取账单统计数据
 *     tags: [统计管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: 统计开始日期 (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: 统计结束日期 (YYYY-MM-DD)
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
 *                   example: '获取统计数据成功'
 *                 data:
 *                   $ref: '#/components/schemas/StatisticsResponse'
 */
// 获取账单统计数据
router.get(
  '/statistics',
  checkTokenMiddleware,
  async function (req, res, next) {
    try {
      // 获取当前用户ID
      const { userId } = req.user;

      logger.info(`获取账单统计数据请求 - userId: ${userId}`);

      // 获取查询参数，支持按时间范围统计
      const { startDate, endDate } = req.query;

      // 构建查询条件
      const query = { userId };
      if (startDate || endDate) {
        query.time = {};
        if (startDate) {
          query.time.$gte = moment(startDate).startOf('day').toDate();
        }
        if (endDate) {
          query.time.$lte = moment(endDate).endOf('day').toDate();
        }
      }

      // 查询所有符合条件的账单
      const accounts = await AccountModel.find(query);

      // 统计数据
      let totalIncome = 0;
      let totalExpense = 0;
      const categoryData = {
        income: {},
        expense: {},
      };
      const dateData = {};

      // 遍历账单进行统计
      accounts.forEach((account) => {
        const { type, amount, time } = account;
        const date = moment(time).format('YYYY-MM-DD');

        // 总金额统计
        if (type === 'income') {
          totalIncome += amount;
        } else {
          totalExpense += amount;
        }

        // 分类统计（按类型）
        if (!categoryData[type][type]) {
          categoryData[type][type] = 0;
        }
        categoryData[type][type] += amount;

        // 日期统计
        if (!dateData[date]) {
          dateData[date] = {
            income: 0,
            expense: 0,
          };
        }
        dateData[date][type] += amount;
      });

      // 格式化日期统计数据，按日期排序
      const formattedDateData = Object.entries(dateData)
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .map(([date, data]) => ({
          date,
          income: data.income,
          expense: data.expense,
          total: data.income - data.expense,
        }));

      // 格式化分类统计数据
      const formattedCategoryData = {
        income: Object.entries(categoryData.income).map(([name, value]) => ({
          name: name === 'income' ? '收入' : name,
          value,
        })),
        expense: Object.entries(categoryData.expense).map(([name, value]) => ({
          name: name === 'expense' ? '支出' : name,
          value,
        })),
      };

      // 构建响应数据
      const result = {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoryData: formattedCategoryData,
        dateData: formattedDateData,
        count: accounts.length,
      };

      logger.info(
        `获取账单统计数据成功 - userId: ${userId}, count: ${accounts.length}`
      );

      res.json({
        code: '0000',
        msg: '获取统计数据成功',
        data: result,
      });
    } catch (err) {
      logger.error(
        `获取账单统计数据失败 - userId: ${req.user?.userId || 'unknown'}: ${err.message}`
      );
      res.json({
        code: '0001',
        msg: '获取统计数据失败',
        data: null,
      });
    }
  }
);

module.exports = router;
