<template>
  <div class="card">
      <h2>二维码可视化配置</h2>

      <div class="config-section">
        <h3>二维码参数设置</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="qrcodeSize">二维码大小</label>
            <input type="number" id="qrcodeSize" v-model="config.qrcodeSize" min="100" max="300">
          </div>
          <div class="form-group">
            <label for="margin">边距</label>
            <input type="number" id="margin" v-model="config.margin" min="0" max="20">
          </div>
          <div class="form-group">
            <label for="fontSize">字体大小</label>
            <input type="number" id="fontSize" v-model="config.fontSize" min="8" max="24">
          </div>
        </div>
      </div>

      <div class="config-section">
        <h3>自定义文本设置</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="customTextTop">编码上方文本</label>
            <input type="text" id="customTextTop" v-model="config.customTextTop" placeholder="例：产品名称">
          </div>
          <div class="form-group">
            <label for="customTextBottom">编码下方文本</label>
            <input type="text" id="customTextBottom" v-model="config.customTextBottom" placeholder="例：生产日期">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="config.showCustomTextTop" :true-value="'true'" :false-value="'false'">
              显示上方文本
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="config.showCustomTextBottom" :true-value="'true'" :false-value="'false'">
              显示下方文本
            </label>
          </div>
        </div>
      </div>

      <div class="config-section">
        <h3>打印区域设置</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="printWidth">打印宽度 (px)</label>
            <input type="number" id="printWidth" v-model="config.printWidth" min="100" max="600">
          </div>
          <div class="form-group">
            <label for="printHeight">打印高度 (px)</label>
            <input type="number" id="printHeight" v-model="config.printHeight" min="100" max="400">
          </div>
          <div class="form-group">
            <label for="printPadding">打印内边距</label>
            <input type="number" id="printPadding" v-model="config.printPadding" min="0" max="50">
          </div>
        </div>
      </div>

      <div class="config-section">
        <h3>预览效果</h3>
        <div class="preview-container">
          <div class="preview-box" :style="previewStyle">
            <div v-if="config.showCustomTextTop === 'true' && config.customTextTop" class="preview-custom-text preview-text-top">{{ config.customTextTop }}</div>
            <svg ref="previewBarcode"></svg>
            <div class="preview-text">{{ previewCode }}</div>
            <div v-if="config.showCustomTextBottom === 'true' && config.customTextBottom" class="preview-custom-text preview-text-bottom">{{ config.customTextBottom }}</div>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button class="btn btn-primary" @click="saveConfig">保存配置</button>
        <button class="btn btn-secondary" @click="resetConfig">重置为默认</button>
        <button class="btn btn-secondary" @click="printPreview">打印预览</button>
      </div>

      <div v-if="saveMessage" :class="['save-message', saveMessage.type]">
        {{ saveMessage.text }}
      </div>
    </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  data() {
    return {
      config: {
        qrcodeSize: '200',
        margin: '1',
        fontSize: '14',
        customTextTop: '',
        customTextBottom: '',
        showCustomTextTop: 'false',
        showCustomTextBottom: 'true',
        printWidth: '300',
        printHeight: '200',
        printPadding: '20'
      },
      previewCode: 'P500202604250001',
      saveMessage: null
    }
  },
  computed: {
    previewStyle() {
      return {
        width: `${parseInt(this.config.printWidth) + 40}px`,
        minHeight: `${parseInt(this.config.printHeight) + 40}px`,
        padding: `${this.config.printPadding}px`
      }
    }
  },
  mounted() {
    this.loadConfig()
  },
  watch: {
    'config.qrcodeSize': 'updatePreview',
    'config.margin': 'updatePreview',
    'config.fontSize': 'updatePreview',
    'config.customTextTop': 'updatePreview',
    'config.customTextBottom': 'updatePreview',
    'config.showCustomTextTop': 'updatePreview',
    'config.showCustomTextBottom': 'updatePreview'
  },
  methods: {
    async loadConfig() {
      try {
        const response = await fetch('/api/barcodes/barcode-config')
        const data = await response.json()
        this.config = { ...this.config, ...data }
        this.$nextTick(() => {
          this.updatePreview()
        })
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    },
    async updatePreview() {
      if (!this.$refs.previewBarcode) return

      const qrcodeSize = parseInt(this.config.qrcodeSize)
      const margin = parseInt(this.config.margin)

      try {
        // 清空之前的内容
        this.$refs.previewBarcode.innerHTML = ''
        // 创建canvas元素
        const canvas = document.createElement('canvas')
        this.$refs.previewBarcode.appendChild(canvas)
        // 生成二维码
        await QRCode.toCanvas(canvas, this.previewCode, {
          width: qrcodeSize,
          margin: margin
        })
      } catch (error) {
        console.error('二维码生成失败:', error)
      }
    },
    async saveConfig() {
      try {
        const response = await fetch('/api/barcodes/barcode-config/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.config)
        })

        if (response.ok) {
          this.showMessage('配置保存成功', 'success')
        } else {
          this.showMessage('保存失败', 'error')
        }
      } catch (error) {
        console.error('保存配置失败:', error)
        this.showMessage('保存失败', 'error')
      }
    },
    resetConfig() {
      this.config = {
        qrcodeSize: '200',
        margin: '1',
        fontSize: '14',
        customTextTop: '',
        customTextBottom: '',
        showCustomTextTop: 'false',
        showCustomTextBottom: 'true',
        printWidth: '300',
        printHeight: '200',
        printPadding: '20'
      }
      this.$nextTick(() => {
        this.updatePreview()
      })
    },
    async printPreview() {
      const printWindow = window.open('', '_blank')
      const qrcodeSize = parseInt(this.config.qrcodeSize)
      const margin = parseInt(this.config.margin)
      const fontSize = parseInt(this.config.fontSize)

      // 创建canvas元素生成二维码
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, this.previewCode, {
        width: qrcodeSize,
        margin: margin
      })
      
      // 将canvas转换为data URL
      const qrCodeDataUrl = canvas.toDataURL('image/png')

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>二维码打印预览</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                font-family: Arial, sans-serif;
              }
              .print-box {
                width: ${this.config.printWidth}px;
                min-height: ${this.config.printHeight}px;
                padding: ${this.config.printPadding}px;
                border: 1px dashed #ccc;
                text-align: center;
              }
              .print-box img {
                max-width: 100%;
                height: auto;
              }
              .print-text {
                margin-top: 10px;
                font-size: ${fontSize}px;
                font-weight: bold;
              }
              .print-custom-text {
                margin: 8px 0;
                font-size: ${fontSize}px;
              }
              .print-text-top {
                font-weight: bold;
              }
              .print-text-bottom {
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="print-box">
              ${this.config.showCustomTextTop === 'true' && this.config.customTextTop ? `<div class="print-custom-text print-text-top">${this.config.customTextTop}</div>` : ''}
              <img src="${qrCodeDataUrl}" alt="二维码">
              <div class="print-text">${this.previewCode}</div>
              ${this.config.showCustomTextBottom === 'true' && this.config.customTextBottom ? `<div class="print-custom-text print-text-bottom">${this.config.customTextBottom}</div>` : ''}
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    },
    showMessage(text, type) {
      this.saveMessage = { text, type }
      setTimeout(() => {
        this.saveMessage = null
      }, 3000)
    },
    handleLogout() {
      localStorage.removeItem('loggedIn')
      this.$router.push('/')
    }
  }
}
</script>