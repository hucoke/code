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
    <div class="card">
      <h2>发货管理 - 扫码发货</h2>
      <div class="scan-area">
        <h3>请扫描瓶胚框上的条码</h3>
        <div class="form-group">
          <input type="text" v-model="scannedBarcode" placeholder="或手动输入条码" @keyup.enter="processDelivery">
        </div>
        <div class="button-group">
          <button class="btn btn-primary" @click="processDelivery" :disabled="loading">确认发货</button>
        </div>
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
      <div class="table-container">
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