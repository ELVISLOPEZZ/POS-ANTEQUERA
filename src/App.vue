<template>
  <div id="app">
    <header class="app-header" v-if="logueado">
      <div class="header-top">
        <img src="@/assets/logo-oaxx.png" alt="Logo" class="logo-empresa" />
        <h1 class="titulo-sistema">CREMERIA OAXACA DE ANTEQUERA</h1>
        <img src="@/assets/logo-oaxx.png" alt="Logo" class="logo-empresa2" />
        <button class="menu-toggle" @click="menuAbierto = !menuAbierto">
          <span :class="{ abierto: menuAbierto }">☰</span>
        </button>
      </div>

      <!-- Menú lateral toggle desde la derecha -->
      <transition name="slide-derecha">
        <nav
          v-show="menuAbierto || anchoPantalla >= 769"
          class="nav-botones menu-lateral"
        >
          <button v-if="rolUsuario !== 'administrador'" @click="irA('Caja')" :class="{ activo: vista === 'Caja' }">💵 Caja</button>
          <button @click="irA('Creditos')" :class="{ activo: vista === 'Creditos' }">🧾 Créditos</button>
          <button @click="irA('Inventario')" :class="{ activo: vista === 'Inventario' }">📦 Inventario</button>
          <button v-if="rolUsuario === 'administrador'" @click="irA('Reportes')" :class="{ activo: vista === 'Reportes' }">📊 Reportes</button>
          <button v-if="rolUsuario === 'administrador'" @click="irA('Administrador')" :class="{ activo: vista === 'Administrador' }">👤 Administrador</button>
          <button @click="cerrarSesion" class="btn-logout">🔓 Cerrar sesión</button>
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

    <!-- Modal cerrar sesión -->
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

    <!-- Modal corte confirmado -->
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
import { logout, isLoggedIn } from './services/auth.js'

export default {
  emits: ['login-exitoso'],
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
  // Si el rol es admin y la vista solicitada es 'Caja', cambiar a 'Reportes'
  if (this.rolUsuario === 'administrador' && vista === 'Caja') {
    this.vista = 'Reportes';
    this.$router.push('/reportes');
  } else {
    this.vista = vista;
    if (this.anchoPantalla < 769) this.menuAbierto = false;

    // También actualiza la ruta según la vista seleccionada
    switch (this.vista) {
      case 'Caja':
        this.$router.push('/caja');
        break;
      case 'Reportes':
        this.$router.push('/reportes');
        break;
      case 'Inventario':
        this.$router.push('/inventario');
        break;
      case 'Creditos':
        this.$router.push('/creditos');
        break;
      case 'Administrador':
        this.$router.push('/administrador');
        break;
    }
  }
    },
    agregarVenta(nuevaVenta) {
      this.ventas.push(nuevaVenta)
      localStorage.setItem('ventas_realizadas', JSON.stringify(this.ventas))
    },
    cerrarSesion() {
  this.mostrarAlerta = true;
    },
    confirmarCerrarSesion() {
  // Cierra cualquier modal abierto
  this.mostrarAlerta = false;
  this.mostrarCorteConfirmado = false;

  if (this.rolUsuario === 'administrador') {
    // Cierre directo para admins
    localStorage.removeItem('store_code');
    localStorage.removeItem('rol_usuario');
    this.logueado = false;
    this.$router.push('/');
  } else {
    // Cajero: Realizar corte antes de cerrar sesión
    this.$refs.cajaViewComponent?.realizarCorteDeCaja();
    this.mostrarCorteConfirmado = true;
  }
    },
    finalizarCorte() {
  const sucursal = localStorage.getItem('store_code');
  if (sucursal) {
    localStorage.removeItem(`cambioInicial_${sucursal}`);
  }

  logout(); // función del auth.js
  this.logueado = false;
  this.sucursalActual = '';
  this.rolUsuario = '';
  this.mostrarCorteConfirmado = false;
  localStorage.removeItem('store_code');
  localStorage.removeItem('rol_usuario');
  this.$router.push('/');
    },
    cancelarCerrarSesion() {
      this.mostrarAlerta = false
    },
    onLoginExitoso(usuario) {
  this.logueado = true
  this.sucursalActual = localStorage.getItem('store_code') || ''
  this.rolUsuario = usuario.rol || ''

  if (this.rolUsuario === 'administrador') {
    this.vista = 'Reportes'
    this.$router.push('/reportes')
  } else {
    this.vista = 'Caja'
    this.$router.push('/caja')
  }

  // Aquí puedes usar nextTick para asegurarte que la vista ya se actualizó
  this.$nextTick(() => {
    // Si necesitas que algún componente haga algo tras la vista cargada
  })
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
    },


    mounted() {
  this.rolUsuario = localStorage.getItem('rol_usuario') || '';

  // Si es admin y la vista actual es 'Caja', redirigir a 'Reportes'
  if (this.rolUsuario === 'administrador' && this.vista === 'Caja') {
    this.vista = 'Reportes';
    this.$router.push('/reportes');
  } else {
    // Para que al recargar se mantenga la ruta acorde a la vista
    switch (this.vista) {
      case 'Caja':
        this.$router.push('/caja');
        break;
      case 'Reportes':
        this.$router.push('/reportes');
        break;
      case 'Inventario':
        this.$router.push('/inventario');
        break;
      case 'Creditos':
        this.$router.push('/creditos');
        break;
      case 'Administrador':
        this.$router.push('/administrador');
        break;
    }
  }
    },
}
</script>



