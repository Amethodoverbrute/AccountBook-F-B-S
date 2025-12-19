// 导入mongoose
const mongoose = require('mongoose');

//创建文档的结构对象
//设置 集合中 文档的属性以及属性值的类型
let QuoteSchema = new mongoose.Schema({
  //   名言内容
  content: {
    type: String,
    required: true,
    trim: true,
  },
  //   作者
  author: {
    type: String,
    required: true,
    trim: true,
  },
  //   分类
  category: {
    type: String,
    enum: ['励志', '财务', '生活', '学习', '工作', '其他'],
    default: '其他',
    required: true,
  },
  //   创建时间
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//创建 文档模型对象	完成对文档操作（crud）的封装对象
let QuoteModel = mongoose.model('quote', QuoteSchema);

// 暴露 QuoteModel 模型对象
module.exports = QuoteModel;
