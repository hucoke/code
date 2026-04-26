<template>
  <div class="container">
    <div class="navbar">
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

<style scoped>
.navbar {
  background-color: var(--primary-color);
  color: white;
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.navbar ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.navbar h1 {
  margin: 0 30px 0 0;
  font-size: 18px;
  white-space: nowrap;
}

.main-menu {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.menu-item {
  position: relative;
  margin: 0;
  display: inline-block;
}

.menu-item > a {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  text-decoration: none;
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 14px;
  white-space: nowrap;
}

.menu-item > a:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-text {
  font-size: 14px;
}

/* Color differentiation for different menu types */
.menu-item.production > a {
  background-color: #4CAF50;
}

.menu-item.logistics > a {
  background-color: #2196F3;
}

.menu-item.system > a {
  background-color: #FF9800;
}

.menu-item.logout > a {
  background-color: #f44336;
}

/* Hover effects for different menu types */
.menu-item.production > a:hover {
  background-color: #45a049;
}

.menu-item.logistics > a:hover {
  background-color: #1976D2;
}

.menu-item.system > a:hover {
  background-color: #F57C00;
}

.menu-item.logout > a:hover {
  background-color: #d32f2f;
}
</style>