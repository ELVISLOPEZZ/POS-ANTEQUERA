<template>
  <div id="app">
    <header class="app-header" v-if="logueado">
      <div class="header-top">
        <h1 class="titulo-sistema">POS "OAXACA DE ANTEQUERA"</h1>
        <button class="menu-toggle" @click="menuAbierto = !menuAbierto">
          <span :class="{ abierto: menuAbierto }">☰</span>
        </button>
      </div>

      <!-- Menú toggle -->
      <transition name="slide">
        <nav v-show="menuAbierto || anchoPantalla >= 769" class="nav-botones">
          <button @click="irA('Caja')" :class="{ activo: vista === 'Caja' }">Caja</button>
          <button @click="irA('Creditos')" :class="{ activo: vista === 'Creditos' }">Créditos</button>
          <button @click="irA('Inventario')" :class="{ activo: vista === 'Inventario' }">Inventario</button>
          <button v-if="rolUsuario === 'admin'" @click="irA('Reportes')" :class="{ activo: vista === 'Reportes' }">Reportes</button>
          <button v-if="rolUsuario === 'admin'" @click="irA('Administrador')" :class="{ activo: vista === 'Administrador' }">Administrador</button>
          <button @click="cerrarSesion" class="btn-logout">Cerrar sesión</button>
        </nav>
      </transition>
    </header>

    <main class="contenido">
      <router-view v-if="!logueado" @login-exitoso="onLoginExitoso" />
      <div v-else>
        <CajaView v-if="vista === 'Caja'" ref="cajaViewComponent" :sucursal="sucursalActual" @nueva-venta="agregarVenta" />
        <Creditosview v-if="vista === 'Creditos'" ref="creditosviewComponent" :sucursal="sucursalActual" />
        <InventarioView v-if="vista === 'Inventario'" :sucursal="sucursalActual" />
        <ReportesView v-if="vista === 'Reportes'" :ventas="ventas" :sucursal="sucursalActual" />
        <AdministradorView v-if="vista === 'Administrador'" />
      </div>
    </main>

    <!-- Modales -->
    <div v-if="mostrarAlerta" class="modal-overlay" @click.self="cancelarCerrarSesion">
      <div class="modal-contenido">
        <div class="modal-icono">⚠️</div>
        <h2 class="modal-titulo">¿Cerrar sesión?</h2>
        <p class="modal-texto">¿Estás seguro de que deseas cerrar sesión?</p>
        <div class="modal-botones">
          <button @click="confirmarCerrarSesion" class="btn-confirmar">Sí, cerrar</button>
          <button @click="cancelarCerrarSesion" class="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>

    <div v-if="mostrarCorteConfirmado" class="modal-overlay" @click.self="finalizarCorte">
      <div class="modal-contenido">
        <div class="modal-icono">✅</div>
        <h2 class="modal-titulo">¡Corte del día realizado!</h2>
        <p class="modal-texto">Se guardaron los datos del día correctamente.</p>
        <div class="modal-botones">
          <button @click="finalizarCorte" class="btn-confirmar">Aceptar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CajaView from './views/CajaView.vue'
import Creditosview from './views/Creditosview.vue'
import InventarioView from './views/InventarioView.vue'
import ReportesView from './views/ReportesView.vue'
import AdministradorView from './views/AdministradorView.vue'
import { logout, isLoggedIn } from './auth.js'

