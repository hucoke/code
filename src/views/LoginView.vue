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
      <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      this.error = '';
      this.loading = true;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: this.username, password: this.password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // 存储登录状态
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('username', this.username);
          // 跳转到生产页面
          console.log('登录成功，准备跳转到生产页面');
          this.$router.push('/production');
        } else {
          this.error = data.message;
        }
      } catch (err) {
        this.error = '登录失败，请检查网络连接';
        console.error('登录错误:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.error-message {
  color: #dc3545;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
}
</style>