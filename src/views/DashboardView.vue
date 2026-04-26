<template>
  <div class="container">
    <div class="navbar">
      <div class="navbar-content">
        <h1>瓶胚全流程管理系统</h1>
        <ul class="main-menu">
          <li class="menu-item production">
            <router-link to="/production">
              <span class="menu-icon">📦</span>
              <span class="menu-text">生产</span>
            </router-link>
          </li>
          <li class="menu-item logistics">
            <router-link to="/delivery">
              <span class="menu-icon">🚚</span>
              <span class="menu-text">发货</span>
            </router-link>
          </li>
          <li class="menu-item logistics">
            <router-link to="/receiving">
              <span class="menu-icon">📥</span>
              <span class="menu-text">收货</span>
            </router-link>
          </li>
          <li class="menu-item logistics">
            <router-link to="/usage">
              <span class="menu-icon">🔧</span>
              <span class="menu-text">使用</span>
            </router-link>
          </li>
          <li class="menu-item system">
            <router-link to="/dashboard/barcode-maintenance">
              <span class="menu-icon">🏷</span>
              <span class="menu-text">条码维护</span>
            </router-link>
          </li>
          <li class="menu-item system">
            <router-link to="/dashboard/barcode-config">
              <span class="menu-icon">⚙</span>
              <span class="menu-text">条码配置</span>
            </router-link>
          </li>
          <li class="menu-item system">
            <router-link to="/dashboard/status-view">
              <span class="menu-icon">📊</span>
              <span class="menu-text">状态查看</span>
            </router-link>
          </li>
          <li class="menu-item system">
            <router-link to="/dashboard/statistics">
              <span class="menu-icon">📈</span>
              <span class="menu-text">统计分析</span>
            </router-link>
          </li>
          <li class="menu-item logout">
            <a href="#" @click.prevent="handleLogout">
              <span class="menu-icon">🚪</span>
              <span class="menu-text">退出</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
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