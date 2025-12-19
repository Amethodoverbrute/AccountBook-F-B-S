/**
 * 管理员服务
 * 功能：处理管理员相关的API请求
 */
import api from './auth';

/**
 * 管理员服务类
 */
export const adminService = {
  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.search - 搜索关键词
   * @returns {Promise<Object>} 用户列表数据
   */
  async getUsers(params) {
    try {
      const response = await api.get('/admin/users', {
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          search: params.search || '',
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }
  },

  /**
   * 修改用户角色
   * @param {string} userId - 用户ID
   * @param {string} role - 新角色
   * @returns {Promise<Object>} 修改结果
   */
  async updateUserRole(userId, role) {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, {
        role,
      });

      return response.data;
    } catch (error) {
      console.error('修改用户角色失败:', error);
      throw error;
    }
  },

  /**
   * 删除用户
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);

      return response.data;
    } catch (error) {
      console.error('删除用户失败:', error);
      throw error;
    }
  },

  /**
   * 获取系统统计数据
   * @returns {Promise<Object>} 系统统计数据
   */
  async getSystemStatistics() {
    try {
      const response = await api.get('/admin/statistics');

      return response.data.data;
    } catch (error) {
      console.error('获取系统统计数据失败:', error);
      throw error;
    }
  },
};
