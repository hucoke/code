<template>
  <div class="container">
    <div class="navbar">
      <h1>瓶胚全流程管理系统</h1>
      <ul class="main-menu">
        <li class="menu-item">
          <router-link to="/production">生产管理</router-link>
        </li>
        <li class="menu-item">
          <span class="menu-label">物流管理</span>
          <ul class="submenu">
            <li><router-link to="/delivery">发货管理</router-link></li>
            <li><router-link to="/receiving">收货管理</router-link></li>
            <li><router-link to="/usage">使用管理</router-link></li>
          </ul>
        </li>
        <li class="menu-item">
          <span class="menu-label">系统管理</span>
          <ul class="submenu">
            <li><router-link to="/dashboard/barcode-maintenance">条码维护</router-link></li>
            <li><router-link to="/dashboard/barcode-config">条码配置</router-link></li>
            <li><router-link to="/dashboard/status-view">状态查看</router-link></li>
            <li><router-link to="/dashboard/statistics">统计分析</router-link></li>
          </ul>
        </li>
        <li class="menu-item">
          <a href="#" @click.prevent="handleLogout">退出登录</a>
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
}

.menu-item {
  position: relative;
  margin: 0 5px;
}

.menu-item > a,
.menu-item > .menu-label {
  display: block;
  padding: 10px 15px;
  text-decoration: none;
  color: #fff;
  cursor: pointer;
}

.menu-item > a:hover,
.menu-item > .menu-label:hover {
  background-color: #45a049;
}

.submenu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #4CAF50;
  min-width: 150px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000;
}

.menu-item:hover .submenu {
  display: block;
}

.submenu li {
  list-style: none;
}

.submenu li a {
  display: block;
  padding: 10px 15px;
  color: #fff;
  text-decoration: none;
}

.submenu li a:hover {
  background-color: #45a049;
}
</style>