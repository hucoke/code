<template>
  <div class="container">
    <div class="navbar">
      <h1>瓶胚全流程管理系统</h1>
      <ul class="main-menu">
        <li class="menu-item">
          <router-link to="/production">
            <span class="menu-icon">📦</span>
            <span class="menu-text">生产</span>
          </router-link>
        </li>
        <li class="menu-item">
          <span class="menu-label">
            <span class="menu-icon">🚚</span>
            <span class="menu-text">物流</span>
          </span>
          <ul class="submenu">
            <li><router-link to="/delivery"><span class="sub-icon">➤</span>发货管理</router-link></li>
            <li><router-link to="/receiving"><span class="sub-icon">➤</span>收货管理</router-link></li>
            <li><router-link to="/usage"><span class="sub-icon">➤</span>使用管理</router-link></li>
          </ul>
        </li>
        <li class="menu-item">
          <span class="menu-label">
            <span class="menu-icon">⚙</span>
            <span class="menu-text">系统</span>
          </span>
          <ul class="submenu">
            <li><router-link to="/dashboard/barcode-maintenance"><span class="sub-icon">➤</span>条码维护</router-link></li>
            <li><router-link to="/dashboard/barcode-config"><span class="sub-icon">➤</span>条码配置</router-link></li>
            <li><router-link to="/dashboard/status-view"><span class="sub-icon">➤</span>状态查看</router-link></li>
            <li><router-link to="/dashboard/statistics"><span class="sub-icon">➤</span>统计分析</router-link></li>
          </ul>
        </li>
        <li class="menu-item">
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
}

.navbar h1 {
  margin: 0 30px 0 0;
  font-size: 18px;
}

.main-menu {
  flex: 1;
  display: flex;
  align-items: center;
}

.menu-item {
  position: relative;
  margin: 0 8px;
  display: inline-block;
}

.menu-item > a,
.menu-item > .menu-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  text-decoration: none;
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.menu-item > a:hover,
.menu-item > .menu-label:hover {
  background-color: rgba(255,255,255,0.15);
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-text {
  font-size: 14px;
}

.submenu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  min-width: 180px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 1000;
  padding: 8px 0;
  margin-top: 2px;
}

.submenu::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 20px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #fff;
  pointer-events: none;
}

.menu-item:hover .submenu {
  display: block;
}

.submenu li {
  list-style: none;
}

.submenu li a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s;
}

.submenu li a:hover {
  background-color: #f5f5f5;
  color: #4CAF50;
}

.submenu li a .sub-icon {
  color: #4CAF50;
  width: 20px;
}
</style>