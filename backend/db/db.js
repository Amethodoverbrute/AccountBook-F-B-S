/**
 * 连接数据库
 * @param {*} success 连接成功的回调
 * @param {*} error 连接失败的回调
 */
module.exports = function (success, error) {
  // 判断error是否为函数，为其设置默认值。这样调用该函数时，就不用写error()了
  if (typeof error !== "function") {
    error = () => {
      console.log("连接失败");
    };
  }

  //1. 安装 mongoose
  //2. 导入 mongoose
  const mongoose = require("mongoose");

  // 设置 strictQuery 为true
  mongoose.set("strictQuery", true);

  //3. 连接数据库		协议名称    			  数据库的名称
  // mongoose.connect("mongodb://127.0.0.1:27017/bilibili");
  // 从配置文件中获取数据库连接信息
  const { DBHOST, DBPORT, DBNAME } = require("../config/config");
  mongoose.connect(`mongodb://${DBHOST}:${DBPORT}/${DBNAME}`);

  //4. 设置连接 回调
  //设置 连接成功 的回调	on即“绑定”事件的意思，建议用once
  //mongoose.connection.on('open', () => {
  mongoose.connection.once("open", () => {
    success();
  });

  //设置 连接出错 的回调
  mongoose.connection.on("error", () => {
    console.log("连接出错~~");
    error();
  });

  //设置 连接关闭 的回调
  mongoose.connection.on("close", () => {
    console.log("连接关闭");
  });
};
