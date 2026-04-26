<template>
  <div class="login-container">
    <h2>瓶胚全流程管理系统</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">登录</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      // 模拟登录验证
      if (this.username && this.password) {
        // 存储登录状态
        localStorage.setItem('loggedIn', 'true');
        // 跳转到仪表板
        this.$router.push('/dashboard/barcode-maintenance');
      }
    }
  }
}
</script>