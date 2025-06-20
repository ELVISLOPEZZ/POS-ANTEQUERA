<template>
  <div id="app">
    <header class="app-header" v-if="logueado">
      <h1 class="titulo-sistema">POS "OAXACA DE ANTEQUERA"</h1>

      <nav class="nav-botones">
        <button @click="irA('Caja')" :class="{ activo: vista === 'Caja' }">Caja</button>
        <button @click="irA('Creditos')" :class="{ activo: vista === 'Creditos' }">Creditos</button>
        <button v-if="rolUsuario === 'admin'"@click="irA('Inventario')" :class="{ activo: vista === 'Inventario' }">Inventario</button>
        <button v-if="rolUsuario === 'admin'"@click="irA('Reportes')" :class="{ activo: vista === 'Reportes' }">Reportes</button>
        <button v-if="rolUsuario === 'admin'"@click="irA('Administrador')" :class="{ activo: vista === 'Administrador' }">Administrador</button>
        <button @click="cerrarSesion" class="btn-logout">Cerrar sesión</button>
      </nav>
    </header>

    <main class="contenido">
      <router-view v-if="!logueado" @login-exitoso="onLoginExitoso" />
      
      <div v-else>
        <CajaView
          v-if="vista === 'Caja'"
          ref="cajaViewComponent"
          :sucursal="sucursalActual"
          @nueva-venta="agregarVenta"
        />
          <Creditosview
          v-if="vista === 'Creditos'"
          ref="creditosviewComponent"
          :sucursal="sucursalActual"
        />
        <InventarioView
          v-else-if="vista === 'Inventario'"
          :sucursal="sucursalActual"
        />
        <ReportesView
          v-else-if="vista === 'Reportes'"
          :ventas="ventas"
          :sucursal="sucursalActual"
        />
        <AdministradorView
        v-else-if="vista === 'Administrador'"
        />
      </div>
    </main>

    <!-- Modal de Confirmación de Cierre de Sesión -->
    <div v-if="mostrarAlerta" class="modal-overlay">
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

    <!-- Modal de Confirmación de Corte del Día -->
    <div v-if="mostrarCorteConfirmado" class="modal-overlay">
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
    AdministradorView,
  },
  data() {
    return {
      vista: 'Caja',
      ventas: [],
      logueado: false,
      mostrarAlerta: false,
      mostrarCorteConfirmado: false,
      sucursalActual: '',
      rolUsuario: ''
    }
  },
  methods: {
    irA(vista) {
      this.vista = vista
    },
    agregarVenta(nuevaVenta) {
      this.ventas.push(nuevaVenta)
    },
    cerrarSesion() {
      this.mostrarAlerta = true
    },
    confirmarCerrarSesion() {
      // Cierra caja sin alert
      if (this.$refs.cajaViewComponent?.cerrarCaja) {
        this.$refs.cajaViewComponent.cerrarCaja()
      }
      this.mostrarAlerta = false
      this.mostrarCorteConfirmado = true
    },
    finalizarCorte() {
      // Cerrar sesión después del corte
      logout()
      this.mostrarCorteConfirmado = false
      this.logueado = false
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
    }
  },
  created() {
    this.logueado = isLoggedIn()
    if (!this.logueado) {
      this.$router.push('/')
    } else {
      this.sucursalActual = localStorage.getItem('store_code') || ''
      this.rolUsuario = localStorage.getItem('rol_usuario') || ''
    }
  },
  watch: {
    '$route'() {
      this.logueado = isLoggedIn()
    }
  }
}
</script>


<style scoped>
/* === Reset === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html, #app {
  font-family: 'Segoe UI', sans-serif;
  background-color: #f7f7f7;
  min-height: 100vh;
}

/* === Header === */
.app-header {
  background: linear-gradient(135deg, #2196F3, #21CBF3);
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 4px solid #1976D2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.titulo-sistema {
  font-size: 2rem;
  color: rgb(11, 7, 0);
  font-weight: bold;
  margin-bottom: 1rem;
}

/* === Navegación === */
.nav-botones {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-botones button {
  padding: 0.6rem 1.2rem;
  background-color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #1565C0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
}

.nav-botones button:hover {
  background-color: #E3F2FD;
  transform: translateY(-2px);
}

.nav-botones button.activo {
  background-color: #1976D2;
  color: white;
}

/* === Botón logout === */
.btn-logout {
  background-color: #EF5350;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;
}

.btn-logout:hover {
  background-color: #C62828;
  transform: scale(1.05);
}

/* === Contenido principal === */
.contenido {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* === Modal === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(30, 30, 30, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-contenido {
  background: #ffffff;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.4s ease-in-out;
}

.modal-icono {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-titulo {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #e53935;
}

.modal-texto {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: #555;
}

.modal-botones {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-confirmar {
  padding: 0.5rem 1.2rem;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-confirmar:hover {
  background-color: #b71c1c;
}

.btn-cancelar {
  padding: 0.5rem 1.2rem;
  background-color: #9e9e9e;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-cancelar:hover {
  background-color: #616161;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
