<template>
  <div class="card">
      <h2>下拉选项维护</h2>
      <div class="dropdown-section">
        <div class="form-group">
          <label for="dropdownCategory">选项类别</label>
          <select id="dropdownCategory" v-model="selectedCategory">
            <option value="">选择类别</option>
            <option value="model">产品型号</option>
            <option value="production_line">生产线</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="dropdownValue">选项值</label>
            <input type="text" id="dropdownValue" v-model="newOption.value" placeholder="请输入选项值">
          </div>
          <div class="form-group">
            <label for="dropdownOrder">排序</label>
            <input type="number" id="dropdownOrder" v-model.number="newOption.displayOrder" placeholder="排序序号">
          </div>
        </div>
        <div class="button-group">
          <button class="btn btn-primary" @click="addDropdownOption">添加选项</button>
          <button class="btn btn-info" @click="exportDropdownOptions">导出选项</button>
          <input type="file" ref="dropdownFileInput" style="display: none" accept=".json" @change="importDropdownOptions">
          <button class="btn btn-success" @click="$refs.dropdownFileInput.click()">导入选项</button>
        </div>
      </div>

      <div v-if="selectedCategory" class="options-list">
        <h3>{{ getCategoryName(selectedCategory) }} - 选项列表</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>排序</th>
                <th>选项值</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="option in filteredOptions" :key="option.id">
                <td>{{ option.display_order }}</td>
                <td>
                  <span v-if="editingId !== option.id">{{ option.value }}</span>
                  <input v-else type="text" v-model="editValue" class="edit-input">
                </td>
                <td>
                  <button v-if="editingId !== option.id" class="btn btn-secondary" @click="startEdit(option)">编辑</button>
                  <button v-if="editingId === option.id" class="btn btn-primary" @click="saveEdit(option.id)">保存</button>
                  <button v-if="editingId === option.id" class="btn btn-secondary" @click="cancelEdit">取消</button>
                  <button v-if="editingId !== option.id" class="btn btn-danger" @click="deleteDropdownOption(option.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h2>编码字段维护</h2>
      <div class="form-group">
        <label for="fieldName">字段名称</label>
        <input type="text" id="fieldName" v-model="newField.name" placeholder="请输入字段名称">
      </div>
      <div class="form-group">
        <label for="fieldType">字段类型</label>
        <select id="fieldType" v-model="newField.type">
          <option value="text">文本</option>
          <option value="number">数字</option>
          <option value="date">日期</option>
        </select>
      </div>
      <div class="button-group">
        <button class="btn btn-primary" @click="addField">添加字段</button>
        <button class="btn btn-info" @click="exportFields">导出字段</button>
        <input type="file" ref="fieldsFileInput" style="display: none" accept=".json" @change="importFields">
        <button class="btn btn-success" @click="$refs.fieldsFileInput.click()">导入字段</button>
      </div>

      <h3>现有字段</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>字段名称</th>
              <th>字段类型</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in fields" :key="field.id">
              <td>{{ field.name }}</td>
              <td>{{ field.type === 'text' ? '文本' : field.type === 'number' ? '数字' : '日期' }}</td>
              <td>
                <button class="btn btn-danger" @click="deleteField(field.id)">删除</button>
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
      newField: {
        name: '',
        type: 'text'
      },
      fields: [],
      dropdownOptions: [],
      selectedCategory: '',
      newOption: {
        value: '',
        displayOrder: 0
      },
      editingId: null,
      editValue: ''
    }
  },
  computed: {
    filteredOptions() {
      if (!this.selectedCategory) return []
      return this.dropdownOptions.filter(opt => opt.category === this.selectedCategory)
    }
  },
  mounted() {
    this.loadFields()
    this.loadDropdownOptions()
  },
  methods: {
    getCategoryName(category) {
      const names = {
        'model': '产品型号',
        'production_line': '生产线'
      }
      return names[category] || category
    },
    async loadFields() {
      try {
        const response = await fetch('/api/barcodes/barcode-fields')
        this.fields = await response.json()
      } catch (error) {
        console.error('加载字段失败:', error)
      }
    },
    async loadDropdownOptions() {
      try {
        const response = await fetch('/api/barcodes/dropdown-options')
        this.dropdownOptions = await response.json()
      } catch (error) {
        console.error('加载下拉选项失败:', error)
      }
    },
    async addField() {
      if (!this.newField.name) {
        alert('请输入字段名称')
        return
      }

      try {
        const response = await fetch('/api/barcodes/barcode-fields', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newField)
        })

        if (response.ok) {
          await this.loadFields()
          this.newField = { name: '', type: 'text' }
        } else {
          alert('添加失败')
        }
      } catch (error) {
        console.error('添加字段失败:', error)
        alert('添加失败')
      }
    },
    async deleteField(id) {
      if (!confirm('确定要删除此字段吗？')) return

      try {
        const response = await fetch(`/api/barcodes/barcode-fields/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await this.loadFields()
        } else {
          alert('删除失败')
        }
      } catch (error) {
        console.error('删除字段失败:', error)
        alert('删除失败')
      }
    },
    async addDropdownOption() {
      if (!this.selectedCategory || !this.newOption.value) {
        alert('请选择类别并输入选项值')
        return
      }

      try {
        const response = await fetch('/api/barcodes/dropdown-options', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            category: this.selectedCategory,
            value: this.newOption.value,
            displayOrder: this.newOption.displayOrder || 0
          })
        })

        if (response.ok) {
          await this.loadDropdownOptions()
          this.newOption = { value: '', displayOrder: 0 }
        } else {
          const error = await response.json()
          alert(error.error || '添加失败')
        }
      } catch (error) {
        console.error('添加选项失败:', error)
        alert('添加失败')
      }
    },
    startEdit(option) {
      this.editingId = option.id
      this.editValue = option.value
    },
    cancelEdit() {
      this.editingId = null
      this.editValue = ''
    },
    async saveEdit(id) {
      if (!this.editValue) {
        alert('选项值不能为空')
        return
      }

      try {
        const option = this.dropdownOptions.find(opt => opt.id === id)
        const response = await fetch(`/api/barcodes/dropdown-options/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: this.editValue,
            displayOrder: option.display_order
          })
        })

        if (response.ok) {
          await this.loadDropdownOptions()
          this.editingId = null
          this.editValue = ''
        } else {
          alert('更新失败')
        }
      } catch (error) {
        console.error('更新选项失败:', error)
        alert('更新失败')
      }
    },
    async deleteDropdownOption(id) {
      if (!confirm('确定要删除此选项吗？')) return

      try {
        const response = await fetch(`/api/barcodes/dropdown-options/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await this.loadDropdownOptions()
        } else {
          alert('删除失败')
        }
      } catch (error) {
        console.error('删除选项失败:', error)
        alert('删除失败')
      }
    },
    exportDropdownOptions() {
      const data = {
        options: this.dropdownOptions,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dropdown-options-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    async importDropdownOptions(event) {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result)
            const options = data.options || []
            
            if (options.length === 0) {
              alert('导入文件中没有选项数据')
              return
            }
            
            if (confirm(`确定要导入 ${options.length} 个选项吗？这将覆盖现有数据。`)) {
              // 先删除所有现有选项
              for (const option of this.dropdownOptions) {
                try {
                  await fetch(`/api/barcodes/dropdown-options/${option.id}`, {
                    method: 'DELETE'
                  })
                } catch (error) {
                  console.error('删除选项失败:', error)
                }
              }
              
              // 导入新选项
              let successCount = 0
              for (const option of options) {
                try {
                  const response = await fetch('/api/barcodes/dropdown-options', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      category: option.category,
                      value: option.value,
                      displayOrder: option.display_order || option.displayOrder || 0
                    })
                  })
                  
                  if (response.ok) {
                    successCount++
                  }
                } catch (error) {
                  console.error('导入选项失败:', error)
                }
              }
              
              await this.loadDropdownOptions()
              alert(`导入完成！成功导入 ${successCount} 个选项`)
            }
          } catch (error) {
            console.error('解析文件失败:', error)
            alert('导入文件格式错误，请确保是有效的JSON文件')
          }
        }
        reader.readAsText(file)
      } catch (error) {
        console.error('导入失败:', error)
        alert('导入失败')
      }
      
      // 重置文件输入
      event.target.value = ''
    },
    exportFields() {
      const data = {
        fields: this.fields,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `barcode-fields-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    async importFields(event) {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result)
            const fields = data.fields || []
            
            if (fields.length === 0) {
              alert('导入文件中没有字段数据')
              return
            }
            
            if (confirm(`确定要导入 ${fields.length} 个字段吗？这将覆盖现有数据。`)) {
              // 先删除所有现有字段
              for (const field of this.fields) {
                try {
                  await fetch(`/api/barcodes/barcode-fields/${field.id}`, {
                    method: 'DELETE'
                  })
                } catch (error) {
                  console.error('删除字段失败:', error)
                }
              }
              
              // 导入新字段
              let successCount = 0
              for (const field of fields) {
                try {
                  const response = await fetch('/api/barcodes/barcode-fields', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      name: field.name,
                      type: field.type
                    })
                  })
                  
                  if (response.ok) {
                    successCount++
                  }
                } catch (error) {
                  console.error('导入字段失败:', error)
                }
              }
              
              await this.loadFields()
              alert(`导入完成！成功导入 ${successCount} 个字段`)
            }
          } catch (error) {
            console.error('解析文件失败:', error)
            alert('导入文件格式错误，请确保是有效的JSON文件')
          }
        }
        reader.readAsText(file)
      } catch (error) {
        console.error('导入失败:', error)
        alert('导入失败')
      }
      
      // 重置文件输入
      event.target.value = ''
    }
  }
}
</script>
