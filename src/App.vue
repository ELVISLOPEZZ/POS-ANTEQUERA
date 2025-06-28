<template>
  <div id="app">
    <header class="app-header" v-if="logueado">
      <h1 class="titulo-sistema">POS "OAXACA DE ANTEQUERA"</h1>

      <nav class="nav-botones">
        <button @click="irA('Caja')" :class="{ activo: vista === 'Caja' }">Caja</button>
        <button @click="irA('Creditos')" :class="{ activo: vista === 'Creditos' }">Créditos</button>
        <button v-if="rolUsuario === 'admin'" @click="irA('Inventario')" :class="{ activo: vista === 'Inventario' }">Inventario</button>
        <button v-if="rolUsuario === 'admin'" @click="irA('Reportes')" :class="{ activo: vista === 'Reportes' }">Reportes</button>
        <button v-if="rolUsuario === 'admin'" @click="irA('Administrador')" :class="{ activo: vista === 'Administrador' }">Administrador</button>
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
          v-if="vista === 'Inventario'"
          :sucursal="sucursalActual"
        />
        <ReportesView
          v-if="vista === 'Reportes'"
          :ventas="ventas"
          :sucursal="sucursalActual"
        />
        <AdministradorView
          v-if="vista === 'Administrador'"
        />
      </div>
    </main>

    <!-- Modal de Confirmación de Cierre de Sesión -->
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

    <!-- Modal de Confirmación de Corte del Día -->
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
      rolUsuario: ''
    }
  },
  methods: {
    irA(vista) {
      this.vista = vista
    },
    agregarVenta(nuevaVenta) {
      this.ventas.push(nuevaVenta)
      localStorage.setItem('ventas_realizadas', JSON.stringify(this.ventas))
    },
    cerrarSesion() {
      this.mostrarAlerta = true
    },
    confirmarCerrarSesion() {
      if (this.$refs.cajaViewComponent?.cerrarCaja) {
        this.$refs.cajaViewComponent.cerrarCaja()
      }
      this.mostrarAlerta = false
      this.mostrarCorteConfirmado = true
    },
    finalizarCorte() {
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
/* RESET */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html, #app {
  font-family: 'Poppins', sans-serif;
  background-color: #fafafa; /* fondo neutro claro */
  min-height: 100vh;
}

/* HEADER elegante café */
.app-header {
  background: linear-gradient(135deg, #d7ccc8, #efebe9);
  padding: 1.2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 3px solid #bcaaa4;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.08);
  border-radius: 0 0 18px 18px;
}

.titulo-sistema {
  font-size: 2.5rem;
  color: #4e342e;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.05);
}

/* NAV BAR con íconos */
.nav-botones {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.7rem;
}

.nav-botones button {
  padding: 0.65rem 1.4rem;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  background-color: #fff6ec;
  color: #4e342e;
}

/* Emojis decorativos */
.nav-botones button:nth-child(1)::before { content: "💵"; }
.nav-botones button:nth-child(2)::before { content: "🧾"; }
.nav-botones button:nth-child(3)::before { content: "📦"; }
.nav-botones button:nth-child(4)::before { content: "📊"; }
.nav-botones button:nth-child(5)::before { content: "👤"; }

.nav-botones button:hover {
  background-color: #ffe0b2; /* durazno claro */
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
}

.nav-botones button.activo {
  background-color: #a5d6a7; /* verde menta */
  color: #1b5e20;
  border-color: #81c784;
}

/* BOTÓN CERRAR SESIÓN */
.btn-logout {
  background-color: #ef9a9a;
  color: #ffffff;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 14px;
  font-weight: bold;
  margin-left: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-logout::before {
  content: "🔓";
}
.btn-logout:hover {
  background-color: #c62828;
  transform: scale(1.05);
}

/* CONTENIDO PRINCIPAL */
.contenido {
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
}

/* MODALES */
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

/* Botones del modal */
.btn-confirmar, .btn-cancelar {
  padding: 0.6rem 1.4rem;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-confirmar {
  background-color: #4caf50;
  color: white;
}
.btn-confirmar:hover {
  background-color: #388e3c;
}

.btn-cancelar {
  background-color: #90a4ae;
  color: white;
}
.btn-cancelar:hover {
  background-color: #607d8b;
}
</style>
