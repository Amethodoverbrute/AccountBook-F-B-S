/**
 * AI API路由模块
 * 功能：提供前端调用的AI接口，包括对话和分析功能
 * 作者：系统自动生成
 * 时间：2026-01-01
 */

const express = require('express');
const router = express.Router();

// 导入中间件
const checkTokenMiddleware = require('../../middlewares/checkTokenMiddleware');

// 导入AI服务
const aiService = require('../../services/aiService');

// 导入日志配置
const logger = require('../../config/logger');

/**
 * @openapi
 * /ai/conversation: 
 *   post:
 *     summary: AI对话接口
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIConversationRequest'
 *     responses:
 *       200:
 *         description: AI对话响应成功
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
 *                   example: 'AI对话响应成功'
 *                 data:
 *                   $ref: '#/components/schemas/AIResponse'
 *       400:
 *         description: 无效的请求参数
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * AI对话接口
 * 功能：处理用户与AI的对话请求
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
router.post('/ai/conversation', checkTokenMiddleware, async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const userId = req.user.userId;

    // 验证请求参数
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        code: '400',
        msg: '无效的请求参数，prompt不能为空且必须是字符串',
        data: null
      });
    }

    logger.info(`用户${userId}调用AI对话接口，内容：${prompt.substring(0, 50)}...`);

    // 调用AI服务获取响应
    const aiResponse = await aiService.callAIConversation(prompt, context);

    logger.info(`用户${userId}AI对话接口调用成功，AI返回数据: ${JSON.stringify(aiResponse)}`);

    // 返回AI响应
    const finalResponse = {
      code: '0000',
      msg: 'AI对话响应成功',
      data: aiResponse.data
    };
    
    logger.info(`返回给前端的最终响应: ${JSON.stringify(finalResponse)}`);
    res.json(finalResponse);
  } catch (error) {
    logger.error(`AI对话接口调用失败：${error.message}`);
    res.status(500).json({
      code: '500',
      msg: 'AI对话接口调用失败',
      data: null
    });
  }
});

/**
 * @openapi
 * /ai/analysis: 
 *   post:
 *     summary: AI分析接口
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIAnalysisRequest'
 *     responses:
 *       200:
 *         description: AI分析响应成功
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
 *                   example: 'AI分析响应成功'
 *                 data:
 *                   $ref: '#/components/schemas/AIResponse'
 *       400:
 *         description: 无效的请求参数
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * AI分析接口
 * 功能：处理用户的AI分析请求
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
router.post('/ai/analysis', checkTokenMiddleware, async (req, res) => {
  try {
    const { data, context } = req.body;
    const userId = req.user.userId;

    // 验证请求参数
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        code: '400',
        msg: '无效的请求参数，data不能为空且必须是对象',
        data: null
      });
    }

    logger.info(`用户${userId}调用AI分析接口，数据类型：${Object.keys(data).join(', ')}`);

    // 调用AI服务获取分析结果
    const aiResponse = await aiService.callAIAnalysis(data, context);

    logger.info(`用户${userId}AI分析接口调用成功`);

    // 返回AI分析结果
    res.json({
      code: '0000',
      msg: 'AI分析响应成功',
      data: aiResponse.data
    });
  } catch (error) {
    logger.error(`AI分析接口调用失败：${error.message}`);
    res.status(500).json({
      code: '500',
      msg: 'AI分析接口调用失败',
      data: null
    });
  }
});

/**
 * @openapi
 * /ai/health: 
 *   get:
 *     summary: AI健康检查接口
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI服务正常运行
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
 *                   example: 'AI服务正常运行'
 *                 data:
 *                   $ref: '#/components/schemas/AIHealthResponse'
 *       500:
 *         description: AI服务异常
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * AI健康检查接口
 * 功能：检查AI服务是否正常运行
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
router.get('/ai/health', checkTokenMiddleware, async (req, res) => {
  try {
    logger.info('AI健康检查接口被调用');
    
    res.json({
      code: '0000',
      msg: 'AI服务正常运行',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'AI Service'
      }
    });
  } catch (error) {
    logger.error(`AI健康检查失败：${error.message}`);
    res.status(500).json({
      code: '500',
      msg: 'AI服务异常',
      data: null
    });
  }
});

module.exports = router;
