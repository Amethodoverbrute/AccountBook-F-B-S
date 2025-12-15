// 导入mongoose
const mongoose = require("mongoose");

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
});

//创建 文档模型对象	完成对文档操作（crud）的封装对象
let UserModel = mongoose.model("user", UserSchema);

// 暴露 UserModel 模型对象
module.exports = UserModel;
