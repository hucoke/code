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
      <h2>条码可视化配置</h2>

      <div class="config-section">
        <h3>条码参数设置</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="barcodeWidth">条码宽度</label>
            <input type="number" id="barcodeWidth" v-model="config.barcodeWidth" min="1" max="5" step="0.5">
          </div>
          <div class="form-group">
            <label for="barcodeHeight">条码高度</label>
            <input type="number" id="barcodeHeight" v-model="config.barcodeHeight" min="30" max="200">
          </div>
          <div class="form-group">
            <label for="fontSize">字体大小</label>
            <input type="number" id="fontSize" v-model="config.fontSize" min="8" max="24">
          </div>
          <div class="form-group">
            <label for="margin">边距</label>
            <input type="number" id="margin" v-model="config.margin" min="0" max="20">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="textMargin">文字边距</label>
            <input type="number" id="textMargin" v-model="config.textMargin" min="0" max="10">
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="config.displayValue" :true-value="'true'" :false-value="'false'">
              显示条码值
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
            <svg ref="previewBarcode"></svg>
            <div class="preview-text">{{ previewCode }}</div>
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
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'

export default {
  data() {
    return {
      config: {
        barcodeWidth: '2',
        barcodeHeight: '80',
        fontSize: '14',
        margin: '10',
        displayValue: 'true',
        showText: 'true',
        textMargin: '2',
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
    'config.barcodeWidth': 'updatePreview',
    'config.barcodeHeight': 'updatePreview',
    'config.fontSize': 'updatePreview',
    'config.margin': 'updatePreview',
    'config.displayValue': 'updatePreview',
    'config.textMargin': 'updatePreview'
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
    updatePreview() {
      if (!this.$refs.previewBarcode) return

      const barcodeWidth = parseFloat(this.config.barcodeWidth)
      const barcodeHeight = parseInt(this.config.barcodeHeight)
      const fontSize = parseInt(this.config.fontSize)
      const margin = parseInt(this.config.margin)
      const displayValue = this.config.displayValue === 'true'

      try {
        JsBarcode(this.$refs.previewBarcode, this.previewCode, {
          format: 'CODE128',
          width: barcodeWidth,
          height: barcodeHeight,
          displayValue: displayValue,
          fontSize: fontSize,
          margin: margin,
          textMargin: parseInt(this.config.textMargin)
        })
      } catch (error) {
        console.error('条码生成失败:', error)
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
        barcodeWidth: '2',
        barcodeHeight: '80',
        fontSize: '14',
        margin: '10',
        displayValue: 'true',
        showText: 'true',
        textMargin: '2',
        printWidth: '300',
        printHeight: '200',
        printPadding: '20'
      }
      this.$nextTick(() => {
        this.updatePreview()
      })
    },
    printPreview() {
      const printWindow = window.open('', '_blank')
      const barcodeWidth = parseFloat(this.config.barcodeWidth)
      const barcodeHeight = parseInt(this.config.barcodeHeight)
      const fontSize = parseInt(this.config.fontSize)
      const margin = parseInt(this.config.margin)
      const displayValue = this.config.displayValue === 'true'

      let svgHtml = ''
      const tempSvg = document.createElement('svg')
      JsBarcode(tempSvg, this.previewCode, {
        format: 'CODE128',
        width: barcodeWidth,
        height: barcodeHeight,
        displayValue: displayValue,
        fontSize: fontSize,
        margin: margin,
        textMargin: parseInt(this.config.textMargin)
      })
      svgHtml = tempSvg.outerHTML

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>条码打印预览</title>
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
              .print-box svg {
                max-width: 100%;
                height: auto;
              }
              .print-text {
                margin-top: 10px;
                font-size: ${fontSize}px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="print-box">
              ${svgHtml}
              <div class="print-text">${this.previewCode}</div>
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

<style scoped>
.config-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.config-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  min-width: 120px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input[type="number"],
.form-group input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input[type="number"]:focus,
.form-group input[type="text"]:focus {
  outline: none;
  border-color: #4CAF50;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.preview-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.preview-box {
  border: 1px dashed #999;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
}

.preview-box svg {
  max-width: 100%;
}

.preview-text {
  margin-top: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #666;
  color: white;
}

.btn-secondary:hover {
  background-color: #555;
}

.save-message {
  margin-top: 15px;
  padding: 10px 15px;
  border-radius: 4px;
  text-align: center;
}

.save-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.save-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
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