export default {
  name: 'App',
  components: {
    CajaView,
    Creditosview,
    InventarioView,
    ReportesView,
    AdministradorView
  },
  data() {
    return {
      vista: 'Caja',
      ventas: JSON.parse(localStorage.getItem('ventas_realizadas')) || [],
      logueado: false,
      mostrarAlerta: false,
      mostrarCorteConfirmado: false,
      sucursalActual: '',
      rolUsuario: '',
      menuAbierto: false,
      anchoPantalla: window.innerWidth
    }
  },
  methods: {
    irA(vista) {
      this.vista = vista
      if (this.anchoPantalla < 769) this.menuAbierto = false
    },
    agregarVenta(nuevaVenta) {
      this.ventas.push(nuevaVenta)
      localStorage.setItem('ventas_realizadas', JSON.stringify(this.ventas))
    },
    cerrarSesion() {
      this.mostrarAlerta = true
    },
    confirmarCerrarSesion() {
      this.$refs.cajaViewComponent?.cerrarCaja?.()
      this.mostrarAlerta = false
      this.mostrarCorteConfirmado = true
    },
    finalizarCorte() {
      logout()
      this.logueado = false
      this.mostrarCorteConfirmado = false
      this.sucursalActual = ''
      this.rolUsuario = ''
      localStorage.removeItem('store_code')
      localStorage.removeItem('rol_usuario')
      this.$router.push('/')
    },
    cancelarCerrarSesion() {
      this.mostrarAlerta = false
    },
    onLoginExitoso(usuario) {
      this.logueado = true
      this.sucursalActual = localStorage.getItem('store_code') || ''
      this.rolUsuario = usuario.rol || ''
      this.vista = 'Caja'
      this.$router.push('/caja')
    },
    actualizarAnchoPantalla() {
      this.anchoPantalla = window.innerWidth
      if (this.anchoPantalla >= 769) this.menuAbierto = false
    }
  },
  created() {
    this.logueado = isLoggedIn()
    if (!this.logueado) this.$router.push('/')
    else {
      this.sucursalActual = localStorage.getItem('store_code') || ''
      this.rolUsuario = localStorage.getItem('rol_usuario') || ''
    }

    window.addEventListener('resize', this.actualizarAnchoPantalla)
  },
  unmounted() {
    window.removeEventListener('resize', this.actualizarAnchoPantalla)
  }
}
</script>

<style scoped>
/* RESET */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html, #app {
  font-family: 'Poppins', sans-serif;
  background-color: #f3f8f5;
  min-height: 100vh;
}

/* HEADER */
.app-header {
  background: linear-gradient(135deg, #d7ccc8, #efebe9);
  padding: 1rem 1.5rem;
  border-bottom: 3px solid #bcaaa4;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.08);
  border-radius: 0 0 16px 16px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.titulo-sistema {
  font-size: 1.9rem;
  color: #4e342e;
  font-weight: bold;
}

/* MENU TOGGLE */
.menu-toggle {
  background: none;
  border: none;
  font-size: 2rem;
  color: #4e342e;
  cursor: pointer;
  display: none;
}
.menu-toggle span.abierto {
  transform: rotate(90deg);
}

/* NAV BOTONES */
.nav-botones {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1rem;
}

.nav-botones button {
  padding: 0.6rem 1.2rem;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 2px solid transparent;
  background-color: #fff6ec;
  color: #4e342e;
  transition: all 0.3s ease;
}
.nav-botones button:nth-child(1)::before { content: "💵"; }
.nav-botones button:nth-child(2)::before { content: "🧾"; }
.nav-botones button:nth-child(3)::before { content: "📦"; }
.nav-botones button:nth-child(4)::before { content: "📊"; }
.nav-botones button:nth-child(5)::before { content: "👤"; }

.nav-botones button:hover {
  background-color: #ffe0b2;
}
.nav-botones button.activo {
  background-color: #a5d6a7;
  color: #1b5e20;
  border-color: #81c784;
}

/* BOTÓN CERRAR SESIÓN */
.btn-logout {
  background-color: #ef9a9a;
  color: #fff;
}
.btn-logout::before {
  content: "🔓";
}
.btn-logout:hover {
  background-color: #c62828;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
  .nav-botones {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }
}

/* TRANSICIÓN SLIDE */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* CONTENIDO */
.contenido {
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
}

/* MODALES (igual que antes) */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(40, 30, 20, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-contenido {
  background-color: #fff9f4;
  border: 2px solid #e0cfc2;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 0 30px rgba(0,0,0,0.2);
}

.modal-icono {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.modal-titulo {
  font-size: 1.6rem;
  font-weight: bold;
  color: #bf360c;
  margin-bottom: 0.6rem;
}
.modal-texto {
  color: #5d4037;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}
.modal-botones {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.btn-confirmar, .btn-cancelar {
  padding: 0.6rem 1.4rem;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
.btn-confirmar {
  background-color: #4caf50;
  color: white;
}
.btn-cancelar {
  background-color: #90a4ae;
  color: white;
}
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .menu-lateral {
    position: fixed;
    top: 80px;
    right: 0;
    width: 240px;
    background: #fff6ec;
    box-shadow: -4px 0 12px rgba(0,0,0,0.1);
    border-left: 2px solid #bcaaa4;
    padding: 1rem;
    z-index: 1001;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    border-radius: 12px 0 0 12px;
  }
}

/* Animación slide desde la derecha */
.slide-right-enter-active, .slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-right-enter-from, .slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
