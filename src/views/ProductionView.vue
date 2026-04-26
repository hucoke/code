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
      <h2>生产管理 - 生成条码</h2>
      <div class="form-group">
        <label for="model">产品型号</label>
        <select id="model" v-model="product.model" required>
          <option value="">请选择产品型号</option>
          <option value="PET-500ml">PET-500ml</option>
          <option value="PET-1000ml">PET-1000ml</option>
          <option value="PET-1500ml">PET-1500ml</option>
          <option value="PET-2000ml">PET-2000ml</option>
        </select>
      </div>
      <div class="form-group">
        <label for="quantity">生产数量</label>
        <input type="number" id="quantity" v-model="product.quantity" placeholder="请输入生产数量" min="1" required>
      </div>
      <div class="form-group">
        <label for="productionDate">生产日期</label>
        <input type="date" id="productionDate" v-model="product.productionDate" required>
      </div>
      <button class="btn btn-primary" @click="generateBarcodes" :disabled="loading">生成条码</button>
      <button v-if="!viewingBatchDetail" class="btn btn-secondary" @click="printAllBarcodes" :disabled="generatedBarcodes.length === 0 || loading">批量打印全部</button>
      <button v-if="viewingBatchDetail" class="btn btn-secondary" @click="printAllBarcodes" :disabled="currentViewingBatch === null || loading">重新打印本批次</button>

      <div v-if="loading" style="margin-top: 20px; color: #666;">处理中...</div>

      <div v-if="viewingBatchDetail && currentViewingBatch" class="card" style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3>批次详情 - {{ currentViewingBatch.batch_code }}</h3>
          <button class="btn btn-secondary" @click="closeBatchDetail">关闭详情</button>
        </div>
        <p style="color: #666; margin-bottom: 15px;">
          产品型号：{{ currentViewingBatch.model }} | 生产数量：{{ currentViewingBatch.quantity }} | 生产日期：{{ currentViewingBatch.production_date }}
        </p>
        <div style="max-height: 400px; overflow-y: auto;">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>条码</th>
                <th>产品型号</th>
                <th>生产日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(barcode, index) in currentViewingBatch.barcodes" :key="barcode.code">
                <td>{{ index + 1 }}</td>
                <td>{{ barcode.code }}</td>
                <td>{{ barcode.model }}</td>
                <td>{{ barcode.production_date }}</td>
                <td>
                  <button class="btn btn-secondary" @click="printSingleBarcode(barcode)">打印</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="!viewingBatchDetail && generatedBarcodes.length > 0" class="card" style="margin-top: 20px;">
        <h3>已生成 {{ generatedBarcodes.length }} 张条码</h3>
        <div style="max-height: 400px; overflow-y: auto;">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>条码</th>
                <th>产品型号</th>
                <th>生产日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(barcode, index) in generatedBarcodes" :key="barcode.code">
                <td>{{ index + 1 }}</td>
                <td>{{ barcode.code }}</td>
                <td>{{ barcode.model }}</td>
                <td>{{ barcode.productionDate }}</td>
                <td>
                  <button class="btn btn-secondary" @click="printSingleBarcode(barcode)">打印</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h3 style="margin-top: 30px;">历史生产批次</h3>
      <table>
        <thead>
          <tr>
            <th>批次号</th>
            <th>产品型号</th>
            <th>生产数量</th>
            <th>生产日期</th>
            <th>生成时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="batch in productionBatches" :key="batch.batch_code">
            <td>{{ batch.batch_code }}</td>
            <td>{{ batch.model }}</td>
            <td>{{ batch.quantity }}</td>
            <td>{{ batch.production_date }}</td>
            <td>{{ batch.created_at }}</td>
            <td>
              <button class="btn btn-secondary" @click="printBatchBarcodes(batch)">{{ isBatchPrinted(batch.batch_code) ? '重新打印本批次' : '打印本批次' }}</button>
              <button class="btn btn-secondary" @click="viewBatchDetail(batch)">查看详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div ref="printAreaRef" style="display: none;">
      <div id="printContent" style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
        <div id="printBarcode" style="font-size: 24px; font-weight: bold; margin-bottom: 20px;"></div>
        <svg id="printBarcodeSvg" style="margin: 20px auto;"></svg>
        <div style="margin-top: 20px; font-size: 16px;">
          <p id="printModel"></p>
          <p id="printQuantity"></p>
          <p id="printDate"></p>
        </div>
        <div style="margin-top: 30px; font-size: 12px; color: #999;">
          <p>生成时间：<span id="printTime"></span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'

