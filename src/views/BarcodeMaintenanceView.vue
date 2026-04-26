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
        <button class="btn btn-primary" @click="addDropdownOption">添加选项</button>
      </div>

      <div v-if="selectedCategory" class="options-list">
        <h3>{{ getCategoryName(selectedCategory) }} - 选项列表</h3>
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

    <div class="card" style="margin-top: 20px;">
      <h2>条码字段维护</h2>
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
      <button class="btn btn-primary" @click="addField">添加字段</button>

      <h3>现有字段</h3>
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
    }
  }
}
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  margin: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.card h3 {
  margin: 20px 0 10px 0;
  color: #555;
  font-size: 16px;
}

.dropdown-section {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  min-width: 150px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.edit-input {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 150px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

table th,
table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #555;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 5px;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: #fff;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
}

.btn-danger:hover {
  background: #c82333;
}

.options-list {
  margin-top: 20px;
}
</style>
