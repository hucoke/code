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
    <div class="card">
      <h2>发货管理 - 扫码发货</h2>
      <div class="scan-area">
        <h3>请扫描瓶胚框上的条码</h3>
        <div class="form-group">
          <input type="text" v-model="scannedBarcode" placeholder="或手动输入条码" @keyup.enter="processDelivery">
        </div>
        <button class="btn btn-primary" @click="processDelivery" :disabled="loading">确认发货</button>
      </div>

      <div v-if="deliveryResult" class="card" style="margin-top: 20px;">
        <h3>发货结果</h3>
        <p v-if="deliveryResult.success" style="color: green;">
          条码 {{ deliveryResult.barcode }} 发货成功！
        </p>
        <p v-else style="color: red;">
          {{ deliveryResult.message }}
        </p>
      </div>

      <h3>今日发货记录</h3>
      <table>
        <thead>
          <tr>
            <th>条码</th>
            <th>产品型号</th>
            <th>发货日期</th>
            <th>发货时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in deliveryRecords" :key="record.barcode_code">
            <td>{{ record.barcode_code }}</td>
            <td>{{ record.model }}</td>
            <td>{{ record.delivery_date }}</td>
            <td>{{ record.delivery_time }}</td>
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
      deliveryResult: null,
      deliveryRecords: [],
      loading: false
    }
  },
  mounted() {
    this.loadDeliveryRecords()
  },
  methods: {
    async loadDeliveryRecords() {
      try {
        const response = await fetch('/api/barcodes/delivery-records')
        this.deliveryRecords = await response.json()
      } catch (error) {
        console.error('加载发货记录失败:', error)
      }
    },
    handleLogout() {
      localStorage.removeItem('loggedIn')
      this.$router.push('/')
    },
    async processDelivery() {
      if (!this.scannedBarcode) {
        this.deliveryResult = {
          success: false,
          message: '请输入条码'
        }
        return
      }

      this.loading = true
      try {
        const now = new Date()
        const deliveryDate = now.toISOString().split('T')[0]
        const deliveryTime = now.toTimeString().substring(0, 5)

        const response = await fetch('/api/barcodes/delivery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            barcodeCode: this.scannedBarcode,
            deliveryDate,
            deliveryTime
          })
        })

        const result = await response.json()

        if (response.ok) {
          this.deliveryResult = {
            success: true,
            barcode: this.scannedBarcode,
            message: '发货成功'
          }
          await this.loadDeliveryRecords()
        } else {
          this.deliveryResult = {
            success: false,
            message: result.error || '发货失败'
          }
        }
      } catch (error) {
        console.error('发货失败:', error)
        this.deliveryResult = {
          success: false,
          message: '发货失败，请检查网络连接'
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