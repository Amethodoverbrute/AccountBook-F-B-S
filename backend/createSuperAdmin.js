// 创建超级管理员用户脚本
const dbConnect = require('./db/db');
const UserModel = require('./models/userModel');
const md5 = require('md5');

// 连接数据库
dbConnect(() => {
  console.log('数据库连接成功');

  // 创建超级管理员用户
  const superAdmin = new UserModel({
    username: 'superadmin',
    password: md5('admin123'),
    role: 'superAdmin',
  });

  // 保存到数据库
  superAdmin
    .save()
    .then(() => {
      console.log('超级管理员创建成功！');
      console.log('用户名: superadmin');
      console.log('密码: admin123');
      // 关闭数据库连接
      process.exit(0);
    })
    .catch((err) => {
      if (err.code === 11000 && err.keyPattern.username === 1) {
        console.log('超级管理员已存在！');
      } else {
        console.log('创建超级管理员失败:', err.message);
      }
      // 关闭数据库连接
      process.exit(1);
    });
});
