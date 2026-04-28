<template>
  <div class="card">
      <h2>编码打印配置</h2>

      <div class="config-section">
        <h3>打印页面设置</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="printWidth">页面宽度 (mm)</label>
            <input type="number" id="printWidth" v-model="config.printWidth" min="50" max="200">
          </div>
          <div class="form-group">
            <label for="printHeight">页面高度 (mm)</label>
            <input type="number" id="printHeight" v-model="config.printHeight" min="50" max="200">
          </div>
          <div class="form-group">
            <label for="printPadding">内边距 (mm)</label>
            <input type="number" id="printPadding" v-model="config.printPadding" min="0" max="20">
          </div>
        </div>
      </div>

      <div class="config-section">
        <h3>二维码参数</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="qrcodeSize">二维码大小 (px)</label>
            <input type="number" id="qrcodeSize" v-model="config.qrcodeSize" min="100" max="300">
          </div>
          <div class="form-group">
            <label for="qrcodeMargin">边距</label>
            <input type="number" id="qrcodeMargin" v-model="config.qrcodeMargin" min="0" max="10">
          </div>
          <div class="form-group">
            <label for="showQrcode">
              <input type="checkbox" v-model="config.showQrcode">
              显示二维码
            </label>
          </div>
        </div>
      </div>

      <div class="config-section">
        <h3>字段配置</h3>
        <p class="section-desc">选择要显示的字段，并设置显示位置和格式</p>
        
        <div class="fields-container">
          <div v-for="field in availableFields" :key="field.key" class="field-config">
            <div class="field-header">
              <label>
                <input type="checkbox" v-model="field.visible">
                {{ field.label }}
              </label>
              <select v-model="field.position" :disabled="!field.visible" class="position-select">
                <option value="top">上方</option>
                <option value="middle">中间</option>
                <option value="bottom">下方</option>
                <option value="hidden">不显示（仅编码）</option>
              </select>
              <select v-model="field.format" :disabled="!field.visible" class="format-select">
                <option value="value">显示完整值</option>
                <option value="abbreviation">显示缩写</option>
                <option value="both">缩写：值</option>
              </select>
            </div>
            <div class="field-preview" v-if="field.visible">
              <span>预览：</span>
              <span :class="['preview-value', field.format]">
                {{ getFieldPreview(field) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="config-section">
        <h3>编码格式配置</h3>
        <p class="section-desc">设置二维码编码内容的组成顺序</p>
        
        <div class="encoding-config">
          <div class="encoding-fields">
            <div v-for="(field, index) in config.encodingFields" :key="field" class="encoding-item">
              <span class="encoding-index">{{ index + 1 }}</span>
              <span class="encoding-field">{{ getFieldLabel(field) }}</span>
              <button @click="removeEncodingField(index)" class="btn-remove">×</button>
            </div>
          </div>
          <div class="encoding-add">
            <select v-model="newEncodingField" class="encoding-select">
              <option value="">选择要添加的字段</option>
              <option v-for="field in availableFields" :key="field.key" :value="field.key">
                {{ field.label }}
              </option>
            </select>
            <button @click="addEncodingField" class="btn-add">添加</button>
          </div>
          <div class="encoding-preview">
            <span class="preview-label">编码预览：</span>
            <span class="preview-code">{{ encodingPreview }}</span>
          </div>
        </div>
      </div>

      <div class="config-section">
        <h3>自定义文本</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="customTextTop">顶部文本</label>
            <input type="text" id="customTextTop" v-model="config.customTextTop" placeholder="自定义顶部文本">
          </div>
          <div class="form-group">
            <label for="customTextBottom">底部文本</label>
            <input type="text" id="customTextBottom" v-model="config.customTextBottom" placeholder="自定义底部文本">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="fontSize">字体大小 (px)</label>
            <input type="number" id="fontSize" v-model="config.fontSize" min="8" max="32">
          </div>
          <div class="form-group">
            <label for="fontWeight">字重</label>
            <select id="fontWeight" v-model="config.fontWeight">
              <option value="normal">正常</option>
              <option value="bold">粗体</option>
            </select>
          </div>
        </div>
      </div>

      <div class="config-section">
        <h3>预览效果</h3>
        <div class="preview-container">
          <div class="preview-box" :style="previewStyle">
            <div v-if="config.customTextTop" class="preview-text preview-text-top">{{ config.customTextTop }}</div>
            
            <div class="preview-fields preview-fields-top">
              <span v-for="field in topFields" :key="field.key" class="preview-field-item">
                {{ getFieldDisplayValue(field) }}
              </span>
            </div>
            
            <div v-if="config.showQrcode" class="preview-qrcode">
              <canvas ref="previewCanvas"></canvas>
            </div>
            <div class="preview-code">{{ encodingPreview }}</div>
            
            <div class="preview-fields preview-fields-bottom">
              <span v-for="field in bottomFields" :key="field.key" class="preview-field-item">
                {{ getFieldDisplayValue(field) }}
              </span>
            </div>
            
            <div v-if="config.customTextBottom" class="preview-text preview-text-bottom">{{ config.customTextBottom }}</div>
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
        printWidth: '100',
        printHeight: '60',
        printPadding: '5',
        qrcodeSize: '150',
        qrcodeMargin: '1',
        showQrcode: true,
        fontSize: '12',
        fontWeight: 'normal',
        customTextTop: '',
        customTextBottom: '',
        encodingFields: ['supplier', 'model', 'productionDate', 'sequence']
      },
      newEncodingField: '',
      availableFields: [
        { key: 'supplier', label: '供应商', visible: true, position: 'top', format: 'abbreviation', sampleValue: '供应商A', sampleAbbreviation: 'SA' },
        { key: 'productionLine', label: '生产线', visible: true, position: 'top', format: 'abbreviation', sampleValue: 'LINE-A', sampleAbbreviation: 'LA' },
        { key: 'model', label: '产品型号', visible: true, position: 'middle', format: 'abbreviation', sampleValue: 'PET-500ml', sampleAbbreviation: 'P500' },
        { key: 'rawMaterial', label: '原料名称', visible: false, position: 'bottom', format: 'value', sampleValue: 'PET原料', sampleAbbreviation: 'PET' },
        { key: 'productionDate', label: '生产日期', visible: true, position: 'bottom', format: 'value', sampleValue: '2026-04-28', sampleAbbreviation: '260428' },
        { key: 'sequence', label: '序号', visible: true, position: 'bottom', format: 'value', sampleValue: '0001', sampleAbbreviation: '0001' },
        { key: 'batchCode', label: '批次号', visible: false, position: 'bottom', format: 'value', sampleValue: 'B20260428P500001', sampleAbbreviation: 'B260428P500' }
      ],
      saveMessage: null
    }
  },
  computed: {
    previewStyle() {
      return {
        width: `${parseInt(this.config.printWidth) + 20}px`,
        minHeight: `${parseInt(this.config.printHeight) + 20}px`,
        padding: `${this.config.printPadding}px`
      }
    },
    encodingPreview() {
      return this.config.encodingFields.map(fieldKey => {
        const field = this.availableFields.find(f => f.key === fieldKey)
        if (field) {
          if (field.format === 'abbreviation') return field.sampleAbbreviation
          if (field.format === 'both') return `${field.sampleAbbreviation}:${field.sampleValue}`
          return field.sampleValue
        }
        return fieldKey
      }).join('')
    },
    topFields() {
      return this.availableFields.filter(f => f.visible && f.position === 'top')
    },
    bottomFields() {
      return this.availableFields.filter(f => f.visible && f.position === 'bottom')
    }
  },
  mounted() {
    this.loadConfig()
  },
  watch: {
    'config': {
      handler: 'updatePreview',
      deep: true
    },
    'availableFields': {
      handler: 'updatePreview',
      deep: true
    }
  },
  methods: {
    async loadConfig() {
      try {
        const response = await fetch('/api/barcodes/barcode-config')
        const data = await response.json()
        
        if (data.fields) {
          this.availableFields = JSON.parse(data.fields)
        }
        if (data.encodingFields) {
          this.config.encodingFields = JSON.parse(data.encodingFields)
        }
        
        this.config = { ...this.config, ...data }
        
        if (this.config.showQrcode === 'true' || this.config.showQrcode === true) {
          this.config.showQrcode = true
        } else {
          this.config.showQrcode = false
        }
        
        this.$nextTick(() => {
          this.updatePreview()
        })
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    },
    async updatePreview() {
      if (!this.$refs.previewCanvas) return

      const qrcodeSize = parseInt(this.config.qrcodeSize)
      const margin = parseInt(this.config.qrcodeMargin)

      try {
        await QRCode.toCanvas(this.$refs.previewCanvas, this.encodingPreview, {
          width: qrcodeSize,
          margin: margin
        })
      } catch (error) {
        console.error('二维码生成失败:', error)
      }
    },
    async saveConfig() {
      try {
        const saveConfig = {
          ...this.config,
          fields: JSON.stringify(this.availableFields),
          encodingFields: JSON.stringify(this.config.encodingFields)
        }
        
        const response = await fetch('/api/barcodes/barcode-config/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(saveConfig)
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
        printWidth: '100',
        printHeight: '60',
        printPadding: '5',
        qrcodeSize: '150',
        qrcodeMargin: '1',
        showQrcode: true,
        fontSize: '12',
        fontWeight: 'normal',
        customTextTop: '',
        customTextBottom: '',
        encodingFields: ['supplier', 'model', 'productionDate', 'sequence']
      }
      this.availableFields = [
        { key: 'supplier', label: '供应商', visible: true, position: 'top', format: 'abbreviation', sampleValue: '供应商A', sampleAbbreviation: 'SA' },
        { key: 'productionLine', label: '生产线', visible: true, position: 'top', format: 'abbreviation', sampleValue: 'LINE-A', sampleAbbreviation: 'LA' },
        { key: 'model', label: '产品型号', visible: true, position: 'middle', format: 'abbreviation', sampleValue: 'PET-500ml', sampleAbbreviation: 'P500' },
        { key: 'rawMaterial', label: '原料名称', visible: false, position: 'bottom', format: 'value', sampleValue: 'PET原料', sampleAbbreviation: 'PET' },
        { key: 'productionDate', label: '生产日期', visible: true, position: 'bottom', format: 'value', sampleValue: '2026-04-28', sampleAbbreviation: '260428' },
        { key: 'sequence', label: '序号', visible: true, position: 'bottom', format: 'value', sampleValue: '0001', sampleAbbreviation: '0001' },
        { key: 'batchCode', label: '批次号', visible: false, position: 'bottom', format: 'value', sampleValue: 'B20260428P500001', sampleAbbreviation: 'B260428P500' }
      ]
      this.$nextTick(() => {
        this.updatePreview()
      })
    },
    async printPreview() {
      const printWindow = window.open('', '_blank')
      const qrcodeSize = parseInt(this.config.qrcodeSize)
      const margin = parseInt(this.config.qrcodeMargin)
      const fontSize = parseInt(this.config.fontSize)

      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, this.encodingPreview, {
        width: qrcodeSize,
        margin: margin
      })
      
      const qrCodeDataUrl = canvas.toDataURL('image/png')

      const topFieldsHtml = this.topFields.map(field => 
        `<div class="print-field">${this.getFieldDisplayValue(field)}</div>`
      ).join('')
      
      const bottomFieldsHtml = this.bottomFields.map(field => 
        `<div class="print-field">${this.getFieldDisplayValue(field)}</div>`
      ).join('')

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>编码打印预览</title>
            <style>
              body {
                margin: 0;
                padding: ${this.config.printPadding}mm;
                font-family: Arial, sans-serif;
              }
              .print-box {
                width: ${this.config.printWidth}mm;
                min-height: ${this.config.printHeight}mm;
                padding: ${this.config.printPadding}mm;
                border: 1px dashed #ccc;
                text-align: center;
                page-break-inside: avoid;
              }
              .print-box img {
                max-width: 100%;
                height: auto;
              }
              .print-text {
                font-size: ${fontSize}px;
                font-weight: ${this.config.fontWeight};
                margin: 5px 0;
              }
              .print-text-top {
                font-weight: bold;
              }
              .print-text-bottom {
                color: #666;
              }
              .print-field {
                font-size: ${fontSize}px;
                margin: 3px 0;
              }
              .print-code {
                font-size: ${fontSize}px;
                font-weight: bold;
                margin: 10px 0;
              }
              .print-fields {
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="print-box">
              ${this.config.customTextTop ? `<div class="print-text print-text-top">${this.config.customTextTop}</div>` : ''}
              ${topFieldsHtml ? `<div class="print-fields">${topFieldsHtml}</div>` : ''}
              ${this.config.showQrcode ? `<img src="${qrCodeDataUrl}" alt="二维码">` : ''}
              <div class="print-code">${this.encodingPreview}</div>
              ${bottomFieldsHtml ? `<div class="print-fields">${bottomFieldsHtml}</div>` : ''}
              ${this.config.customTextBottom ? `<div class="print-text print-text-bottom">${this.config.customTextBottom}</div>` : ''}
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
    getFieldPreview(field) {
      if (field.format === 'abbreviation') return field.sampleAbbreviation
      if (field.format === 'both') return `${field.sampleAbbreviation}：${field.sampleValue}`
      return field.sampleValue
    },
    getFieldDisplayValue(field) {
      return this.getFieldPreview(field)
    },
    getFieldLabel(key) {
      const field = this.availableFields.find(f => f.key === key)
      return field ? field.label : key
    },
    addEncodingField() {
      if (this.newEncodingField && !this.config.encodingFields.includes(this.newEncodingField)) {
        this.config.encodingFields.push(this.newEncodingField)
        this.newEncodingField = ''
      }
    },
    removeEncodingField(index) {
      this.config.encodingFields.splice(index, 1)
    },
    handleLogout() {
      localStorage.removeItem('loggedIn')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.card {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.config-section {
  margin-bottom: 25px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.config-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

.section-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 150px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 5px;
}

.fields-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-config {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #eee;
}

.field-header {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.field-header label {
  flex: 1;
  min-width: 120px;
}

.position-select,
.format-select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.position-select:disabled,
.format-select:disabled {
  opacity: 0.5;
}

.field-preview {
  margin-top: 5px;
  font-size: 13px;
  color: #666;
}

.preview-value {
  font-family: monospace;
}

.encoding-config {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
}

.encoding-fields {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

.encoding-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.encoding-index {
  width: 25px;
  height: 25px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.encoding-field {
  flex: 1;
}

.btn-remove {
  width: 25px;
  height: 25px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.encoding-add {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.encoding-select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-add {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.encoding-preview {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.preview-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.preview-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.preview-box {
  background: white;
  border: 1px dashed #ccc;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.preview-text {
  font-size: 14px;
  margin: 10px 0;
}

.preview-text-top {
  font-weight: bold;
}

.preview-text-bottom {
  color: #666;
}

.preview-qrcode {
  margin: 10px 0;
}

.preview-code {
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
  margin: 10px 0;
}

.preview-fields {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin: 5px 0;
}

.preview-field-item {
  font-size: 12px;
  color: #666;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.save-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 1000;
}

.save-message.success {
  background: #28a745;
}

.save-message.error {
  background: #dc3545;
}
</style>