// 导入mongoose
const mongoose = require("mongoose");

//创建文档的结构对象
//设置 集合中 文档的属性以及属性值的类型
let CategorySchema = new mongoose.Schema({
  // 分类名称
  name: {
    type: String,
    required: true,
  },
  // 分类类型：income 或 expense
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  // 分类图标
  icon: {
    type: String,
    default: "",
  },
  // 用户ID（关联到用户模型）
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 添加索引，优化查询性能
CategorySchema.index({ userId: 1, type: 1 }); // 按用户ID和类型查询
CategorySchema.index({ userId: 1 }); // 按用户ID查询

//创建 文档模型对象  完成对文档操作（crud）的封装对象
let CategoryModel = mongoose.model("category", CategorySchema);

// 暴露 CategoryModel 模型对象
module.exports = CategoryModel;
