<template>
  <div class="card">
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
            <button class="btn btn-secondary" @click="deleteField(field.id)">删除</button>
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
      fields: []
    }
  },
  mounted() {
    this.loadFields()
  },
  methods: {
    async loadFields() {
      try {
        const response = await fetch('/api/barcodes/barcode-fields')
        this.fields = await response.json()
      } catch (error) {
        console.error('加载字段失败:', error)
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
    }
  }
}
</script>