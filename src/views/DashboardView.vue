<template>
  <div class="container">
    <div class="navbar">
      <h1>瓶胚全流程管理系统</h1>
      <ul>
        <li><router-link to="/dashboard/barcode-maintenance">条码维护</router-link></li>
        <li><router-link to="/dashboard/barcode-config">条码配置</router-link></li>
        <li><router-link to="/dashboard/status-view">状态查看</router-link></li>
        <li><router-link to="/dashboard/statistics">统计分析</router-link></li>
        <li><router-link to="/production">生产管理</router-link></li>
        <li><router-link to="/delivery">发货管理</router-link></li>
        <li><router-link to="/receiving">收货管理</router-link></li>
        <li><router-link to="/usage">使用管理</router-link></li>
        <li><a href="#" @click.prevent="handleLogout">退出登录</a></li>
      </ul>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  methods: {
    handleLogout() {
      // 清除登录状态
      localStorage.removeItem('loggedIn');
      // 跳转到登录页面
      this.$router.push('/');
    }
  },
  beforeMount() {
    // 检查登录状态
    if (!localStorage.getItem('loggedIn')) {
      this.$router.push('/');
    }
  }
}
</script>