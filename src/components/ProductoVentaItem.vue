-----------------------------------------------------------------REPORTES-----------------------------------------------------------------
<template>
  <div class="modal-overlay" @click.self="cerrarModal" :class="{ cerrar: animandoCierre }">
    <div class="modal-content">
      <h2>🔍 Detalle de Venta</h2>
      <p><strong>ID:</strong> {{ venta.id }}</p>
      <p><strong>Fecha:</strong> {{ new Date(venta.fecha).toLocaleString() }}</p>
      <p><strong>Cajero:</strong> {{ venta.usuario?.nombre || 'N/A' }}</p>
      <p><strong>Sucursal:</strong> {{ venta.usuario?.sucursal || venta.sucursal || 'N/A' }}</p>
      <p><strong>Método de Pago:</strong> {{ venta.metodoPago }}</p>

      <table class="detalle-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, index) in venta.productos" :key="index">
            <td>{{ p.nombre }}</td>
            <td>{{ p.cantidad }}</td>
            <td>${{ p.precio?.toFixed(2) || '0.00' }}</td>
            <td>${{ (p.precio * p.cantidad)?.toFixed(2) || '0.00' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-final">
        Total de la Venta: ${{ venta.total.toFixed(2) }}
      </div>

      <button class="cerrar-btn" @click="cerrarModal">Cerrar</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['venta'],
  data() {
    return {
      animandoCierre: false
    }
  },
  methods: {
    cerrarModal() {
      this.animandoCierre = true
      setTimeout(() => {
        this.$emit('cerrar')
      }, 300) // duración de la animación
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease forwards;
}

.modal-overlay.cerrar {
  animation: fadeOut 0.3s ease forwards;
}

.modal-content {
  background: white;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  font-family: 'Poppins', sans-serif;
  animation: slideIn 0.3s ease;
}

.detalle-tabla {
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
}

.detalle-tabla th,
.detalle-tabla td {
  padding: 0.75rem;
  text-align: center;
  border: 1px solid #e0e0e0;
}

.detalle-tabla th {
  background-color: #2e7d32;
  color: white;
}

.total-final {
  margin-top: 1.5rem;
  text-align: right;
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.cerrar-btn {
  margin-top: 2rem;
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cerrar-btn:hover {
  background-color: #b71c1c;
}

/* Animaciones */
@keyframes slideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    background: rgba(0, 0, 0, 0);
  }
  to {
    background: rgba(0, 0, 0, 0.6);
  }
}

@keyframes fadeOut {
  from {
    background: rgba(0, 0, 0, 0.6);
  }
  to {
    background: rgba(0, 0, 0, 0);
  }
}
</style>
