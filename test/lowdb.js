// **********************************************************
// LowDB 基础使用示例 - 详细注释版
// LowDB 是一个基于 JSON 文件的轻量级数据库，适用于小型项目或原型开发
// 特点：简单易用、无需安装数据库服务、支持链式查询 API
// **********************************************************

// 1. 导入 LowDB 核心模块
// lowdb 模块提供了创建和管理数据库实例的核心功能
const low = require("lowdb");

// 2. 导入 FileSync 适配器
// 适配器是 LowDB 与数据存储介质之间的桥梁
// FileSync 适配器用于将数据同步存储到本地 JSON 文件
// 其他适配器类型：FileAsync（异步文件存储）、LocalStorage（浏览器本地存储）等
const FileSync = require("lowdb/adapters/FileSync");

// 3. 创建适配器实例
// 指定数据存储的文件名："db.json"，数据将保存在此文件中
const adapter = new FileSync("db.json");

// 4. 创建 LowDB 数据库实例
// 通过适配器初始化数据库，返回 db 对象用于后续操作
// db 对象提供了所有数据库操作方法（CRUD）
const db = low(adapter);

// 5. 初始化数据库默认结构
// defaults() 方法用于设置数据库的默认数据结构
// 当 db.json 文件不存在或为空时，会自动创建并填充这些默认数据
// 这里创建了两个集合：posts（文章数组）和 users（用户对象）
// write() 方法用于将更改写入到文件中（LowDB 所有修改操作都需要调用 write() 才会生效）
db.defaults({ posts: [], users: {} }).write();

// 写入数据
db.get("posts").push({ id: 1, title: "今天天气还不错~~" }).write();
db.get("posts").push({ id: 2, title: "今天天气还不错~~" }).write();
db.get("posts").unshift({ id: 3, title: "今天天气还不错~~" }).write();

// 获取单条数据
let post = db.get("posts").find({ id: 1 }).value();
console.log(post);

// 获取数据
const posts = db.get("posts").value();
console.log(posts);

// 删除数据
let deletedPost = db.get("posts").remove({ id: 2 }).write();
console.log(deletedPost);

// 更新数据
let updatedPost = db
  .get("posts")
  .find({ id: 3 })
  .assign({ title: "今天下雨啦" })
  .write();
console.log(updatedPost);
