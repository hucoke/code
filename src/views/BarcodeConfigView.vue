<template>
  <div class="config-page">
    <h2>页面配置</h2>
    
    <div class="config-main">
      <div class="config-left">
        <div class="config-section">
          <h3>二维码内容配置</h3>
          
          <div class="subsection">
            <label class="section-label">编码组成字段</label>
            <div class="encoding-fields">
              <div v-for="(field, index) in config.encodingFields" :key="field.key" class="encoding-item">
                <span class="encoding-index">{{ index + 1 }}</span>
                <span class="encoding-field">{{ getFieldLabel(field.key) }}</span>
                <select v-model="field.format" class="encoding-format">
                  <option value="abbreviation">缩写</option>
                  <option value="value">值</option>
                  <option value="both">缩写：值</option>
                </select>
                <button @click="removeEncodingField(index)" class="btn-remove">×</button>
              </div>
            </div>
            <div class="encoding-add">
              <select v-model="newEncodingField.key" class="encoding-select">
                <option value="">添加字段</option>
                <option v-for="f in availableFields" :key="f.key" :value="f.key">
                  {{ f.label }}
                </option>
              </select>
              <select v-model="newEncodingField.format" class="encoding-format">
                <option value="abbreviation">缩写</option>
                <option value="value">值</option>
                <option value="both">缩写：值</option>
              </select>
              <button @click="addEncodingField" class="btn-add">+</button>
            </div>
            <div class="encoding-preview">
              <span class="preview-label">编码预览：</span>
              <span class="preview-code">{{ encodingPreview }}</span>
            </div>
          </div>
          
          <div class="subsection">
            <label class="section-label">字段显示配置</label>
            <div class="fields-grid">
              <div v-for="field in availableFields" :key="field.key" class="field-item">
                <label class="field-checkbox">
                  <input type="checkbox" v-model="field.visible">
                  {{ field.label }}
                </label>
                <select v-model="field.position" :disabled="!field.visible" class="field-position">
                  <option value="left">左侧</option>
                  <option value="top">上方</option>
                  <option value="bottom">下方</option>
                  <option value="hidden">不显示</option>
                </select>
                <select v-model="field.format" :disabled="!field.visible" class="field-format">
                  <option value="value">值</option>
                  <option value="abbreviation">缩写</option>
                  <option value="both">缩写：值</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="config-section">
          <h3>页面尺寸配置</h3>
          
          <div class="form-grid">
            <div class="form-item">
              <label>页面宽度 (mm)</label>
              <input type="number" v-model="config.printWidth" min="50" max="200" class="form-input">
            </div>
            <div class="form-item">
              <label>页面高度 (mm)</label>
              <input type="number" v-model="config.printHeight" min="50" max="200" class="form-input">
            </div>
            <div class="form-item">
              <label>内边距 (mm)</label>
              <input type="number" v-model="config.printPadding" min="0" max="20" class="form-input">
            </div>
            <div class="form-item">
              <label>二维码大小 (px)</label>
              <input type="number" v-model="config.qrcodeSize" min="100" max="300" class="form-input">
            </div>
          </div>
        </div>

        <div class="config-section">
          <h3>字体配置</h3>
          
          <div class="form-grid">
            <div class="form-item">
              <label>字体大小 (px)</label>
              <input type="number" v-model="config.fontSize" min="8" max="24" class="form-input">
            </div>
            <div class="form-item">
              <label>字重</label>
              <select v-model="config.fontWeight" class="form-input">
                <option value="normal">正常</option>
                <option value="bold">粗体</option>
              </select>
            </div>
            <div class="form-item">
              <label>自定义顶部文本</label>
              <input type="text" v-model="config.customTextTop" placeholder="顶部文本" class="form-input">
            </div>
            <div class="form-item">
              <label>自定义底部文本</label>
              <input type="text" v-model="config.customTextBottom" placeholder="底部文本" class="form-input">
            </div>
          </div>
        </div>

        <div class="button-group">
          <button class="btn btn-primary" @click="saveConfig">保存配置</button>
          <button class="btn btn-secondary" @click="resetConfig">重置</button>
          <button class="btn btn-secondary" @click="printPreview">打印预览</button>
        </div>
      </div>

      <div class="config-right">
        <div class="preview-section">
          <h3>实时预览</h3>
          <div class="preview-container">
            <div class="preview-box" :style="previewStyle">
              <div v-if="config.customTextTop" class="preview-text preview-text-top">{{ config.customTextTop }}</div>
              
              <div class="preview-content">
                <div class="preview-left-fields" v-if="leftFields.length > 0">
                  <div v-for="field in leftFields" :key="field.key" class="preview-left-item">
                    {{ getFieldDisplayValue(field) }}
                  </div>
                </div>
                
                <div class="preview-qrcode" v-if="config.showQrcode">
                  <canvas ref="previewCanvas"></canvas>
                </div>
              </div>
              
              <div class="preview-code">{{ encodingPreview }}</div>
              
              <div class="preview-fields-bottom">
                <span v-for="field in bottomFields" :key="field.key" class="preview-field-item">
                  {{ getFieldDisplayValue(field) }}
                </span>
              </div>
              
              <div v-if="config.customTextBottom" class="preview-text preview-text-bottom">{{ config.customTextBottom }}</div>
            </div>
          </div>
        </div>
      </div>
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
        qrcodeSize: '120',
        showQrcode: true,
        fontSize: '10',
        fontWeight: 'normal',
        customTextTop: '',
        customTextBottom: '',
        encodingFields: [
          { key: 'supplier', format: 'abbreviation' },
          { key: 'model', format: 'abbreviation' },
          { key: 'productionDate', format: 'abbreviation' },
          { key: 'sequence', format: 'value' }
        ]
      },
      newEncodingField: { key: '', format: 'abbreviation' },
      availableFields: [
        { key: 'supplier', label: '供应商', visible: true, position: 'left', format: 'abbreviation', sampleValue: '供应商A', sampleAbbreviation: 'SA' },
        { key: 'productionLine', label: '生产线', visible: true, position: 'left', format: 'abbreviation', sampleValue: 'LINE-A', sampleAbbreviation: 'LA' },
        { key: 'model', label: '产品型号', visible: true, position: 'top', format: 'abbreviation', sampleValue: 'PET-500ml', sampleAbbreviation: 'P500' },
        { key: 'rawMaterial', label: '原料名称', visible: false, position: 'bottom', format: 'value', sampleValue: 'PET原料', sampleAbbreviation: 'PET' },
        { key: 'productionDate', label: '生产日期', visible: true, position: 'bottom', format: 'value', sampleValue: '2026-04-28', sampleAbbreviation: '260428' },
        { key: 'sequence', label: '序号', visible: true, position: 'bottom', format: 'value', sampleValue: '0001', sampleAbbreviation: '0001' },
        { key: 'batchCode', label: '批次号', visible: false, position: 'bottom', format: 'value', sampleValue: 'B260428P500001', sampleAbbreviation: 'B260428' },
        { key: 'currentTime', label: '时间', visible: false, position: 'bottom', format: 'value', sampleValue: '14:30', sampleAbbreviation: '1430' }
      ],
      saveMessage: null
    }
  },
  computed: {
    previewStyle() {
      return {
        width: `${parseInt(this.config.printWidth) + 10}px`,
        minHeight: `${parseInt(this.config.printHeight) + 10}px`,
        padding: `${this.config.printPadding}px`
      }
    },
    encodingPreview() {
      return this.config.encodingFields.map(fieldObj => {
        const field = this.availableFields.find(f => f.key === fieldObj.key)
        const format = fieldObj.format || 'abbreviation'
        if (field) {
          if (format === 'abbreviation') return field.sampleAbbreviation
          if (format === 'both') return `${field.sampleAbbreviation}:${field.sampleValue}`
          return field.sampleValue
        }
        return fieldObj.key
      }).join('')
    },
    leftFields() {
      return this.availableFields.filter(f => f.visible && f.position === 'left')
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

      try {
        await QRCode.toCanvas(this.$refs.previewCanvas, this.encodingPreview, {
          width: qrcodeSize,
          margin: 1
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
        qrcodeSize: '120',
        showQrcode: true,
        fontSize: '10',
        fontWeight: 'normal',
        customTextTop: '',
        customTextBottom: '',
        encodingFields: [
          { key: 'supplier', format: 'abbreviation' },
          { key: 'model', format: 'abbreviation' },
          { key: 'productionDate', format: 'abbreviation' },
          { key: 'sequence', format: 'value' }
        ]
      }
      this.availableFields = [
        { key: 'supplier', label: '供应商', visible: true, position: 'left', format: 'abbreviation', sampleValue: '供应商A', sampleAbbreviation: 'SA' },
        { key: 'productionLine', label: '生产线', visible: true, position: 'left', format: 'abbreviation', sampleValue: 'LINE-A', sampleAbbreviation: 'LA' },
        { key: 'model', label: '产品型号', visible: true, position: 'top', format: 'abbreviation', sampleValue: 'PET-500ml', sampleAbbreviation: 'P500' },
        { key: 'rawMaterial', label: '原料名称', visible: false, position: 'bottom', format: 'value', sampleValue: 'PET原料', sampleAbbreviation: 'PET' },
        { key: 'productionDate', label: '生产日期', visible: true, position: 'bottom', format: 'value', sampleValue: '2026-04-28', sampleAbbreviation: '260428' },
        { key: 'sequence', label: '序号', visible: true, position: 'bottom', format: 'value', sampleValue: '0001', sampleAbbreviation: '0001' },
        { key: 'batchCode', label: '批次号', visible: false, position: 'bottom', format: 'value', sampleValue: 'B260428P500001', sampleAbbreviation: 'B260428' },
        { key: 'currentTime', label: '时间', visible: false, position: 'bottom', format: 'value', sampleValue: '14:30', sampleAbbreviation: '1430' }
      ]
      this.$nextTick(() => {
        this.updatePreview()
      })
    },
    async printPreview() {
      const printWindow = window.open('', '_blank')
      const qrcodeSize = parseInt(this.config.qrcodeSize)
      const fontSize = parseInt(this.config.fontSize)

      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, this.encodingPreview, {
        width: qrcodeSize,
        margin: 1
      })
      
      const qrCodeDataUrl = canvas.toDataURL('image/png')

      const leftFieldsHtml = this.leftFields.map(field => 
        `<div class="print-left-item">${this.getFieldDisplayValue(field)}</div>`
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
              body { margin: 0; padding: ${this.config.printPadding}mm; font-family: Arial, sans-serif; }
              .print-box { 
                width: ${this.config.printWidth}mm; 
                min-height: ${this.config.printHeight}mm; 
                padding: ${this.config.printPadding}mm;
                border: 1px dashed #ccc;
                display: flex;
                flex-direction: column;
              }
              .print-text { font-size: ${fontSize}px; font-weight: ${this.config.fontWeight}; margin: 2px 0; }
              .print-content { display: flex; align-items: center; gap: 5mm; }
              .print-left { display: flex; flex-direction: column; }
              .print-left-item { font-size: ${fontSize - 2}px; white-space: nowrap; }
              .print-qrcode img { max-width: ${qrcodeSize}px; height: auto; }
              .print-code { font-size: ${fontSize}px; font-weight: bold; margin: 5px 0; }
              .print-fields { display: flex; flex-wrap: wrap; gap: 8px; margin: 5px 0; }
              .print-field { font-size: ${fontSize - 2}px; }
            </style>
          </head>
          <body>
            <div class="print-box">
              ${this.config.customTextTop ? `<div class="print-text">${this.config.customTextTop}</div>` : ''}
              <div class="print-content">
                ${leftFieldsHtml ? `<div class="print-left">${leftFieldsHtml}</div>` : ''}
                <div class="print-qrcode"><img src="${qrCodeDataUrl}" alt="二维码"></div>
              </div>
              <div class="print-code">${this.encodingPreview}</div>
              ${bottomFieldsHtml ? `<div class="print-fields">${bottomFieldsHtml}</div>` : ''}
              ${this.config.customTextBottom ? `<div class="print-text">${this.config.customTextBottom}</div>` : ''}
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
      if (this.newEncodingField.key && !this.config.encodingFields.find(f => f.key === this.newEncodingField.key)) {
        this.config.encodingFields.push({ ...this.newEncodingField })
        this.newEncodingField = { key: '', format: 'abbreviation' }
      }
    },
    removeEncodingField(index) {
      this.config.encodingFields.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.config-page {
  font-size: 12px;
  padding: 15px;
  max-width: 1200px;
  margin: 0 auto;
}

.config-page h2 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.config-main {
  display: flex;
  gap: 20px;
}

.config-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.config-right {
  width: 350px;
  flex-shrink: 0;
}

.config-section {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 12px;
}

.config-section h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #007bff;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.subsection {
  margin-bottom: 12px;
}

.subsection:last-child {
  margin-bottom: 0;
}

.section-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
}

.encoding-fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.encoding-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: white;
  border-radius: 4px;
  border: 1px solid #eee;
}

.encoding-index {
  width: 20px;
  height: 20px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.encoding-field {
  flex: 1;
  font-size: 12px;
}

.btn-remove {
  width: 20px;
  height: 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.encoding-add {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.encoding-select {
  flex: 1;
  padding: 5px;
  font-size: 11px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.encoding-format {
  padding: 5px;
  font-size: 11px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 80px;
}

.btn-add {
  padding: 5px 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.encoding-preview {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
}

.preview-label {
  display: block;
  margin-bottom: 3px;
  font-weight: 500;
}

.preview-code {
  word-break: break-all;
}

.fields-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
  background: white;
  border-radius: 4px;
}

.field-checkbox {
  flex: 1;
  font-size: 11px;
  cursor: pointer;
}

.field-checkbox input {
  margin-right: 5px;
}

.field-position,
.field-format {
  padding: 3px 6px;
  font-size: 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.field-position:disabled,
.field-format:disabled {
  opacity: 0.5;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.form-item label {
  font-size: 11px;
  font-weight: 500;
}

.form-input {
  padding: 5px;
  font-size: 11px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.preview-section {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 12px;
}

.preview-section h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #007bff;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.preview-container {
  display: flex;
  justify-content: center;
}

.preview-box {
  background: white;
  border: 1px dashed #ccc;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
}

.preview-text {
  font-size: 11px;
  margin: 3px 0;
}

.preview-text-top {
  font-weight: bold;
}

.preview-text-bottom {
  color: #666;
}

.preview-content {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 5px 0;
}

.preview-left-fields {
  display: flex;
  flex-direction: column;
}

.preview-left-item {
  font-size: 10px;
  white-space: nowrap;
}

.preview-qrcode {
  margin: 5px 0;
}

.preview-code {
  font-family: monospace;
  font-size: 10px;
  font-weight: bold;
  margin: 5px 0;
}

.preview-fields-bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin: 3px 0;
}

.preview-field-item {
  font-size: 10px;
  color: #666;
}

.save-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 15px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
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