import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { authService, accountService, categoryService } from '../services/auth';

/**
 * 账单管理组合式函数
 * 功能：封装账单相关的业务逻辑，包括获取账单列表、添加、编辑、删除账单等
 * 设计思路：
 * 1. 状态与逻辑分离，便于维护
 * 2. 统一管理所有账单相关操作
 * 3. 提供清晰的API给组件使用
 * 4. 支持分页、搜索、表单验证等核心功能
 */
export function useAccountManagement() {
  const router = useRouter();

  // ==============================
  // 状态管理 - 核心数据状态
  // ==============================
  const accounts = ref([]); // 账单列表数据
  const isLoading = ref(true); // 列表加载状态
  const isSubmitting = ref(false); // 表单提交加载状态
  const formError = ref(''); // 表单错误信息（添加和编辑通用）
  const formSuccess = ref(''); // 表单成功信息（添加和编辑通用）
  const showForm = ref(false); // 表单显示状态
  const isEditing = ref(false); // 是否处于编辑模式
  const editAccountId = ref(null); // 当前编辑的账单ID
  const userInfo = ref(null); // 当前登录用户信息
  const categories = ref([]); // 分类列表数据
  const isCategoriesLoading = ref(false); // 分类加载状态
  const isInitializingForm = ref(false); // 表单初始化状态标记

  // 名言相关状态
  const quote = ref(null); // 当前显示的名言
  const isQuoteLoading = ref(true); // 名言加载状态
  const showQuoteForm = ref(false); // 添加名言表单显示状态

  // ==============================
  // 状态管理 - 搜索与分页
  // ==============================
  const searchKeyword = ref(''); // 搜索关键词
  const accountTitles = ref([]); // 所有账单标题，用于搜索建议
  const currentPage = ref(1); // 当前页码
  const pageSize = ref(5); // 每页显示条数
  const totalRecords = ref(0); // 总记录数
  const totalPages = ref(0); // 总页数

  // ==============================
  // 状态管理 - 确认对话框
  // ==============================
  const confirmDialog = ref({
    visible: false, // 对话框显示状态
    title: '', // 对话框标题
    message: '', // 对话框内容
    type: null, // 对话框类型：delete/logout
    data: null, // 对话框关联数据（如删除ID）
  });

  // ==============================
  // 状态管理 - 表单数据
  // ==============================
  const newAccount = ref({
    title: '', // 账单标题
    amount: '', // 账单金额
    type: 'expense', // 账单类型：expense/income
    time: getCurrentDateTime(), // 账单时间
    remark: '', // 账单备注
    categoryId: null, // 账单分类ID
  });

  // ==============================
  // 辅助函数 - 工具方法
  // ==============================
  /**
   * 获取当前格式化时间
   * @returns {string} 格式化后的时间字符串（YYYY-MM-DDTHH:MM），用于表单默认时间
   */
  function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  /**
   * 重置表单数据
   * 功能：将表单恢复到初始状态，用于添加新账单前或表单关闭后
   */
  function resetForm() {
    newAccount.value = {
      title: '',
      amount: '',
      type: 'expense',
      time: getCurrentDateTime(),
      remark: '',
      categoryId: null,
    };
  }

  // ==============================
  // 计算属性 - 派生数据
  // ==============================
  /**
   * 根据当前账单类型过滤分类
   * 功能：动态显示与当前账单类型匹配的分类选项
   * 示例：当选择"支出"类型时，只显示支出分类
   */
  const filteredCategories = computed(() => {
    if (!newAccount.value.type) return [];
    return categories.value.filter(
      (category) => category.type === newAccount.value.type
    );
  });

  // ==============================
  // 表单验证 - 状态与方法
  // ==============================
  const fieldErrors = ref({
    title: '', // 标题字段错误
    amount: '', // 金额字段错误
    type: '', // 类型字段错误
    categoryId: '', // 分类字段错误
  });

  /**
   * 实时验证单个字段
   * @param {string} fieldName 字段名称
   * @param {any} value 字段值
   * @returns {string} 验证错误信息，为空表示验证通过
   * 设计思路：
   * - 针对不同字段应用不同的验证规则
   * - 实时更新字段错误状态
   * - 支持后续扩展更多验证规则
   */
  function validateField(fieldName, value) {
    let error = '';

    switch (fieldName) {
      case 'title':
        if (!value.trim()) {
          error = '请输入账单标题';
        }
        break;
      case 'amount':
        if (!value || isNaN(parseFloat(value))) {
          error = '请输入有效的金额';
        }
        break;
      case 'type':
        if (!value) {
          error = '请选择账单类型';
        }
        break;
      case 'categoryId':
        if (!value) {
          error = '请选择账单分类';
        }
        break;
      default:
        break;
    }

    fieldErrors.value[fieldName] = error;
    return error;
  }

  /**
   * 处理表单验证
   * @returns {boolean} 验证是否通过
   * 功能：
   * - 验证所有必填字段
   * - 设置全局错误信息
   * - 清除之前的错误状态
   */
  function validateForm() {
    // 实时验证所有字段
    const titleError = validateField('title', newAccount.value.title);
    const amountError = validateField('amount', newAccount.value.amount);
    const typeError = validateField('type', newAccount.value.type);
    const categoryError = validateField(
      'categoryId',
      newAccount.value.categoryId
    );

    // 检查是否有任何字段验证失败
    const hasErrors = titleError || amountError || typeError || categoryError;

    if (hasErrors) {
      // 设置全局错误信息
      formError.value = '请检查表单中的错误';
      return false;
    }

    // 清除所有错误
    formError.value = '';
    fieldErrors.value = {
      title: '',
      amount: '',
      type: '',
      categoryId: '',
    };

    return true;
  }

  // ==============================
  // 核心功能 - 账单操作（CRUD）
  // ==============================

  /**
   * 添加账单
   */
  async function handleAddAccount() {
    try {
      formError.value = '';
      formSuccess.value = '';

      if (!validateForm()) return;

      // 设置提交状态
      isSubmitting.value = true;

      const accountData = {
        ...newAccount.value,
        amount: parseFloat(newAccount.value.amount),
      };

      const response = await accountService.createAccount(accountData);

      if (response.code === '0000') {
        formSuccess.value = '账单添加成功';
        resetForm();
        fetchAccounts();

        setTimeout(() => {
          showForm.value = false;
        }, 1000);

        setTimeout(() => {
          formSuccess.value = '';
        }, 3000);
      } else {
        formError.value = response.msg || '添加失败';
      }
    } catch (err) {
      formError.value = err.response?.data?.msg || '网络错误，请稍后重试';
    } finally {
      // 重置提交状态
      isSubmitting.value = false;
    }
  }

  /**
   * 处理编辑账单点击事件
   * @param {Object} account 要编辑的账单对象
   */
  function handleEditAccountClick(account) {
    isEditing.value = true;
    editAccountId.value = account._id;
    isInitializingForm.value = true;

    newAccount.value = {
      title: account.title,
      amount: account.amount.toString(),
      type: account.type,
      time: new Date(account.time).toISOString().slice(0, 16),
      remark: account.remark || '',
      categoryId: account.categoryId || null,
    };

    showForm.value = true;

    setTimeout(() => {
      isInitializingForm.value = false;
    }, 0);
  }

  /**
   * 编辑账单
   */
  async function handleEditAccount() {
    try {
      formError.value = '';
      formSuccess.value = '';

      if (!validateForm()) return;

      // 设置提交状态
      isSubmitting.value = true;

      const accountData = {
        ...newAccount.value,
        amount: parseFloat(newAccount.value.amount),
      };

      const response = await accountService.updateAccount(
        editAccountId.value,
        accountData
      );

      if (response.code === '0000') {
        formSuccess.value = '账单编辑成功';
        resetForm();
        isEditing.value = false;
        editAccountId.value = null;
        fetchAccounts();

        setTimeout(() => {
          showForm.value = false;
        }, 1000);

        setTimeout(() => {
          formSuccess.value = '';
        }, 3000);
      } else {
        formError.value = response.msg || '编辑失败';
      }
    } catch (err) {
      formError.value = err.response?.data?.msg || '网络错误，请稍后重试';
    } finally {
      // 重置提交状态
      isSubmitting.value = false;
    }
  }

  /**
   * 处理删除账单确认
   * @param {string} id 要删除的账单ID
   */
  function handleDeleteAccount(id) {
    confirmDialog.value = {
      visible: true,
      title: '删除账单',
      message: '确定要删除这条账单吗？',
      type: 'delete',
      data: id,
      showWarningIcon: true,
      dangerConfirm: true,
    };
  }

  /**
   * 处理退出登录确认
   */
  function handleLogout() {
    confirmDialog.value = {
      visible: true,
      title: '退出登录',
      message: '确定要退出登录吗？',
      type: 'logout',
      data: null,
      showWarningIcon: true,
      dangerConfirm: true,
    };
  }

  /**
   * 处理确认对话框确认
   */
  async function handleConfirmDialog() {
    const { type, data } = confirmDialog.value;
    confirmDialog.value.visible = false;

    if (type === 'delete') {
      try {
        const response = await accountService.deleteAccount(data);
        if (response.code === '0000') {
          fetchAccounts();
        } else {
          alert(response.msg || '删除失败');
        }
      } catch (err) {
        alert(err.response?.data?.msg || '网络错误，请稍后重试');
      }
    } else if (type === 'logout') {
      authService.logout();
      router.push('/login');
    }
  }

  /**
   * 处理确认对话框取消
   */
  function handleCancelDialog() {
    confirmDialog.value.visible = false;
  }

  /**
   * 打开添加账单表单
   */
  function openForm() {
    isEditing.value = false;
    editAccountId.value = null;
    resetForm();
    formError.value = '';
    formSuccess.value = '';
    showForm.value = true;
  }

  /**
   * 跳转到统计页面
   */
  function goToStatistics() {
    router.push('/statistics');
  }

  /**
   * 获取当前登录用户信息
   */
  async function fetchUserInfo() {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        userInfo.value = userData;
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      router.push('/login');
    }
  }

  /**
   * 获取当前用户的名言
   */
  async function fetchQuote() {
    try {
      isQuoteLoading.value = true;
      // 调用API获取当前用户的名言（优先返回用户自定义，否则返回随机系统名言）
      const response = await fetch('/api/quotes/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.code === '0000') {
        quote.value = data.data;
      } else {
        // 使用默认名言
        quote.value = {
          content: '生活不是缺少美，而是缺少发现美的眼睛。',
          author: '罗丹',
        };
      }
    } catch (error) {
      console.error('获取名言失败:', error);
      // 使用默认名言
      quote.value = {
        content: '生活不是缺少美，而是缺少发现美的眼睛。',
        author: '罗丹',
      };
    } finally {
      isQuoteLoading.value = false;
    }
  }

  /**
   * 处理添加名言
   * @param {Object} newQuote 用户添加的名言对象
   */
  async function handleAddQuote(newQuote) {
    try {
      // 调用API将名言写入数据库
      const response = await fetch('/api/users/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content: newQuote.content,
          author: newQuote.author,
        }),
      });

      const result = await response.json();
      if (result.code === '0000') {
        // 添加成功后，刷新名言列表以获取最新的名言
        await fetchQuote();
      }
    } catch (error) {
      console.error('添加名言失败:', error);
    }
  }

  /**
   * 打开添加名言表单
   */
  function openQuoteForm() {
    showQuoteForm.value = true;
  }

  /**
   * 关闭添加名言表单
   */
  function closeQuoteForm() {
    showQuoteForm.value = false;
  }

  /**
   * 获取分类列表
   */
  async function fetchCategories() {
    try {
      isCategoriesLoading.value = true;
      const response = await categoryService.getCategories();
      if (response.code === '0000') {
        categories.value = response.data;
      }
    } catch (err) {
      console.error('获取分类列表失败:', err);
    } finally {
      isCategoriesLoading.value = false;
    }
  }

  /**
   * 搜索处理函数
   * @param {Object | string} searchParams 搜索参数，可以是关键词字符串或包含多个搜索条件的对象
   * 对象结构：{ keyword, type, startDate, endDate, categoryId }
   */
  function handleSearch(searchParams) {
    // 处理不同类型的搜索参数
    if (typeof searchParams === 'string') {
      // 兼容旧的搜索方式（仅关键词）
      searchKeyword.value = searchParams;
    } else {
      // 新的高级搜索方式
      searchKeyword.value = searchParams.keyword || '';
      // 其他搜索筛选条件将通过API参数传递
    }

    fetchAccounts(searchParams);
  }

  /**
   * 重置搜索
   */
  function handleResetSearch() {
    searchKeyword.value = '';
    fetchAccounts();
  }

  /**
   * 处理每页显示条数变化
   * @param {number} newPageSize 新的每页显示条数
   */
  function handlePageSizeChange(newPageSize) {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    fetchAccounts();
  }

  /**
   * 跳转到指定页码
   * @param {number} page 要跳转的页码
   */
  function goToPage(page) {
    if (page < 1) page = 1;
    if (page > totalPages.value) page = totalPages.value;

    currentPage.value = page;
    fetchAccounts();
  }

  /**
   * 获取账单列表
   * @param {Object} searchParams 搜索参数对象，包含keyword, type, startDate, endDate, categoryId等
   * 功能：
   * - 从后端获取账单数据
   * - 支持关键词搜索和高级筛选
   * - 处理分页逻辑
   * - 更新账单标题列表用于搜索建议
   */
  async function fetchAccounts(searchParams = {}) {
    try {
      isLoading.value = true;

      // 提取搜索参数，默认使用当前的searchKeyword
      const {
        keyword = searchKeyword.value,
        type,
        startDate,
        endDate,
        categoryId,
      } = searchParams;

      // 调用API获取账单列表，传递完整的搜索条件
      const response = await accountService.getAccounts(
        keyword,
        currentPage.value,
        pageSize.value,
        { type, startDate, endDate, categoryId }
      );

      if (response.code === '0000') {
        accounts.value = response.data.accounts; // 更新账单列表
        totalRecords.value = response.data.pagination.total; // 更新总记录数
        totalPages.value = response.data.pagination.totalPages; // 更新总页数
        accountTitles.value = accounts.value.map((account) => account.title); // 更新搜索建议数据
      }
    } catch (err) {
      console.error('获取账单失败:', err);
    } finally {
      isLoading.value = false; // 无论成功失败，都关闭加载状态
    }
  }

  // ==============================
  // 生命周期与监听
  // ==============================
  /**
   * 初始化数据
   * 功能：组件挂载时执行的初始化操作
   * 执行顺序：
   * 1. 获取用户信息
   * 2. 获取账单列表
   * 3. 获取分类列表
   * 4. 获取名言
   */
  onMounted(async () => {
    await fetchUserInfo();
    fetchAccounts();
    fetchCategories();
    fetchQuote();
  });

  /**
   * 监听账单类型变化
   * 功能：当账单类型改变时，自动清空分类选择
   * 注意：表单初始化时跳过此逻辑，避免覆盖默认值
   */
  watch(
    () => newAccount.value.type,
    (newType) => {
      if (!isInitializingForm.value) {
        newAccount.value.categoryId = null;
      }
    }
  );

  // ==============================
  // 函数返回值 - 暴露给组件的API
  // ==============================
  return {
    // 状态 - 暴露给组件的数据
    accounts,
    isLoading,
    isSubmitting,
    formError,
    formSuccess,
    showForm,
    isEditing,
    editAccountId,
    userInfo,
    categories,
    isCategoriesLoading,
    isInitializingForm,
    searchKeyword,
    accountTitles,
    currentPage,
    pageSize,
    totalRecords,
    totalPages,
    confirmDialog,
    newAccount,
    filteredCategories,
    fieldErrors,
    // 名言相关状态
    quote,
    isQuoteLoading,
    showQuoteForm,

    // 方法 - 暴露给组件的操作函数
    handleAddAccount, // 添加账单
    handleEditAccount, // 编辑账单
    handleEditAccountClick, // 打开编辑表单
    handleDeleteAccount, // 删除账单
    handleLogout, // 退出登录
    handleConfirmDialog, // 确认对话框
    handleCancelDialog, // 取消对话框
    openForm, // 打开添加表单
    goToStatistics, // 跳转到统计页面
    handleSearch, // 执行搜索
    handleResetSearch, // 重置搜索
    handlePageSizeChange, // 改变每页显示条数
    goToPage, // 跳转到指定页码
    fetchAccounts, // 刷新账单列表
    validateField, // 验证单个字段
    // 名言相关方法
    fetchQuote, // 获取名言
    handleAddQuote, // 处理添加名言
    openQuoteForm, // 打开添加名言表单
    closeQuoteForm, // 关闭添加名言表单
  };
}
