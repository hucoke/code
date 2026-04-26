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
    <div class="card">
      <h2>使用管理 - 扫码使用</h2>
      <div class="scan-area">
        <h3>请扫描瓶胚框上的条码</h3>
        <div class="form-group">
          <input type="text" v-model="scannedBarcode" placeholder="或手动输入条码" @keyup.enter="processUsage">
        </div>
        <button class="btn btn-primary" @click="processUsage" :disabled="loading">确认使用</button>
      </div>

      <div v-if="usageResult" class="card" style="margin-top: 20px;">
        <h3>使用结果</h3>
        <p v-if="usageResult.success" style="color: green;">
          条码 {{ usageResult.barcode }} 使用成功！
        </p>
        <p v-else style="color: red;">
          {{ usageResult.message }}
        </p>
      </div>

      <h3>今日使用记录</h3>
      <table>
        <thead>
          <tr>
            <th>条码</th>
            <th>产品型号</th>
            <th>使用日期</th>
            <th>使用时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in usageRecords" :key="record.barcode_code">
            <td>{{ record.barcode_code }}</td>
            <td>{{ record.model }}</td>
            <td>{{ record.use_date }}</td>
            <td>{{ record.use_time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      scannedBarcode: '',
      usageResult: null,
      usageRecords: [],
      loading: false
    }
  },
  mounted() {
    this.loadUsageRecords()
  },
  methods: {
    async loadUsageRecords() {
      try {
        const response = await fetch('/api/barcodes/usage-records')
        this.usageRecords = await response.json()
      } catch (error) {
        console.error('加载使用记录失败:', error)
      }
    },
    handleLogout() {
      localStorage.removeItem('loggedIn')
      this.$router.push('/')
    },
    async processUsage() {
      if (!this.scannedBarcode) {
        this.usageResult = {
          success: false,
          message: '请输入条码'
        }
        return
      }

      this.loading = true
      try {
        const now = new Date()
        const useDate = now.toISOString().split('T')[0]
        const useTime = now.toTimeString().substring(0, 5)

        const response = await fetch('/api/barcodes/usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            barcodeCode: this.scannedBarcode,
            useDate,
            useTime
          })
        })

        const result = await response.json()

        if (response.ok) {
          this.usageResult = {
            success: true,
            barcode: this.scannedBarcode,
            message: '使用成功'
          }
          await this.loadUsageRecords()
        } else {
          this.usageResult = {
            success: false,
            message: result.error || '使用失败'
          }
        }
      } catch (error) {
        console.error('使用失败:', error)
        this.usageResult = {
          success: false,
          message: '使用失败，请检查网络连接'
        }
      } finally {
        this.loading = false
        this.scannedBarcode = ''
      }
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