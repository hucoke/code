import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      children: [
        {
          path: 'barcode-maintenance',
          name: 'barcodeMaintenance',
          component: () => import('../views/BarcodeMaintenanceView.vue')
        },
        {
          path: 'barcode-config',
          name: 'barcodeConfig',
          component: () => import('../views/BarcodeConfigView.vue')
        },
        {
          path: 'status-view',
          name: 'statusView',
          component: () => import('../views/StatusView.vue')
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: () => import('../views/StatisticsView.vue')
        }
      ]
    },
    {
      path: '/production',
      name: 'production',
      component: () => import('../views/ProductionView.vue')
    },
    {
      path: '/delivery',
      name: 'delivery',
      component: () => import('../views/DeliveryView.vue')
    },
    {
      path: '/receiving',
      name: 'receiving',
      component: () => import('../views/ReceivingView.vue')
    },
    {
      path: '/usage',
      name: 'usage',
      component: () => import('../views/UsageView.vue')
    }
  ]
})

export default router