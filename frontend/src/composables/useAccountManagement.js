import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { authService, accountService, categoryService } from "../services/auth";

/**
 * 账单管理组合式函数
 * 功能：封装账单相关的业务逻辑，包括获取账单列表、添加、编辑、删除账单等
 */
export function useAccountManagement() {
  const router = useRouter();

  // 状态管理
  const accounts = ref([]);
  const isLoading = ref(true);
  const isSubmitting = ref(false); // 表单提交加载状态
  const formError = ref(""); // 表单错误信息（添加和编辑通用）
  const formSuccess = ref(""); // 表单成功信息（添加和编辑通用）
  const showForm = ref(false);
  const isEditing = ref(false);
  const editAccountId = ref(null);
  const userInfo = ref(null);
  const categories = ref([]);
  const isCategoriesLoading = ref(false);
  const isInitializingForm = ref(false);
  const searchKeyword = ref("");
  const accountTitles = ref([]); // 所有账户标题，用于搜索建议
  const currentPage = ref(1);
  const pageSize = ref(5);
  const totalRecords = ref(0);
  const totalPages = ref(0);

  // 统一的确认对话框状态
  const confirmDialog = ref({
    visible: false,
    title: "",
    message: "",
    type: null,
    data: null,
  });

  // 表单数据
  const newAccount = ref({
    title: "",
    amount: "",
    type: "expense",
    time: getCurrentDateTime(),
    remark: "",
    categoryId: null,
  });

  /**
   * 获取当前格式化时间
   * @returns {string} 格式化后的时间字符串（YYYY-MM-DDTHH:MM）
   */
  function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  /**
   * 重置表单数据
   */
  function resetForm() {
    newAccount.value = {
      title: "",
      amount: "",
      type: "expense",
      time: getCurrentDateTime(),
      remark: "",
      categoryId: null,
    };
  }

  /**
   * 根据当前账单类型过滤分类
   */
  const filteredCategories = computed(() => {
    if (!newAccount.value.type) return [];
    return categories.value.filter(
      (category) => category.type === newAccount.value.type
    );
  });

  // 实时验证状态
  const fieldErrors = ref({
    title: "",
    amount: "",
    type: "",
    categoryId: "",
  });

  /**
   * 实时验证单个字段
   * @param {string} fieldName 字段名称
   * @param {any} value 字段值
   * @returns {string} 验证错误信息，为空表示验证通过
   */
  function validateField(fieldName, value) {
    let error = "";

    switch (fieldName) {
      case "title":
        if (!value.trim()) {
          error = "请输入账单标题";
        }
        break;
      case "amount":
        if (!value || isNaN(parseFloat(value))) {
          error = "请输入有效的金额";
        }
        break;
      case "type":
        if (!value) {
          error = "请选择账单类型";
        }
        break;
      case "categoryId":
        if (!value) {
          error = "请选择账单分类";
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
   */
  function validateForm() {
    // 实时验证所有字段
    const titleError = validateField("title", newAccount.value.title);
    const amountError = validateField("amount", newAccount.value.amount);
    const typeError = validateField("type", newAccount.value.type);
    const categoryError = validateField(
      "categoryId",
      newAccount.value.categoryId
    );

    // 检查是否有任何字段验证失败
    const hasErrors = titleError || amountError || typeError || categoryError;

    if (hasErrors) {
      // 设置全局错误信息
      formError.value = "请检查表单中的错误";
      return false;
    }

    // 清除所有错误
    formError.value = "";
    fieldErrors.value = {
      title: "",
      amount: "",
      type: "",
      categoryId: "",
    };

    return true;
  }

  /**
   * 添加账单
   */
  async function handleAddAccount() {
    try {
      formError.value = "";
      formSuccess.value = "";

      if (!validateForm()) return;

      // 设置提交状态
      isSubmitting.value = true;

      const accountData = {
        ...newAccount.value,
        amount: parseFloat(newAccount.value.amount),
      };

      const response = await accountService.createAccount(accountData);

      if (response.code === "0000") {
        formSuccess.value = "账单添加成功";
        resetForm();
        fetchAccounts();

        setTimeout(() => {
          showForm.value = false;
        }, 1000);

        setTimeout(() => {
          formSuccess.value = "";
        }, 3000);
      } else {
        formError.value = response.msg || "添加失败";
      }
    } catch (err) {
      formError.value = err.response?.data?.msg || "网络错误，请稍后重试";
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
      remark: account.remark || "",
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
      formError.value = "";
      formSuccess.value = "";

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

      if (response.code === "0000") {
        formSuccess.value = "账单编辑成功";
        resetForm();
        isEditing.value = false;
        editAccountId.value = null;
        fetchAccounts();

        setTimeout(() => {
          showForm.value = false;
        }, 1000);

        setTimeout(() => {
          formSuccess.value = "";
        }, 3000);
      } else {
        formError.value = response.msg || "编辑失败";
      }
    } catch (err) {
      formError.value = err.response?.data?.msg || "网络错误，请稍后重试";
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
      title: "删除账单",
      message: "确定要删除这条账单吗？",
      type: "delete",
      data: id,
    };
  }

  /**
   * 处理退出登录确认
   */
  function handleLogout() {
    confirmDialog.value = {
      visible: true,
      title: "退出登录",
      message: "确定要退出登录吗？",
      type: "logout",
      data: null,
    };
  }

  /**
   * 处理确认对话框确认
   */
  async function handleConfirmDialog() {
    const { type, data } = confirmDialog.value;
    confirmDialog.value.visible = false;

    if (type === "delete") {
      try {
        const response = await accountService.deleteAccount(data);
        if (response.code === "0000") {
          fetchAccounts();
        } else {
          alert(response.msg || "删除失败");
        }
      } catch (err) {
        alert(err.response?.data?.msg || "网络错误，请稍后重试");
      }
    } else if (type === "logout") {
      authService.logout();
      router.push("/login");
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
    formError.value = "";
    formSuccess.value = "";
    showForm.value = true;
  }

  /**
   * 跳转到统计页面
   */
  function goToStatistics() {
    router.push("/statistics");
  }

  /**
   * 获取当前登录用户信息
   */
  async function fetchUserInfo() {
    try {
      const response = await authService.getCurrentUser();
      if (response && response.code === "0000") {
        userInfo.value = response.data;
      } else if (response && response.code === "401") {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    }
  }

  /**
   * 获取分类列表
   */
  async function fetchCategories() {
    try {
      isCategoriesLoading.value = true;
      const response = await categoryService.getCategories();
      if (response.code === "0000") {
        categories.value = response.data;
      }
    } catch (err) {
      console.error("获取分类列表失败:", err);
    } finally {
      isCategoriesLoading.value = false;
    }
  }

  /**
   * 搜索处理函数
   * @param {Object|string} searchParams 搜索参数，可以是关键词字符串或包含多个搜索条件的对象
   * 对象结构：{ keyword, type, startDate, endDate, categoryId }
   */
  function handleSearch(searchParams) {
    // 处理不同类型的搜索参数
    if (typeof searchParams === "string") {
      // 兼容旧的搜索方式（仅关键词）
      searchKeyword.value = searchParams;
    } else {
      // 新的高级搜索方式
      searchKeyword.value = searchParams.keyword || "";
      // 其他搜索筛选条件将通过API参数传递
    }

    fetchAccounts(searchParams);
  }

  /**
   * 重置搜索
   */
  function handleResetSearch() {
    searchKeyword.value = "";
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

      if (response.code === "0000") {
        accounts.value = response.data.accounts;
        totalRecords.value = response.data.pagination.total;
        totalPages.value = response.data.pagination.totalPages;
        accountTitles.value = accounts.value.map((account) => account.title);
      }
    } catch (err) {
      console.error("获取账单失败:", err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 初始化数据
   */
  onMounted(async () => {
    await fetchUserInfo();
    fetchAccounts();
    fetchCategories();
  });

  // 监听账单类型变化，动态更新可用分类
  watch(
    () => newAccount.value.type,
    (newType) => {
      if (!isInitializingForm.value) {
        newAccount.value.categoryId = null;
      }
    }
  );

  return {
    // 状态
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

    // 方法
    handleAddAccount,
    handleEditAccount,
    handleEditAccountClick,
    handleDeleteAccount,
    handleLogout,
    handleConfirmDialog,
    handleCancelDialog,
    openForm,
    goToStatistics,
    handleSearch,
    handleResetSearch,
    handlePageSizeChange,
    goToPage,
    fetchAccounts,
    validateField,
  };
}
