-----------------------------------------SE USA EN REPORTES SOLO EN LOS QUE SON "CREDITOS"-------------------------------------------------
<template>
  <div class="modal-overlay" @click.self="cerrarModal" :class="{ cerrar: animandoCierre }">
    <div class="modal-content">
      <h2>💳 Detalle de Pago de Crédito</h2>

      <p><strong>ID:</strong> {{ credito.id || 'N/A' }}</p>
      <p><strong>Cliente:</strong> {{ credito.cliente || credito.nombre || 'Desconocido' }}</p>
      <p><strong>Fecha:</strong> {{ formatoFecha(credito.fecha) }}</p>
      <p><strong>Cajero:</strong> {{ credito.usuario?.nombre || 'Desconocido' }}</p>
      <p><strong>Sucursal:</strong> {{ credito.usuario?.sucursal || credito.sucursal || 'Desconocida' }}</p>

      <!-- Descripción remarcada -->
      <div class="descripcion-remarcada">
        <strong>📌 Descripción:</strong>
        <p>{{ credito.descripcion || 'Sin descripción' }}</p>
      </div>

      <div class="total-final">
        Total Pagado: ${{ credito.total?.toFixed(2) || credito.monto?.toFixed(2) || '0.00' }}
      </div>

      <button class="cerrar-btn" @click="cerrarModal">Cerrar</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetalleCreditoItem',
  props: {
    credito: {
      type: Object,
      required: true
    }
  },
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
      }, 300)
    },
    formatoFecha(fecha) {
      return fecha ? new Date(fecha).toLocaleString() : 'N/A'
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.descripcion-remarcada {
  background-color: #f9f3cd;
  padding: 1rem;
  margin-top: 1rem;
  border-left: 5px solid #e6b800;
  border-radius: 4px;
  font-size: 14px;
}

.total-final {
  font-weight: bold;
  margin-top: 1.5rem;
  font-size: 16px;
  text-align: right;
}

.cerrar-btn {
  margin-top: 1.5rem;
  background-color: #c0392b;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 5px;
  cursor: pointer;
  float: right;
}

.cerrar-btn:hover {
  background-color: #e74c3c;
}
</style>