<template>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <div class="header-brand">
          <img src="../assets/images/logo.svg" alt="瓶胚管理系统" class="header-logo">
          <h1 class="header-title">瓶胚全流程管理系统</h1>
        </div>
        <nav class="header-nav">
          <ul class="nav-menu">
            <li class="nav-item">
              <router-link to="/production" class="nav-link">生产</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/delivery" class="nav-link">发货</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/receiving" class="nav-link">收货</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/usage" class="nav-link">使用</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/barcode-maintenance" class="nav-link">编码维护</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/barcode-config" class="nav-link">编码配置</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/status-view" class="nav-link">状态查看</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/statistics" class="nav-link">统计分析</router-link>
            </li>
            <li class="nav-item">
              <a href="#" @click.prevent="handleLogout" class="nav-link nav-link--logout">退出</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <div class="card">
      <h2>生产管理 - 生成编码</h2>
      <div class="form-row">
        <div class="form-group">
          <label for="model">产品型号</label>
          <select id="model" v-model="product.model" required>
            <option value="">请选择产品型号</option>
            <option v-for="option in modelOptions" :key="option.id" :value="option.value">{{ option.value }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="productionLine">生产线</label>
          <select id="productionLine" v-model="product.productionLine" required>
            <option value="">请选择生产线</option>
            <option v-for="option in productionLineOptions" :key="option.id" :value="option.value">{{ option.value }}</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="quantity">生产数量</label>
          <input type="number" id="quantity" v-model="product.quantity" placeholder="请输入生产数量" min="1" required>
        </div>
        <div class="form-group date-input-group">
          <label for="productionDate">生产日期</label>
          <input type="date" id="productionDate" v-model="product.productionDate" required>
        </div>
      </div>
      <div class="button-group">
        <button class="btn btn-primary" @click="generateBarcodes" :disabled="loading">生成编码</button>
        <button v-if="!viewingBatchDetail" class="btn btn-secondary" @click="printAllBarcodes" :disabled="generatedBarcodes.length === 0 || loading">批量打印全部</button>
        <button v-if="viewingBatchDetail" class="btn btn-secondary" @click="printAllBarcodes" :disabled="currentViewingBatch === null || loading">重新打印本批次</button>
      </div>

      <div v-if="loading" style="margin-top: 20px; color: #666;">处理中...</div>

      <div v-if="viewingBatchDetail && currentViewingBatch" class="card" style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3>批次详情 - {{ currentViewingBatch.batch_code }}</h3>
          <button class="btn btn-secondary" @click="closeBatchDetail">关闭详情</button>
        </div>
        <p style="color: #666; margin-bottom: 15px;">
          产品型号：{{ currentViewingBatch.model }} | 生产数量：{{ currentViewingBatch.quantity }} | 生产日期：{{ currentViewingBatch.production_date }}
        </p>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>编码</th>
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
        <h3>已生成 {{ generatedBarcodes.length }} 张编码</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>编码</th>
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
      <div class="table-container">
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
    </div>

    <div ref="printAreaRef" style="display: none;">
      <div id="printContent" style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
        <div id="printBarcode" style="font-size: 24px; font-weight: bold; margin-bottom: 20px;"></div>
        <canvas id="printBarcodeCanvas" style="margin: 20px auto;"></canvas>
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
import QRCode from 'qrcode'

export default {
  data() {
    return {
      product: {
        model: '',
        quantity: '',
        productionLine: '',
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
      },
      modelOptions: [],
      productionLineOptions: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [initResponse, configResponse, modelOptionsResponse, lineOptionsResponse] = await Promise.all([
          fetch('/api/barcodes/init-data'),
          fetch('/api/barcodes/barcode-config'),
          fetch('/api/barcodes/dropdown-options?category=model'),
          fetch('/api/barcodes/dropdown-options?category=production_line')
        ])
        const data = await initResponse.json()
        const configData = await configResponse.json()
        this.modelOptions = await modelOptionsResponse.json()
        this.productionLineOptions = await lineOptionsResponse.json()

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
      if (!this.product.model || !this.product.quantity || !this.product.productionLine || !this.product.productionDate) {
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
            productionLine: this.product.productionLine,
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
        console.error('生成编码失败:', error)
        alert(error.message || '生成编码失败')
      } finally {
        this.loading = false
      }
    },
    async printSingleBarcode(barcode) {
      const cfg = this.barcodeConfig

      const printWindow = window.open('', '_blank')
      
      printWindow.document.write(`
        <html>
          <head>
            <title>打印二维码</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
              @media print { @page { size: auto; } }
              .print-content {
                text-align: center; padding: 20px;
              }
              .print-barcode {
                font-size: 24px; font-weight: bold; margin-bottom: 20px;
              }
              .print-info {
                margin-top: 20px; font-size: 16px;
              }
              .print-time {
                margin-top: 30px; font-size: 12px; color: #999;
              }
            </style>
          </head>
          <body>
            <div class="print-content">
              <div class="print-barcode">${barcode.code}</div>
              <canvas id="printBarcodeCanvas" style="margin: 20px auto;"></canvas>
              <div class="print-info">
                <p>产品型号：${barcode.model}</p>
                <p>序号：${barcode.sequence}</p>
                <p>生产日期：${barcode.production_date || barcode.productionDate}</p>
              </div>
              <div class="print-time">
                <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </body>
        </html>
      `)
      
      printWindow.document.close()
      
      // 等待窗口加载完成后生成二维码
      setTimeout(async () => {
        const printCanvas = printWindow.document.getElementById('printBarcodeCanvas')
        // 生成二维码
        await QRCode.toCanvas(printCanvas, barcode.code, {
          width: 200,
          margin: 1
        })
        
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }, 100)
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
        const canvasId = `barcode_${index}`
        printHtml += `
          <div style="page-break-after: always; text-align: center; padding: 20px;">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px;">${barcode.code}</div>
            <canvas id="${canvasId}" style="margin: 10px auto;"></canvas>
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
            <title>批量打印编码</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
              @media print { @page { size: auto; margin: 10mm; } }
            </style>
          </head>
          <body>${printHtml}</body>
        </html>
      `)

      printWindow.document.close()

      setTimeout(async () => {
        barcodesToPrint.forEach(async (barcode, index) => {
          const canvasId = `barcode_${index}`
          const canvasElement = printWindow.document.getElementById(canvasId)
          if (canvasElement) {
            // 生成二维码
            await QRCode.toCanvas(canvasElement, barcode.code, {
              width: 150,
              margin: 1
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
          const canvasId = `barcode_${index}`
          printHtml += `
            <div style="page-break-after: always; text-align: center; padding: 20px;">
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px;">${barcode.code}</div>
              <canvas id="${canvasId}" style="margin: 10px auto;"></canvas>
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
              <title>批次打印编码 - ${batch.batch_code}</title>
              <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                @media print { @page { size: auto; margin: 10mm; } }
              </style>
            </head>
            <body>${printHtml}</body>
          </html>
        `)

        printWindow.document.close()

        setTimeout(async () => {
          barcodes.forEach(async (barcode, index) => {
            const canvasId = `barcode_${index}`
            const canvasElement = printWindow.document.getElementById(canvasId)
            if (canvasElement) {
              // 生成二维码
              await QRCode.toCanvas(canvasElement, barcode.code, {
                width: 150,
                margin: 1
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