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
      <h2>使用管理 - 扫码使用</h2>
      <div class="scan-area">
        <h3>请扫描瓶胚框上的编码</h3>
        <div class="form-group">
          <input type="text" v-model="scannedBarcode" placeholder="或手动输入编码" @keyup.enter="processUsage">
        </div>
        <div class="button-group">
          <button class="btn btn-primary" @click="startScanner" :disabled="scannerActive">
            {{ scannerActive ? '扫码中...' : '摄像头扫码' }}
          </button>
          <button class="btn btn-primary" @click="processUsage" :disabled="loading">确认使用</button>
        </div>
      </div>

      <div v-if="usageResult" class="card" style="margin-top: 20px;">
        <h3>使用结果</h3>
        <p v-if="usageResult.success" style="color: green;">
          编码 {{ usageResult.barcode }} 使用成功！
        </p>
        <p v-else style="color: red;">
          {{ usageResult.message }}
        </p>
      </div>

      <h3>今日使用记录</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>编码</th>
              <th>产品型号</th>
              <th>使用日期</th>
              <th>使用时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in usageRecords" :key="record.barcode_code">
              <td>{{ record.barcode_code }}</td>
              <td>{{ record.model }}</td>
              <td>{{ record.use_date }}</td>
              <td>{{ record.use_time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showScannerModal" class="modal-overlay">
      <div class="modal scanner-modal">
        <div class="modal-header">
          <h3>摄像头扫码</h3>
          <button class="close-btn" @click="stopScanner">&times;</button>
        </div>
        <div id="scanner-region" class="scanner-region"></div>
        <p class="scanner-hint">将编码对准摄像头进行扫描</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Html5Qrcode } from 'html5-qrcode'

export default {
  data() {
    return {
      scannedBarcode: '',
      usageResult: null,
      usageRecords: [],
      loading: false,
      showScannerModal: false,
      scannerActive: false,
      html5QrCode: null
    }
  },
  mounted() {
    this.loadUsageRecords()
  },
  beforeUnmount() {
    this.stopScanner()
  },
  methods: {
    async loadUsageRecords() {
      try {
        const response = await fetch('/api/barcodes/usage-records')
        this.usageRecords = await response.json()
      } catch (error) {
        console.error('加载使用记录失败:', error)
      }
    },
    handleLogout() {
      localStorage.removeItem('loggedIn')
      this.$router.push('/')
    },
    async startScanner() {
      try {
        // 检查是否使用HTTPS
        if (window.location.protocol !== 'https:') {
          alert('摄像头功能需要在HTTPS安全连接下使用，请使用HTTPS访问本网站')
          this.stopScanner()
          return
        }
        
        // 检查浏览器是否支持摄像头
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('您的浏览器不支持摄像头功能，请使用现代浏览器如Chrome、Firefox或Edge')
          this.stopScanner()
          return
        }
        
        this.showScannerModal = true
        this.scannerActive = true
        
        // 等待DOM更新，确保scanner-region元素已渲染
        await this.$nextTick()
        
        this.html5QrCode = new Html5Qrcode('scanner-region')
        
        // 尝试多种摄像头模式，确保在不同环境下都能工作
        let scannerStarted = false
        const cameraModes = [
          { facingMode: 'environment' },
          { facingMode: 'user' },
          undefined
        ]
        
        for (const mode of cameraModes) {
          try {
            console.log('尝试启动扫码器，模式:', mode)
            await this.html5QrCode.start(
              mode,
              {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.777778
              },
              (decodedText) => {
                this.scannedBarcode = decodedText
                this.stopScanner()
                this.processUsage()
              },
              (errorMessage) => {
                console.log('扫码中...')
              }
            )
            scannerStarted = true
            break
          } catch (scannerError) {
            console.log('扫码器启动失败，尝试下一个模式:', scannerError)
            // 清理之前的尝试
            if (this.html5QrCode) {
              try {
                await this.html5QrCode.stop()
              } catch (e) {}
              this.html5QrCode = new Html5Qrcode('scanner-region')
            }
          }
        }
        
        if (!scannerStarted) {
          throw new Error('所有摄像头模式都失败')
        }
        
      } catch (err) {
        console.error('无法启动摄像头:', err)
        let errorMessage = '无法访问摄像头'
        
        if (err.name === 'NotAllowedError') {
          errorMessage = '摄像头权限被拒绝，请在浏览器设置中允许使用摄像头。\n\n操作步骤：\n1. 点击浏览器地址栏左侧的锁图标\n2. 在权限设置中允许摄像头访问\n3. 刷新页面后重试'
        } else if (err.name === 'NotFoundError') {
          errorMessage = '未找到摄像头设备，请确保您的设备有摄像头并已正确连接'
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = '摄像头约束不满足，尝试使用其他摄像头'
        } else if (err.message.includes('browser does not support')) {
          errorMessage = '浏览器不支持摄像头功能，请使用现代浏览器如Chrome、Firefox或Edge'
        }
        
        alert(errorMessage + '\n\n错误详情: ' + (err.message || err))
        this.stopScanner()
      }
    },
    async stopScanner() {
      this.showScannerModal = false
      this.scannerActive = false
      
      if (this.html5QrCode) {
        try {
          await this.html5QrCode.stop()
          this.html5QrCode = null
        } catch (err) {
          console.error('停止扫码器失败:', err)
        }
      }
    },
    async processUsage() {
      if (!this.scannedBarcode) {
        this.usageResult = {
          success: false,
          message: '请输入编码'
        }
        return
      }

      this.loading = true
      try {
        const now = new Date()
        const useDate = now.toISOString().split('T')[0]
        const useTime = now.toTimeString().substring(0, 5)

        const response = await fetch('/api/barcodes/usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            barcodeCode: this.scannedBarcode,
            useDate,
            useTime
          })
        })

        const result = await response.json()

        if (response.ok) {
          this.usageResult = {
            success: true,
            barcode: this.scannedBarcode,
            message: '使用成功'
          }
          await this.loadUsageRecords()
        } else {
          this.usageResult = {
            success: false,
            message: result.error || '使用失败'
          }
        }
      } catch (error) {
        console.error('使用失败:', error)
        this.usageResult = {
          success: false,
          message: '使用失败，请检查网络连接'
        }
      } finally {
        this.loading = false
        this.scannedBarcode = ''
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.scanner-modal {
  background-color: white;
  border-radius: 8px;
  width: 350px;
  max-width: 90%;
  text-align: center;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ddd;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.scanner-region {
  width: 100%;
  min-height: 200px;
  margin: 15px 0;
}

.scanner-hint {
  padding: 10px;
  color: #666;
  font-size: 14px;
}
</style>