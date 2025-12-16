/**
 * Swagger配置文件
 * 功能：定义API文档的基本信息、服务器配置、安全方案和数据模型
 * 作者：系统自动生成
 * 时间：2025-04-02
 * 
 * 配置说明：
 * - 使用swagger-jsdoc库生成OpenAPI 3.0规范的API文档
 * - 自动扫描指定目录下的路由文件，提取Swagger注释生成文档
 * - 定义了所有API响应的数据模型和安全认证方式
 */
const swaggerJSDoc = require('swagger-jsdoc');

// Swagger配置选项 - 定义API文档的基本信息和规范
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '记账本API',
      version: '1.0.0',
      description: '一个基于前后端分离架构的个人记账本应用API文档',
      contact: {
        name: '开发团队',
        email: 'your-email@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: '开发环境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: '用户ID',
            },
            username: {
              type: 'string',
              description: '用户名',
            },
            password: {
              type: 'string',
              description: '用户密码（MD5加密）',
            },
          },
        },
        Account: {
          type: 'object',
          required: ['title', 'amount', 'type'],
          properties: {
            _id: {
              type: 'string',
              description: '账单ID',
            },
            title: {
              type: 'string',
              description: '账单标题',
            },
            time: {
              type: 'string',
              format: 'date-time',
              description: '账单时间',
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: '账单类型',
            },
            amount: {
              type: 'number',
              description: '账单金额',
            },
            remark: {
              type: 'string',
              description: '账单备注',
            },
            userId: {
              type: 'string',
              description: '关联的用户ID',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: '用户名',
            },
            password: {
              type: 'string',
              description: '用户密码',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: '用户名',
            },
            password: {
              type: 'string',
              description: '用户密码',
            },
          },
        },
        Category: {
          type: 'object',
          required: ['name', 'type', 'userId'],
          properties: {
            _id: {
              type: 'string',
              description: '分类ID',
            },
            name: {
              type: 'string',
              description: '分类名称',
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: '分类类型',
            },
            userId: {
              type: 'string',
              description: '关联的用户ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
            },
          },
        },
        StatisticsResponse: {
          type: 'object',
          properties: {
            totalIncome: {
              type: 'number',
              description: '总收入',
            },
            totalExpense: {
              type: 'number',
              description: '总支出',
            },
            balance: {
              type: 'number',
              description: '余额',
            },
            categoryData: {
              type: 'object',
              properties: {
                income: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: '分类名称',
                      },
                      value: {
                        type: 'number',
                        description: '金额',
                      },
                    },
                  },
                },
                expense: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: '分类名称',
                      },
                      value: {
                        type: 'number',
                        description: '金额',
                      },
                    },
                  },
                },
              },
            },
            dateData: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: {
                    type: 'string',
                    description: '日期',
                  },
                  income: {
                    type: 'number',
                    description: '当日收入',
                  },
                  expense: {
                    type: 'number',
                    description: '当日支出',
                  },
                  total: {
                    type: 'number',
                    description: '当日余额',
                  },
                },
              },
            },
            count: {
              type: 'integer',
              description: '账单数量',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: '响应码',
            },
            msg: {
              type: 'string',
              description: '响应信息',
            },
            data: {
              type: 'object',
              description: '响应数据',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/api/*.js'], // 指定API路由文件路径
};

// 生成Swagger文档
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;