<style scoped>
/* RESET */


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

/* Flex container para logo, título y menú toggle */
.header-top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between; /* logos a los extremos */
  gap: 1rem;
  flex-wrap: nowrap;
  padding: 0 1rem;
  max-width: 100%;
  height: 90px; /* altura fija para evitar estiramiento */
  box-sizing: border-box;
}

/* Logos (izquierda y derecha) */
.logo-empresa,
.logo-empresa2 {
  width: 140px;
  max-width: 140px;
  height: 120px; /* altura fija */
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex-shrink: 0;
  margin-left: 4px;
  margin-right: 4px;
}



/* Título centrado */
.titulo-sistema {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.9rem;
  color: #4e342e;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 320px); /* ancho total menos espacio para logos + margen */
  text-align: center;
  pointer-events: none;
  line-height: 90px; /* centrar vertical */
}

/* Botón menú toggle (hamburguesa) */
.menu-toggle {
  background: none;
  border: none;
  font-size: 2rem;
  color: #4e342e;
  cursor: pointer;
  display: none;
  flex-shrink: 0;
}
.menu-toggle span.abierto {
  transform: rotate(90deg);
}

/* Menú lateral */
.menu-lateral {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1rem;
}

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

.nav-botones button:hover {
  background-color: #ffe0b2;
}

.nav-botones button.activo {
  background-color: #a5d6a7;
  color: #1b5e20;
  border-color: #81c784;
}

/* Botón cerrar sesión */
.btn-logout {
  background-color: #ef9a9a;
  color: #fff;
}
.btn-logout:hover {
  background-color: #c62828;
}

/* Responsive */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .header-top {
    height: 70px;
    padding: 0 0.5rem;
    gap: 0.5rem;
  }

  .titulo-sistema {
    font-size: 1.4rem;
    max-width: calc(100% - 190px);
    line-height: 70px;
  }

  .logo-empresa,
  .logo-empresa2 {
    width: 90px;
    max-width: 90px;
    margin-left: 3px;
    margin-right: 3px;
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

  .nav-botones {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }
}

/* Transiciones menú lateral */
.slide-derecha-enter-active, .slide-derecha-leave-active {
  transition: all 0.3s ease;
}
.slide-derecha-enter-from, .slide-derecha-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Contenido principal */
.contenido {
  padding: 2rem;
  max-width: 1600px;
  margin: auto;
}

/* Modales */
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
</style>

