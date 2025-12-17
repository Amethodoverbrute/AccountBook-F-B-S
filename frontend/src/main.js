/**
 * 前端应用入口文件
 * 功能：初始化Vue应用，配置插件，挂载到DOM
 */

// 导入Vue的createApp函数，用于创建Vue应用实例
import { createApp } from "vue";

// 导入全局样式文件，应用于整个应用
import "./style.css";

// 导入根组件App，应用的最顶层组件
import App from "./App.vue";

// 导入路由配置，用于管理应用的路由
import router from "./router";

// 创建Vue应用实例，传入根组件App
const app = createApp(App);

// 注册路由插件，使应用支持路由功能
app.use(router);

// 将Vue应用挂载到DOM中的#app元素上，完成应用初始化
app.mount("#app");
