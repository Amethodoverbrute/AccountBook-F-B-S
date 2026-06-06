/**
 * AI服务模块
 * 功能：处理与火山引擎AI接口的交互
 * 作者：系统自动生成
 * 时间：2026-06-06
 */

const axios = require('axios');
const logger = require('../config/logger');

/**
 * AI服务类
 * 提供与火山引擎API的交互功能
 */
class AIService {
  constructor() {
    // 导入配置
    const config = require('../config');

    // 火山引擎方舟平台API配置
    this.config = {
      baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
      apiKey: process.env.ARK_API_KEY || process.env.VOLCENGINE_API_KEY || '',
      model: 'doubao-seed-2-0-mini-260428', // 用户开通的免费模型
    };
  }

  /**
   * 构建AI请求
   * @param {string} prompt - 用户输入的提示
   * @param {Object} context - 上下文信息
   * @returns {Object} 完整的AI请求对象
   */
  buildAIRequest(prompt, context = {}) {
    // 构建符合火山引擎API要求的请求格式
    return {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: '你是一个智能记账助手，帮助用户分析账单数据并提供财务建议。',
        },
        ...(context.history || []),
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    };
  }

  /**
   * 调用AI对话接口
   * @param {string} prompt - 用户输入的提示
   * @param {Object} context - 上下文信息
   * @returns {Promise<Object>} AI响应结果
   */
  async callAIConversation(prompt, context = {}) {
    const startTime = Date.now();

    // 检查是否有有效的API Key，如果没有就使用演示模式
    const hasValidKey =
      this.config.apiKey &&
      this.config.apiKey.length > 20 &&
      !this.config.apiKey.includes('your') &&
      !this.config.apiKey.includes('01020304');

    if (!hasValidKey) {
      logger.info('使用演示模式（API密钥无效或未设置）');
      const demoResponse = this.getDemoResponse(prompt);

      return {
        data: {
          choices: [
            {
              message: {
                role: 'assistant',
                content: demoResponse,
              },
            },
          ],
        },
      };
    }

    try {
      logger.info(`AI对话请求: ${prompt.substring(0, 50)}...`);

      // 构建请求
      const requestBody = {
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content:
              '你是一个智能记账助手，帮助用户分析账单数据并提供财务建议。',
          },
          ...(context.history || []),
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      };

      logger.info('调用真实火山引擎API');
      logger.debug(`AI请求配置: ${JSON.stringify(requestBody, null, 2)}`);

      // 调用火山引擎API
      const response = await axios.post(
        `${this.config.baseURL}/chat/completions`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      );

      const endTime = Date.now();
      logger.info(`AI对话响应: 成功，耗时 ${endTime - startTime}ms`);
      logger.debug(`完整API响应: ${JSON.stringify(response.data, null, 2)}`);

      // 格式化为前端期望的格式
      const formattedResponse = {
        data: {
          choices: [
            {
              message: {
                role: 'assistant',
                content: response.data.choices[0].message.content,
              },
            },
          ],
        },
      };

      logger.info(
        `最终返回给前端的数据: ${JSON.stringify(formattedResponse, null, 2)}`
      );
      return formattedResponse;
    } catch (error) {
      const endTime = Date.now();
      logger.error(
        `AI对话请求失败: ${error.message}，耗时 ${endTime - startTime}ms`
      );
      logger.error(`错误详情: ${JSON.stringify(error, null, 2)}`);

      // 如果API调用失败，也使用演示模式作为降级方案
      logger.info('API调用失败，使用演示模式作为降级方案');
      const demoResponse = this.getDemoResponse(prompt);

      return {
        data: {
          choices: [
            {
              message: {
                role: 'assistant',
                content: demoResponse,
              },
            },
          ],
        },
      };
    }
  }

  /**
   * 获取演示模式的回复
   * @param {string} prompt - 用户输入
   * @returns {string} 演示回复
   */
  getDemoResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    if (
      lowerPrompt.includes('分析') &&
      (lowerPrompt.includes('账单') || lowerPrompt.includes('消费'))
    ) {
      return '📊 【演示模式】账单分析建议：\n\n1. 你的支出主要集中在餐饮和交通方面\n2. 建议设置月度预算，控制不必要的消费\n3. 可以考虑设置自动储蓄计划\n\n💡 提示：请在火山引擎控制台获取正确的API密钥，以使用真实AI服务。';
    }

    if (
      lowerPrompt.includes('你好') ||
      lowerPrompt.includes('嗨') ||
      lowerPrompt.includes('您好')
    ) {
      return '👋 你好！我是你的智能记账助手（演示模式）。\n\n我可以帮你：\n• 分析消费习惯\n• 提供财务建议\n• 回答记账相关问题\n\n💡 提示：请在火山引擎控制台获取正确的API密钥，以使用真实AI服务。';
    }

    if (lowerPrompt.includes('预算') || lowerPrompt.includes('省钱')) {
      return '💰 【演示模式】预算建议：\n\n1. 遵循50-30-20法则：50%必要支出，30%个人消费，20%储蓄\n2. 设置月度预算上限\n3. 使用记账app追踪每一笔开销\n\n💡 提示：请在火山引擎控制台获取正确的API密钥，以使用真实AI服务。';
    }

    return '🤖 【演示模式】感谢你的消息！\n\n作为智能记账助手，我可以帮你分析消费习惯、提供财务建议。\n\n💡 提示：请在火山引擎控制台获取正确的API密钥，以使用真实AI服务。';
  }

  /**
   * 调用AI分析接口
   * @param {Object} data - 要分析的数据
   * @param {Object} context - 上下文信息
   * @returns {Promise<Object>} AI分析结果
   */
  async callAIAnalysis(data, context = {}) {
    try {
      logger.info(`AI分析请求: ${JSON.stringify(data).substring(0, 100)}...`);

      // 构建分析提示
      const prompt = this.buildAnalysisPrompt(data);

      // 调用对话接口进行分析
      const response = await this.callAIConversation(prompt, context);

      logger.info('AI分析响应: 成功');
      return response;
    } catch (error) {
      logger.error(`AI分析请求失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 构建分析提示
   * @param {Object} data - 要分析的数据
   * @returns {string} 构建好的分析提示
   */
  buildAnalysisPrompt(data) {
    return `请分析以下账单数据，并提供详细的财务建议：\n\n${JSON.stringify(data, null, 2)}`;
  }
}

// 导出AI服务实例
module.exports = new AIService();
