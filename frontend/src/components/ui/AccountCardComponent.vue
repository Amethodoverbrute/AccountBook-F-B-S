<template>
  <!-- 账单卡片组件 -->
  <div
    class="account-card"
    :class="{
      'income-card': account.type === 'income',
      'expense-card': account.type === 'expense',
    }"
  >
    <div class="account-time">{{ formatDate(account.time) }}</div>
    <div class="account-content">
      <div class="account-title">{{ account.title }}</div>
      <span class="account-type" :class="account.type">{{
        account.type === "income" ? "收入" : "支出"
      }}</span>
      <span class="account-amount">{{ account.amount }} 元</span>
      <button @click="handleEdit" class="edit-btn" title="编辑">✏️</button>
      <button @click="handleDelete" class="delete-btn" title="删除">×</button>
    </div>
  </div>
</template>

<script setup>
// 定义组件属性
const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
});

// 定义组件事件
const emit = defineEmits(["edit", "delete"]);

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 编辑账单处理函数
const handleEdit = () => {
  emit("edit", props.account);
};

// 删除账单处理函数
const handleDelete = () => {
  emit("delete", props.account._id);
};
</script>

<style scoped>
/* 账单卡片 */
.account-card {
  background-color: white;
  padding: 0;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.account-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.account-card:hover::before {
  transform: scaleX(1);
}

.account-time {
  color: #333;
  font-size: 14px;
  padding: 12px 18px;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

/* 收入卡片时间行 */
.income-card .account-time {
  background-color: #e6f7ed;
}

/* 支出卡片时间行 */
.expense-card .account-time {
  background-color: #fff1f0;
}

.account-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: relative;
  flex: 1;
  padding: 12px 18px;
}

.account-title {
  color: #333;
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  text-align: left;
  max-width: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-type {
  width: 60px;
  text-align: center;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: #ffa940;
  margin-right: 15px;
}

.account-amount {
  min-width: 100px;
  text-align: right;
  font-weight: 600;
  color: #333;
  font-size: 16px;
  margin-right: 15px;
}

.account-type.expense {
  background-color: #ffa940;
}

.account-type.income {
  background-color: #73d13d;
}

/* 编辑和删除按钮 */
.edit-btn,
.delete-btn {
  padding: 4px 8px;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  color: #1890ff;
}

.edit-btn:hover {
  background-color: #f0f5ff;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);
}

.delete-btn {
  color: #ff4d4f;
  margin-left: 12px;
}

.delete-btn:hover {
  background-color: #fff1f0;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(255, 77, 79, 0.2);
}
</style>
