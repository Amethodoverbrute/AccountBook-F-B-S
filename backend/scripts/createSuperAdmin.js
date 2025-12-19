/**
 * 创建超级管理员脚本
 * 功能：向数据库中插入一个超级管理员账号
 * 使用方法：node scripts/createSuperAdmin.js
 */

// 导入依赖
const mongoose = require('mongoose');
const md5 = require('md5');

// 导入配置
const { DBHOST, DBPORT, DBNAME } = require('../config');

// 导入用户模型
const UserModel = require('../models/userModel');

// MongoDB连接URL
const dbUrl = `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`;

/**
 * 创建超级管理员函数
 */
async function createSuperAdmin() {
  try {
    // 连接数据库
    await mongoose.connect(dbUrl);
    console.log('数据库连接成功');

    // 超级管理员默认信息
    const superAdminData = {
      username: 'superadmin',
      password: md5('123456'), // 默认密码为123456，使用md5加密
      role: 'superAdmin',
    };

    // 检查用户名是否已存在
    const existingUser = await UserModel.findOne({
      username: superAdminData.username,
    });
    if (existingUser) {
      console.log(`超级管理员账号 "${superAdminData.username}" 已存在`);
      mongoose.disconnect();
      return;
    }

    // 创建超级管理员
    const newSuperAdmin = new UserModel(superAdminData);
    await newSuperAdmin.save();
    console.log('超级管理员创建成功！');
    console.log(`用户名: ${superAdminData.username}`);
    console.log(`密码: 123456`);
    console.log(`角色: ${superAdminData.role}`);

    // 断开数据库连接
    await mongoose.disconnect();
  } catch (error) {
    console.error('创建超级管理员失败:', error);
    process.exit(1);
  }
}

// 执行创建超级管理员函数
createSuperAdmin();
