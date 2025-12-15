// 导入mongoose
const mongoose = require("mongoose");

//创建文档的结构对象
//设置 集合中 文档的属性以及属性值的类型
let BookSchema = new mongoose.Schema({
  title: String,
  author: String,
  price: Number,
});

//创建 文档模型对象	完成对文档操作（crud）的封装对象
let BookModel = mongoose.model("book", BookSchema);

// 暴露 BookModel 模型对象
module.exports = BookModel;
