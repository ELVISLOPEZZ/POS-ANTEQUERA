import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import CajaView from '../views/CajaView.vue'
import Creditosview from '../views/Creditosview.vue'
import InventarioView from '../views/InventarioView.vue'
import ReportesView from '../views/ReportesView.vue'
import AdministradorView from '../views/AdministradorView.vue'
import { isLoggedIn } from '../auth.js'

const routes = [
  { path: '/', name: 'Login', component: LoginView },

  {
    path: '/caja',
    name: 'Caja',
    component: CajaView,
    meta: { requiresAuth: true }
  },
  {
    path: '/creditos',
    name: 'Creditos',
    component: Creditosview,
    meta: { requiresAuth: true }
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: InventarioView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: ReportesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/administrador',
    name: 'Administrador',
    component: AdministradorView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Redirección automática si no está logueado
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/')
  } else {
    next()
  }
})

export default router
