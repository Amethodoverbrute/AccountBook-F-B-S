const swaggerJSDoc = require('swagger-jsdoc');

// Swagger配置选项
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