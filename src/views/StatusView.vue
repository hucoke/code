<template>
  <div class="card">
    <h2>条码状态查看</h2>
    <div class="form-group">
      <label for="barcodeInput">输入条码</label>
      <input type="text" id="barcodeInput" v-model="barcodeInput" placeholder="请输入条码">
      <button class="btn btn-primary" @click="searchBarcode">查询</button>
    </div>

    <div v-if="selectedBarcode" class="card" style="margin-top: 20px;">
      <h3>条码详情</h3>
      <div class="table-container">
        <table>
          <tbody>
            <tr>
              <td><strong>条码</strong></td>
              <td>{{ selectedBarcode.code }}</td>
            </tr>
            <tr>
              <td><strong>产品型号</strong></td>
              <td>{{ selectedBarcode.model }}</td>
            </tr>
            <tr>
              <td><strong>生产批次</strong></td>
              <td>{{ selectedBarcode.batch_code }}</td>
            </tr>
            <tr>
              <td><strong>生产日期</strong></td>
              <td>{{ selectedBarcode.production_date }}</td>
            </tr>
            <tr>
              <td><strong>当前状态</strong></td>
              <td>
                <span :class="['status-tag', `status-${selectedBarcode.current_status || 'production'}`]">
                  {{ statusMap[selectedBarcode.current_status || 'production'] }}
                </span>
              </td>
            </tr>
            <tr v-if="selectedBarcode.delivery_date">
              <td><strong>发货日期</strong></td>
              <td>{{ selectedBarcode.delivery_date }} {{ selectedBarcode.delivery_time }}</td>
            </tr>
            <tr v-if="selectedBarcode.receive_date">
              <td><strong>收货日期</strong></td>
              <td>{{ selectedBarcode.receive_date }} {{ selectedBarcode.receive_time }}</td>
            </tr>
            <tr v-if="selectedBarcode.use_date">
              <td><strong>使用日期</strong></td>
              <td>{{ selectedBarcode.use_date }} {{ selectedBarcode.use_time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <h3>所有条码状态</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>条码</th>
            <th>产品型号</th>
            <th>生产批次</th>
            <th>当前状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in barcodes" :key="item.code">
            <td>{{ item.code }}</td>
            <td>{{ item.model }}</td>
            <td>{{ item.batch_code }}</td>
            <td>
              <span :class="['status-tag', `status-${item.current_status || 'production'}`]">
                {{ statusMap[item.current_status || 'production'] }}
              </span>
            </td>
            <td>
              <button class="btn btn-secondary" @click="viewDetails(item)">查看详情</button>
            </td>
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
      barcodeInput: '',
      selectedBarcode: null,
      barcodes: [],
      statusMap: {
        production: '生产中',
        delivery: '已发货',
        received: '已收货',
        used: '已使用'
      }
    }
  },
  mounted() {
    this.loadBarcodes()
  },
  methods: {
    async loadBarcodes() {
      try {
        const response = await fetch('/api/barcodes/barcodes')
        this.barcodes = await response.json()
      } catch (error) {
        console.error('加载条码失败:', error)
      }
    },
    async searchBarcode() {
      if (!this.barcodeInput) return

      try {
        const response = await fetch(`/api/barcodes/barcodes/${this.barcodeInput}`)
        if (response.ok) {
          this.selectedBarcode = await response.json()
        } else {
          alert('条码不存在')
          this.selectedBarcode = null
        }
      } catch (error) {
        console.error('查询失败:', error)
        alert('查询失败')
      }
    },
    viewDetails(item) {
      this.selectedBarcode = item
      this.barcodeInput = item.code
    }
  }
}
</script>