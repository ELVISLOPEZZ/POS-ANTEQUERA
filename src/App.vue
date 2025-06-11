<template>
  <div id="app">
    <nav class="navbar">
      <div class="logo">POS Antequera</div>
      <div class="nav-buttons">
        <button @click="vista = 'inventario'" :class="{ active: vista === 'inventario' }">
          📦 Inventario
        </button>
        <button @click="vista = 'caja'" :class="{ active: vista === 'caja' }">
          💵 Caja de Cobro
        </button>
        <button @click="vista = 'reportes'" :class="{ active: vista === 'reportes' }">
          📊 Reportes
        </button>
      </div>
    </nav>

    <main class="contenido">
      <InventarioView v-if="vista === 'inventario'" />
      <CajaView v-if="vista === 'caja'" @nueva-venta="registrarVenta" />
      <ReportesView v-if="vista === 'reportes'" :ventas="ventas" />
    </main>
  </div>
</template>

<script>
import InventarioView from './views/InventarioView.vue'
import CajaView from './views/CajaView.vue'
import ReportesView from './views/ReportesView.vue'

export default {
  components: {
    InventarioView,
    CajaView,
    ReportesView
  },
  data() {
    return {
      vista: 'inventario',
      ventas: []
    }
  },
  created() {
    // Cargar ventas previas si existen en localStorage
    const ventasGuardadas = localStorage.getItem('ventas')
    if (ventasGuardadas) {
      this.ventas = JSON.parse(ventasGuardadas)
    }
  },
  methods: {
    registrarVenta(venta) {
      this.ventas.push(venta)
      // Guardar en localStorage para persistencia
      localStorage.setItem('ventas', JSON.stringify(this.ventas))
    }
  }
}
</script>

<style scoped>
#app {
  font-family: 'Segoe UI', sans-serif;
  color: #333;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #afa04c;
  padding: 1rem 2rem;
  color: rgb(40, 40, 40);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 2rem;
  font-weight: bold;
}

.nav-buttons button {
  background: transparent;
  border: none;
  color: white;
  margin-left: 2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.nav-buttons button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-buttons .active {
  background-color: white;
  color: #000000;
}

.contenido {
  padding: 2rem;
}
</style>
