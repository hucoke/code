<template>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <div class="header-brand">
          <img src="../assets/images/logo.svg" alt="瓶胚管理系统" class="header-logo">
          <div class="header-brand-text">
            <h1 class="header-title">瓶胚全流程管理系统</h1>
            <span class="header-version">版本 {{ version }} | 最后更新: {{ lastUpdate }}</span>
          </div>
        </div>
        <nav class="header-nav">
          <ul class="nav-menu">
            <li class="nav-item">
              <router-link to="/production" class="nav-link">生产</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/delivery" class="nav-link">发货</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/receiving" class="nav-link">收货</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/usage" class="nav-link">使用</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/barcode-maintenance" class="nav-link">编码维护</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/barcode-config" class="nav-link">编码配置</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/status-view" class="nav-link">状态查看</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/statistics" class="nav-link">统计分析</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/user-management" class="nav-link">用户管理</router-link>
            </li>
            <li class="nav-item">
              <a href="#" @click.prevent="handleLogout" class="nav-link nav-link--logout">退出</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
import versionInfo from '../version.json'

export default {
  data() {
    return {
      version: versionInfo.version,
      lastUpdate: versionInfo.lastUpdate
    }
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('loggedIn');
      this.$router.push('/');
    }
  },
  beforeMount() {
    if (!localStorage.getItem('loggedIn')) {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.header-brand-text {
  display: flex;
  flex-direction: column;
}

.header-version {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
</style>