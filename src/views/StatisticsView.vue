<template>
  <div class="card">
    <h2>物料状态统计</h2>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
      <div class="stat-card">
        <h3>生产中</h3>
        <div class="stat-value">{{ statusCount.production }}</div>
      </div>
      <div class="stat-card">
        <h3>已发货</h3>
        <div class="stat-value">{{ statusCount.delivery }}</div>
      </div>
      <div class="stat-card">
        <h3>已收货</h3>
        <div class="stat-value">{{ statusCount.received }}</div>
      </div>
      <div class="stat-card">
        <h3>已使用</h3>
        <div class="stat-value">{{ statusCount.used }}</div>
      </div>
    </div>

    <h3>产品型号统计</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>产品型号</th>
            <th>生产中</th>
            <th>已发货</th>
            <th>已收货</th>
            <th>已使用</th>
            <th>总计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(model, index) in modelStats" :key="index">
            <td>{{ model.model }}</td>
            <td>{{ model.production || 0 }}</td>
            <td>{{ model.delivery || 0 }}</td>
            <td>{{ model.received || 0 }}</td>
            <td>{{ model.used || 0 }}</td>
            <td>{{ model.total }}</td>
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
      statusCount: {
        production: 0,
        delivery: 0,
        received: 0,
        used: 0
      },
      modelStats: []
    }
  },
  mounted() {
    this.loadStatistics()
  },
  methods: {
    async loadStatistics() {
      try {
        const response = await fetch('/api/barcodes/statistics')
        const data = await response.json()
        this.statusCount = {
          production: data.production || 0,
          delivery: data.delivery || 0,
          received: data.received || 0,
          used: data.used || 0
        }
        this.modelStats = data.modelStats || []
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    }
  }
}
</script>