export default {
  data() {
    return {
      product: {
        model: '',
        quantity: '',
        productionDate: new Date().toISOString().split('T')[0]
      },
      generatedBarcodes: [],
      productionBatches: [],
      sequenceTracker: {},
      viewingBatchDetail: false,
      currentViewingBatch: null,
      printedBatches: new Set(),
      loading: false,
      barcodeConfig: {
        barcodeWidth: '2',
        barcodeHeight: '80',
        fontSize: '14',
        margin: '10',
        displayValue: 'true',
        printWidth: '300',
        printHeight: '200',
        printPadding: '20'
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [initResponse, configResponse] = await Promise.all([
          fetch('/api/barcodes/init-data'),
          fetch('/api/barcodes/barcode-config')
        ])
        const data = await initResponse.json()
        const configData = await configResponse.json()

        this.sequenceTracker = data.sequenceTracker
        this.productionBatches = data.productionBatches
        this.printedBatches = new Set(data.printedBatches)
        this.barcodeConfig = { ...this.barcodeConfig, ...configData }
      } catch (error) {
        console.error('加载数据失败:', error)
        alert('加载数据失败，请检查服务器是否运行')
      } finally {
        this.loading = false
      }
    },
    handleLogout() {
      localStorage.removeItem('loggedIn')
      this.$router.push('/')
    },
    async generateBarcodes() {
      if (!this.product.model || !this.product.quantity || !this.product.productionDate) {
        alert('请填写完整的产品信息')
        return
      }

      this.loading = true
      try {
        const response = await fetch('/api/barcodes/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.product.model,
            quantity: parseInt(this.product.quantity),
            productionDate: this.product.productionDate
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '生成失败')
        }

        const data = await response.json()
        this.generatedBarcodes = data.barcodes
        this.sequenceTracker = data.sequenceTracker
        this.productionBatches.unshift({
          ...data.batch,
          barcodes: data.barcodes
        })
        this.viewingBatchDetail = false
        this.currentViewingBatch = null
      } catch (error) {
        console.error('生成条码失败:', error)
        alert(error.message || '生成条码失败')
      } finally {
        this.loading = false
      }
    },
    printSingleBarcode(barcode) {
      const cfg = this.barcodeConfig
      const displayValue = cfg.displayValue === 'true'

      document.getElementById('printBarcode').textContent = barcode.code
      document.getElementById('printModel').textContent = `产品型号：${barcode.model}`
      document.getElementById('printQuantity').textContent = `序号：${barcode.sequence}`
      document.getElementById('printDate').textContent = `生产日期：${barcode.production_date || barcode.productionDate}`
      document.getElementById('printTime').textContent = new Date().toLocaleString('zh-CN')

      const printSvg = document.getElementById('printBarcodeSvg')
      JsBarcode(printSvg, barcode.code, {
        format: 'CODE128',
        width: parseFloat(cfg.barcodeWidth),
        height: parseInt(cfg.barcodeHeight),
        displayValue: displayValue,
        fontSize: parseInt(cfg.fontSize),
        margin: parseInt(cfg.margin)
      })

      const printContent = document.getElementById('printContent').innerHTML
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>打印条码</title>
            <style>
              body { margin: 0; padding: 0; }
              @media print { @page { size: auto; } }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    },
    async printAllBarcodes() {
      const barcodesToPrint = this.viewingBatchDetail && this.currentViewingBatch
        ? this.currentViewingBatch.barcodes
        : this.generatedBarcodes

      if (barcodesToPrint.length === 0) return

      this.loading = true
      try {
        if (this.viewingBatchDetail && this.currentViewingBatch) {
          await this.markBatchAsPrinted(this.currentViewingBatch.batch_code)
        } else if (this.generatedBarcodes.length > 0 && this.product.model) {
          const firstBarcode = this.generatedBarcodes[0]
          const batchCode = firstBarcode.batchCode
          if (batchCode) {
            await this.markBatchAsPrinted(batchCode)
          }
        }
      } catch (error) {
        console.error('标记打印状态失败:', error)
      }

      const printWindow = window.open('', '_blank')
      let printHtml = ''

      barcodesToPrint.forEach((barcode, index) => {
        const svgId = `barcode_${index}`
        printHtml += `
          <div style="page-break-after: always; text-align: center; padding: 20px;">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px;">${barcode.code}</div>
            <svg id="${svgId}" style="margin: 10px auto;"></svg>
            <div style="margin-top: 10px; font-size: 12px;">
              <p style="margin: 2px 0;">型号：${barcode.model}</p>
              <p style="margin: 2px 0;">日期：${barcode.production_date || barcode.productionDate}</p>
            </div>
          </div>
        `
      })

      printWindow.document.write(`
        <html>
          <head>
            <title>批量打印条码</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
              @media print { @page { size: auto; margin: 10mm; } }
            </style>
          </head>
          <body>${printHtml}</body>
        </html>
      `)

      printWindow.document.close()

      setTimeout(() => {
        const cfg = this.barcodeConfig
        const displayValue = cfg.displayValue === 'true'
        barcodesToPrint.forEach((barcode, index) => {
          const svgId = `barcode_${index}`
          const svgElement = printWindow.document.getElementById(svgId)
          if (svgElement) {
            JsBarcode(svgElement, barcode.code, {
              format: 'CODE128',
              width: parseFloat(cfg.barcodeWidth),
              height: parseInt(cfg.barcodeHeight),
              displayValue: displayValue,
              fontSize: parseInt(cfg.fontSize),
              margin: parseInt(cfg.margin)
            })
          }
        })
        printWindow.focus()
        printWindow.print()
      }, 100)

      this.loading = false
    },
    async printBatchBarcodes(batch) {
      this.loading = true
      try {
        await this.markBatchAsPrinted(batch.batch_code)

        const response = await fetch(`/api/barcodes/batches/${batch.batch_code}/barcodes`)
        const barcodes = await response.json()

        const printWindow = window.open('', '_blank')
        let printHtml = ''

        barcodes.forEach((barcode, index) => {
          const svgId = `barcode_${index}`
          printHtml += `
            <div style="page-break-after: always; text-align: center; padding: 20px;">
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px;">${barcode.code}</div>
              <svg id="${svgId}" style="margin: 10px auto;"></svg>
              <div style="margin-top: 10px; font-size: 12px;">
                <p style="margin: 2px 0;">型号：${barcode.model}</p>
                <p style="margin: 2px 0;">日期：${barcode.production_date}</p>
              </div>
            </div>
          `
        })

        printWindow.document.write(`
          <html>
            <head>
              <title>批次打印条码 - ${batch.batch_code}</title>
              <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                @media print { @page { size: auto; margin: 10mm; } }
              </style>
            </head>
            <body>${printHtml}</body>
          </html>
        `)

        printWindow.document.close()

        setTimeout(() => {
          const cfg = this.barcodeConfig
          const displayValue = cfg.displayValue === 'true'
          barcodes.forEach((barcode, index) => {
            const svgId = `barcode_${index}`
            const svgElement = printWindow.document.getElementById(svgId)
            if (svgElement) {
              JsBarcode(svgElement, barcode.code, {
                format: 'CODE128',
                width: parseFloat(cfg.barcodeWidth),
                height: parseInt(cfg.barcodeHeight),
                displayValue: displayValue,
                fontSize: parseInt(cfg.fontSize),
                margin: parseInt(cfg.margin)
              })
            }
          })
          printWindow.focus()
          printWindow.print()
        }, 100)
      } catch (error) {
        console.error('打印批次失败:', error)
        alert('打印失败')
      } finally {
        this.loading = false
      }
    },
    async viewBatchDetail(batch) {
      this.loading = true
      try {
        const response = await fetch(`/api/barcodes/batches/${batch.batch_code}/barcodes`)
        const barcodes = await response.json()
        this.currentViewingBatch = {
          ...batch,
          barcodes: barcodes
        }
        this.viewingBatchDetail = true
        this.generatedBarcodes = []
      } catch (error) {
        console.error('获取批次详情失败:', error)
        alert('获取批次详情失败')
      } finally {
        this.loading = false
      }
    },
    closeBatchDetail() {
      this.viewingBatchDetail = false
      this.currentViewingBatch = null
    },
    isBatchPrinted(batchCode) {
      return this.printedBatches.has(batchCode)
    },
    async markBatchAsPrinted(batchCode) {
      if (!batchCode) return
      try {
        await fetch(`/api/barcodes/mark-printed/${batchCode}`, { method: 'POST' })
        this.printedBatches.add(batchCode)
      } catch (error) {
        console.error('标记打印状态失败:', error)
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

.menu-item:hover > .submenu {
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