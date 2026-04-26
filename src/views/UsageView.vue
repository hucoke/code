<template>
  <div class="container">
    <div class="navbar">
      <h1>瓶胚全流程管理系统</h1>
      <ul>
        <li><router-link to="/dashboard/barcode-maintenance">条码维护</router-link></li>
        <li><router-link to="/dashboard/status-view">状态查看</router-link></li>
        <li><router-link to="/dashboard/statistics">统计分析</router-link></li>
        <li><router-link to="/production">生产管理</router-link></li>
        <li><router-link to="/delivery">发货管理</router-link></li>
        <li><router-link to="/receiving">收货管理</router-link></li>
        <li><router-link to="/usage">使用管理</router-link></li>
        <li><a href="#" @click.prevent="handleLogout">退出登录</a></li>
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