import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import CajaView from '../views/CajaView.vue'
import { isLoggedIn } from '../auth.js'

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  {
    path: '/caja',
    name: 'Caja',
    component: CajaView,
    meta: { requiresAuth: true }
  },
  // Agrega otras rutas protegidas si tienes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ Redirección automática si no está logueado
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/')
  } else {
    next()
  }
})



export default router
