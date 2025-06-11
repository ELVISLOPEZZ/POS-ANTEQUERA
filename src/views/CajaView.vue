<template>
  <div class="caja-view">
    <h1>Caja de Cobro</h1>

    <!-- Lista productos -->
    <div class="productos">
      <h2>Productos disponibles</h2>
      <div v-for="producto in productos" :key="producto.id" class="producto">
        <span>{{ producto.nombre }} - ${{ producto.precio }}</span>
        <button @click="agregarAlCarrito(producto)">Agregar</button>
      </div>
    </div>

    <!-- Carrito -->
    <div class="carrito">
      <h2>Carrito</h2>
      <div v-if="carrito.length === 0">No hay productos en el carrito.</div>
      <ul v-else>
        <li v-for="item in carrito" :key="item.id">
          {{ item.nombre }} (x{{ item.cantidad }}) - ${{ item.precio * item.cantidad }}
        </li>
      </ul>
      <p><strong>Total: ${{ total }}</strong></p>

      <label for="metodoPago">Método de pago:</label>
      <select v-model="metodoPago" id="metodoPago">
        <option value="efectivo">Efectivo</option>
        <option value="tarjeta">Tarjeta</option>
      </select>

      <button @click="finalizarVenta" :disabled="carrito.length === 0">
        Finalizar Venta
      </button>
    </div>

    <!-- Ticket -->
    <div v-if="ventaFinalizada" class="ticket" id="ticket">
      <h2>Ticket de Venta</h2>
      <ul>
        <li v-for="item in carritoAnterior" :key="item.id">
          {{ item.nombre }} (x{{ item.cantidad }}) - ${{ item.precio * item.cantidad }}
        </li>
      </ul>
      <p><strong>Total: ${{ totalAnterior }}</strong></p>
      <p>Método de pago: {{ metodoPagoAnterior }}</p>
      <p>¡Gracias por su compra!</p>

      <button @click="imprimirTicket">Imprimir Ticket</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      productos: [
        { id: 1, nombre: 'Pan', precio: 10 },
        { id: 2, nombre: 'Leche', precio: 15 },
        { id: 3, nombre: 'Huevos', precio: 20 }
      ],
      carrito: [],
      metodoPago: 'efectivo',
      ventaFinalizada: false,
      carritoAnterior: [],
      metodoPagoAnterior: '',
      totalAnterior: 0
    };
  },
  computed: {
    total() {
      return this.carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    }
  },
  methods: {
    agregarAlCarrito(producto) {
      const encontrado = this.carrito.find(p => p.id === producto.id);
      if (encontrado) {
        encontrado.cantidad++;
      } else {
        this.carrito.push({ ...producto, cantidad: 1 });
      }
      this.ventaFinalizada = false;
    },
    finalizarVenta() {
      const venta = {
        id: Date.now(),
        productos: JSON.parse(JSON.stringify(this.carrito)),
        total: this.total,
        metodoPago: this.metodoPago,
        fecha: new Date().toISOString()
      };

      this.$emit('nueva-venta', venta); // ✅ ENVÍA LA VENTA AL PADRE (App.vue)

      this.carritoAnterior = [...this.carrito];
      this.totalAnterior = this.total;
      this.metodoPagoAnterior = this.metodoPago;
      this.ventaFinalizada = true;

      this.carrito = [];
    },
    imprimirTicket() {
      const originalContent = document.body.innerHTML;
      const ticketContent = document.getElementById('ticket').innerHTML;
      document.body.innerHTML = ticketContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  }
};
</script>

<style scoped>
.caja-view {
  padding: 2rem;
}
.productos, .carrito, .ticket {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  margin-left: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
select {
  margin-top: 0.5rem;
  padding: 0.3rem;
}
@media print {
  body * {
    visibility: hidden;
  }
  #ticket, #ticket * {
    visibility: visible;
  }
  #ticket {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
