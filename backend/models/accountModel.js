// 导入mongoose
const mongoose = require("mongoose");

//创建文档的结构对象
//设置 集合中 文档的属性以及属性值的类型
let AccountSchema = new mongoose.Schema({
  //   标题
  title: {
    type: String,
    required: true,
  },
  //   时间
  time: {
    type: Date,
    default: Date.now,
  },
  //   类型
  type: {
    type: String,
    default: "expense",
  },
  //   金额
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  //   备注
  remark: {
    type: String,
    default: "",
  },
  //   用户ID（关联到用户模型）
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  //   分类ID（关联到分类模型）
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    default: null,
  },
});

// 添加索引，优化查询性能
AccountSchema.index({ userId: 1, time: -1 }); // 按用户ID和时间倒序查询
AccountSchema.index({ userId: 1, type: 1 }); // 按用户ID和类型查询
AccountSchema.index({ userId: 1, categoryId: 1 }); // 按用户ID和分类ID查询

//创建 文档模型对象	完成对文档操作（crud）的封装对象
let AccountModel = mongoose.model("account", AccountSchema);

// 暴露 AccountModel 模型对象
module.exports = AccountModel;
