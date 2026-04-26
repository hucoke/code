<template>
  <div class="user-management-content">
    <h2>用户管理</h2>
    
    <div class="user-actions">
      <button @click="showAddUserForm = true" class="btn btn-primary">添加用户</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else class="user-list">
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <button @click="editUser(user)" class="btn btn-sm btn-secondary">编辑</button>
              <button @click="deleteUser(user.id)" class="btn btn-sm btn-danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加/编辑用户弹窗 -->
    <div v-if="showAddUserForm || showEditUserForm" class="modal-overlay">
      <div class="modal">
        <h3>{{ showEditUserForm ? '编辑用户' : '添加用户' }}</h3>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" v-model="formData.username" required>
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" v-model="formData.password" :required="!showEditUserForm">
            <small v-if="showEditUserForm">留空表示不修改密码</small>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: [],
      loading: false,
      showAddUserForm: false,
      showEditUserForm: false,
      formData: {
        id: null,
        username: '',
        password: ''
      },
      saving: false
    }
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:3000/api/users');
        const data = await response.json();
        if (data.success) {
          this.users = data.users;
        }
      } catch (err) {
        console.error('加载用户失败:', err);
      } finally {
        this.loading = false;
      }
    },
    addUser() {
      this.formData = {
        id: null,
        username: '',
        password: ''
      };
      this.showAddUserForm = true;
      this.showEditUserForm = false;
    },
    editUser(user) {
      this.formData = {
        id: user.id,
        username: user.username,
        password: ''
      };
      this.showEditUserForm = true;
      this.showAddUserForm = false;
    },
    closeModal() {
      this.showAddUserForm = false;
      this.showEditUserForm = false;
    },
    async saveUser() {
      this.saving = true;
      try {
        const response = await fetch('http://localhost:3000/api/users', {
          method: this.showEditUserForm ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formData)
        });
        const data = await response.json();
        if (data.success) {
          this.closeModal();
          this.loadUsers();
        }
      } catch (err) {
        console.error('保存用户失败:', err);
      } finally {
        this.saving = false;
      }
    },
    async deleteUser(userId) {
      if (confirm('确定要删除这个用户吗？')) {
        try {
          const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'DELETE'
          });
          const data = await response.json();
          if (data.success) {
            this.loadUsers();
          }
        } catch (err) {
          console.error('删除用户失败:', err);
        }
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    }
  }
}
</script>

<style scoped>
.user-management-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-actions {
  margin-bottom: 20px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.user-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  margin-right: 5px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>