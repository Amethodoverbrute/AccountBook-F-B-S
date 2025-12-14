// 检查用户是否登录 的中间件
module.exports = (req, res, next) => {
  // 检查用户是否登录
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};
