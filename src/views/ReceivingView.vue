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
    <div class="card">
      <h2>收货管理 - 扫码收货</h2>
      <div class="scan-area">
        <h3>请扫描瓶胚框上的条码</h3>
        <div class="form-group">
          <input type="text" v-model="scannedBarcode" placeholder="或手动输入条码" @keyup.enter="processReceiving">
        </div>
        <button class="btn btn-primary" @click="processReceiving" :disabled="loading">确认收货</button>
      </div>

      <div v-if="receivingResult" class="card" style="margin-top: 20px;">
        <h3>收货结果</h3>
        <p v-if="receivingResult.success" style="color: green;">
          条码 {{ receivingResult.barcode }} 收货成功！
        </p>
        <p v-else style="color: red;">
          {{ receivingResult.message }}
        </p>
      </div>

      <h3>今日收货记录</h3>
      <table>
        <thead>
          <tr>
            <th>条码</th>
            <th>产品型号</th>
            <th>收货日期</th>
            <th>收货时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in receivingRecords" :key="record.barcode_code">
            <td>{{ record.barcode_code }}</td>
            <td>{{ record.model }}</td>
            <td>{{ record.receive_date }}</td>
            <td>{{ record.receive_time }}</td>
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
      receivingResult: null,
      receivingRecords: [],
      loading: false
    }
  },
  mounted() {
    this.loadReceivingRecords()
  },
  methods: {
    async loadReceivingRecords() {
      try {
        const response = await fetch('/api/barcodes/receiving-records')
        this.receivingRecords = await response.json()
      } catch (error) {
        console.error('加载收货记录失败:', error)
      }
    },
    handleLogout() {
      localStorage.removeItem('loggedIn')
      this.$router.push('/')
    },
    async processReceiving() {
      if (!this.scannedBarcode) {
        this.receivingResult = {
          success: false,
          message: '请输入条码'
        }
        return
      }

      this.loading = true
      try {
        const now = new Date()
        const receiveDate = now.toISOString().split('T')[0]
        const receiveTime = now.toTimeString().substring(0, 5)

        const response = await fetch('/api/barcodes/receiving', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            barcodeCode: this.scannedBarcode,
            receiveDate,
            receiveTime
          })
        })

        const result = await response.json()

        if (response.ok) {
          this.receivingResult = {
            success: true,
            barcode: this.scannedBarcode,
            message: '收货成功'
          }
          await this.loadReceivingRecords()
        } else {
          this.receivingResult = {
            success: false,
            message: result.error || '收货失败'
          }
        }
      } catch (error) {
        console.error('收货失败:', error)
        this.receivingResult = {
          success: false,
          message: '收货失败，请检查网络连接'
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