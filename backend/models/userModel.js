// 导入mongoose
const mongoose = require('mongoose');

//创建文档的结构对象
//设置 集合中 文档的属性以及属性值的类型
let UserSchema = new mongoose.Schema({
  //   用户名
  username: {
    type: String,
    required: true,
    unique: true,
  },
  //   密码
  password: {
    type: String,
    required: true,
  },
  //   角色：user（普通用户）、admin（管理员）、superAdmin（超级管理员）
  role: {
    type: String,
    enum: ['user', 'admin', 'superAdmin'],
    default: 'user',
    required: true,
  },
  //   用户自定义名言
  quote: {
    // 名言内容
    content: {
      type: String,
      trim: true,
    },
    // 名言作者
    author: {
      type: String,
      trim: true,
    },
    // 创建时间
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
});

//创建 文档模型对象	完成对文档操作（crud）的封装对象
let UserModel = mongoose.model('user', UserSchema);

// 暴露 UserModel 模型对象
module.exports = UserModel;
