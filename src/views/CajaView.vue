<!-- CajaView.vue -->
<template>
  <div class="caja-view">
    <h1 class="titulo">Caja de Cobro</h1>

    <!-- MODAL DE CONFIRMACIÓN -->
    <div v-if="modalVisible" class="modal-overlay">
      <div class="modal-contenido">
        <p>¿Eliminar "<strong>{{ itemAEliminar?.nombre }}</strong>" del carrito?</p>
        <div class="modal-botones">
          <button @click="confirmarEliminacion(true)" class="btn-confirmar">Sí</button>
          <button @click="confirmarEliminacion(false)" class="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Buscar producto -->
    <section class="productos">
      <h2>Buscar producto por nombre</h2>
      <input
        v-model="busquedaProducto"
        type="text"
        placeholder="Escribe el nombre del producto"
        class="input-busqueda"
      />
      <div
        v-for="producto in productosFiltrados"
        :key="producto.id"
        class="producto-card"
      >
        <div class="info-producto">
          <img
            v-if="producto.imagen"
            :src="producto.imagen"
            alt="Imagen producto"
            class="imagen-producto"
          />
          <div>
            <h3>{{ producto.nombre }}</h3>
            <p class="precio">$ {{ producto.precio.toFixed(2) }}</p>
            <p class="stock" v-if="producto.stock !== undefined">Stock: {{ producto.stock }}</p>
            <p class="codigo">Código: {{ producto.codigoBarras }}</p>
          </div>
        </div>
        <button
          @click="agregarAlCarrito(producto)"
          class="btn-agregar"
          :disabled="producto.stock === 0"
        >
          Agregar
        </button>
      </div>
      <p v-if="busquedaProducto && productosFiltrados.length === 0" class="no-resultados">
        ❌ No se encontraron productos con ese nombre.
      </p>
    </section>

    
    <!-- Código de barras -->
    <div class="lector-codigo">
      <input
        id="codigoBarra"
        v-model="codigoEscaneado"
        type="text"
        inputmode="numeric"
        pattern="\d*"
        maxlength="13"
        @keyup.enter="procesarEscaneo"
        placeholder="Escanea o escribe el código del producto"
        ref="inputCodigo"
        @focus="inputActivo = true"
        @blur.capture="inputActivo = false"
      />
    </div>

        <!-- Alerta si no se encuentra producto -->
    <div v-if="productoNoEncontrado" class="alerta-error">
      ❌ Producto no encontrado con ese código de barras.
    </div>

    <!-- Carrito -->
    <section class="carrito">
      <h2>Carrito</h2>
      <div v-if="carrito.length === 0" class="empty-carrito">No hay productos en el carrito.</div>
      <ul v-else class="lista-carrito">
        <li v-for="item in carrito" :key="item.id" class="item-carrito">
          <span>{{ item.nombre }}</span>
          <div class="contador-cantidad">
            <button @click="cambiarCantidad(item, -1)">-</button>
            <span>{{ item.cantidad }}</span>
            <button @click="cambiarCantidad(item, 1)" :disabled="item.cantidad >= item.stock">+</button>
          </div>
          <span class="subtotal">$ {{ (item.precio * item.cantidad).toFixed(2) }}</span>
          <button class="btn-eliminar" @click="mostrarModal(item)">🗑</button>
        </li>
      </ul>

      <p class="total">Total: ${{ total.toFixed(2) }}</p>

      <div class="metodo-pago">
        <label>Método de pago:</label>
        <label><input type="radio" value="efectivo" v-model="metodoPago" /> Efectivo</label>
        <label><input type="radio" value="tarjeta" v-model="metodoPago" /> Tarjeta</label>
        <label><input type="radio" value="transferencia" v-model="metodoPago" /> Transferencia</label>
      </div>

      <div v-if="totalAcumulado > 0" class="recuadro-total-acumulado">
        <p><strong>Total acumulado del día:</strong> ${{ totalAcumulado.toFixed(2) }}</p>
      </div>

      <button @click="finalizarVenta" :disabled="carrito.length === 0" class="btn-finalizar">
        Finalizar Venta
      </button>
    </section>

    <!-- Ticket -->
    <section v-if="ventaFinalizada" class="ticket" id="ticket">
      <h2>Ticket de Venta</h2>
      <ul>
        <li v-for="item in carritoAnterior" :key="item.id">
          {{ item.nombre }} (x{{ item.cantidad }}) - ${{ (item.precio * item.cantidad).toFixed(2) }}
        </li>
      </ul>
      <p><strong>Total: ${{ totalAnterior.toFixed(2) }}</strong></p>
      <p>Método de pago: {{ metodoPagoAnterior }}</p>
      <p>¡Gracias por su compra!</p>
      <button @click="imprimirTicket" class="btn-imprimir">Imprimir Ticket</button>
    </section>
  </div>
</template>

<script>
// Conserva tus imports
import { obtenerProductosPorSucursal, actualizarProductosPorSucursal } from '../productos.js'



export default {
  data() {
    return {
      sucursal: localStorage.getItem('store_code') || 'sin_sucursal',
      productos: [],
      carrito: [],
      codigoEscaneado: '',
      metodoPago: 'efectivo',
      ventaFinalizada: false,
      carritoAnterior: [],
      metodoPagoAnterior: '',
      totalAnterior: 0,
      totalAcumulado: 0,
      ventasRealizadas: [],
      inputActivo: false,
      busquedaProducto: '',
      productoNoEncontrado: false,
      modalVisible: false,
      itemAEliminar: null
    };
  },
  computed: {
    total() {
      return this.carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    },
    productosFiltrados() {
      if (!this.busquedaProducto) return [];
      const texto = this.busquedaProducto.toLowerCase();
      return this.productos.filter(p => p.nombre.toLowerCase().includes(texto));
    }
  },
  mounted() {
    const sucursal = localStorage.getItem('store_code');
    if (!sucursal) return alert('Error: No se pudo determinar la sucursal.');

    this.productos = obtenerProductosPorSucursal(sucursal);

    const hoy = new Date().toISOString().slice(0, 10);
    const claveTotal = `total_acumulado_${sucursal}_${hoy}`;
    this.totalAcumulado = parseFloat(localStorage.getItem(claveTotal)) || 0;

    const todasVentas = JSON.parse(localStorage.getItem('ventas_realizadas')) || [];
    this.ventasRealizadas = todasVentas.filter(v => v.sucursal === sucursal);

    this.$nextTick(() => this.$refs.inputCodigo?.focus());
    window.addEventListener('keydown', this.detectarEscape);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.detectarEscape);
  },
  methods: {
    agregarAlCarrito(producto) {
      if (producto.stock === 0) return alert('Producto sin stock');
      const encontrado = this.carrito.find(p => p.id === producto.id);
      if (encontrado) {
        if (encontrado.cantidad < producto.stock) encontrado.cantidad++;
        else alert('No hay más stock disponible');
      } else {
        this.carrito.push({ ...producto, cantidad: 1 });
      }
      this.ventaFinalizada = false;
    },
    cambiarCantidad(item, delta) {
      const nuevaCantidad = item.cantidad + delta;
      if (nuevaCantidad < 1) return this.mostrarModal(item);
      const original = this.productos.find(p => p.id === item.id);
      if (original && nuevaCantidad > original.stock) return alert('No hay más stock disponible');
      item.cantidad = nuevaCantidad;
    },
    mostrarModal(item) {
      this.modalVisible = true;
      this.itemAEliminar = item;
    },
    confirmarEliminacion(confirmado) {
      if (confirmado && this.itemAEliminar) {
        this.carrito = this.carrito.filter(p => p.id !== this.itemAEliminar.id);
      }
      this.modalVisible = false;
      this.itemAEliminar = null;
    },
    procesarEscaneo() {
      const codigo = this.codigoEscaneado.trim();
      if (!codigo) return;
      const producto = this.productos.find(p => p.codigoBarras === codigo);
      if (!producto) {
        this.productoNoEncontrado = true;
        setTimeout(() => (this.productoNoEncontrado = false), 3000);
        this.codigoEscaneado = '';
        return;
      }
      this.agregarAlCarrito(producto);
      this.codigoEscaneado = '';
    },
finalizarVenta() {
      this.carrito.forEach(item => {
        const prod = this.productos.find(p => p.id === item.id);
        if (prod) prod.stock -= item.cantidad;
      });

      const usuarioActual = JSON.parse(localStorage.getItem('usuario')) || {
        username: 'desconocido',
        sucursal: 'sin_sucursal'
      };
      const sucursal = usuarioActual.sucursal || 'sin_sucursal';

        // 🔄 Guardar productos actualizados en localStorage
  actualizarProductosPorSucursal(sucursal, this.productos);

      const venta = {
        id: Date.now(),
        productos: JSON.parse(JSON.stringify(this.carrito)),
        total: this.total,
        metodoPago: this.metodoPago,
        fecha: new Date().toISOString(),
        usuario: {
          nombre: usuarioActual.username,
          sucursal: sucursal
        },
        sucursal: sucursal
      };

      const todasVentas = JSON.parse(localStorage.getItem('ventas_realizadas')) || [];
      todasVentas.push(venta);
      localStorage.setItem('ventas_realizadas', JSON.stringify(todasVentas));

      const hoy = new Date().toISOString().slice(0, 10);
      const claveTotal = `total_acumulado_${sucursal}_${hoy}`;
      const totalAnterior = parseFloat(localStorage.getItem(claveTotal)) || 0;
      const nuevoTotal = totalAnterior + this.total;

      localStorage.setItem(claveTotal, nuevoTotal.toString());
      this.totalAcumulado = nuevoTotal;

      this.$emit('nueva-venta', venta);
      this.carritoAnterior = [...this.carrito];
      this.totalAnterior = this.total;
      this.metodoPagoAnterior = this.metodoPago;
      this.ventaFinalizada = true;
      this.carrito = [];
      this.codigoEscaneado = '';
    },
    imprimirTicket() {
      const ticketContent = `
        <div style="text-align: left; font-size: 12px; font-family: monospace;">
          <h2 style="text-align: center; font-size: 16px;">POS OAXACA DE ANTEQUERA</h2>
          <p>Fecha: ${new Date().toLocaleString()}</p>
          <hr />
          <p><strong>Productos:</strong></p>
          ${this.carritoAnterior
            .map(item => `${item.nombre} x${item.cantidad}  $${(item.precio * item.cantidad).toFixed(2)}`)
            .join('<br>')}
          <hr />
          <p><strong>Total: $${this.totalAnterior.toFixed(2)}</strong></p>
          <p>Método de pago: ${this.metodoPagoAnterior}</p>
          <p style="text-align: center;">¡Gracias por su compra!</p>
          <br><br><br>
        </div>
      `;
      const printWindow = window.open('', '', 'width=300,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ticket</title>
              <style>
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: monospace;
                    font-size: 12px;
                  }
                }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              ${ticketContent}
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      this.ventaFinalizada = false;
    },
    reenfocarInput() {
      setTimeout(() => {
        if (!this.inputActivo) {
          this.$refs.inputCodigo?.focus();
        }
      }, 100);
    },
    detectarEscape(event) {
      if (event.key === 'Escape') {
        this.reenfocarInput();
      }
    }
  }
};
</script>



<style scoped>
/* 🎨 TIPOGRAFÍA Y TÍTULOS */
.caja-view {
  max-width: 900px;
  margin: auto;
  padding: 1.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
}

.caja-view h1 {
  text-align: center;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 2.4rem;
  letter-spacing: 0.5px;
  color: #2c3e50;
  margin-bottom: 1.2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ✅ LECTOR DE CÓDIGO */
.lector-codigo {
  margin-bottom: 1rem;
  text-align: center;
}

.lector-codigo input {
  padding: 0.5rem 1rem;
  font-size: 1.1rem;
  width: 330px;
  max-width: 90vw;
  border-radius: 6px;
  border: 2px solid #4caf50;
  outline: none;
  transition: border-color 0.3s ease;
}
.lector-codigo input:focus {
  border-color: #2e7d32;
}

/* 🔍 BUSCADOR */
.input-busqueda {
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  margin: 1rem auto 2rem auto;
  font-size: 1rem;
  border: 2px solid #4caf50;
  border-radius: 8px;
  outline: none;
  display: block;
  transition: all 0.3s ease;
}
.input-busqueda:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 8px rgba(46, 125, 50, 0.4);
  transform: scale(1.02);
}

.no-resultados {
  text-align: center;
  color: #d32f2f;
  background-color: #ffebee;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  margin-top: -1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  animation: fadeIn 0.4s ease-out;
}

/* 🛍 PRODUCTOS */
.productos, .carrito, .ticket {
  background: white;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.12);
}

.producto-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.producto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.info-producto {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.imagen-producto {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

.precio {
  font-weight: 600;
  color: #4caf50;
}
.stock, .codigo {
  font-size: 0.85rem;
  color: #666;
}

/* ➕ BOTÓN AGREGAR */
.btn-agregar {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-agregar:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}
.btn-agregar:hover:not(:disabled) {
  background-color: #388e3c;
}

/* 🛒 CARRITO */
.carrito ul {
  list-style: none;
  padding-left: 0;
  margin-top: 0.5rem;
}

.item-carrito {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.contador-cantidad {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.contador-cantidad button {
  width: 26px;
  height: 26px;
  background-color: #4caf50;
  border: none;
  border-radius: 3px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.contador-cantidad button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}
.contador-cantidad button:hover:not(:disabled) {
  background-color: #388e3c;
}

.btn-eliminar {
  margin-left: 10px;
  background-color: #e74c3c;
  border: none;
  color: white;
  padding: 3px 7px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 0.8rem;
}

.subtotal {
  min-width: 70px;
  text-align: right;
  font-weight: 600;
  color: #333;
}

.total {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: right;
  margin-top: 1rem;
  color: #2e7d32;
}

/* 💳 MÉTODO DE PAGO */
.metodo-pago {
  margin-top: 1rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.metodo-pago label {
  cursor: pointer;
  user-select: none;
}

/* ✅ BOTÓN FINALIZAR */
.btn-finalizar {
  margin-top: 1.5rem;
  width: 100%;
  background-color: #2e7d32;
  color: white;
  font-weight: 700;
  padding: 0.8rem 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-finalizar:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}
.btn-finalizar:hover:not(:disabled) {
  background-color: #1b5e20;
}

/* 🧾 TICKET */
.ticket h2 {
  color: #2e7d32;
}
.btn-imprimir {
  margin-top: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-imprimir:hover {
  background-color: #388e3c;
}

/* 📦 TOTAL ACUMULADO */
.recuadro-total-acumulado {
  margin-top: 1rem;
  background-color: #f1f8e9;
  border: 2px solid #aed581;
  border-radius: 10px;
  padding: 1rem;
  color: #33691e;
  font-size: 1.2rem;
  text-align: center;
  font-weight: bold;
}

/* ❗ ALERTAS */
.alerta-error {
  text-align: center;
  color: #c62828;
  background-color: #ffebee;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 1.2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  animation: fadeIn 0.4s ease-out;
}

/* 🧊 MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  animation: fadeIn 0.3s ease-out;
}

.modal-contenido {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  transform: scale(0.9);
  animation: slideIn 0.25s ease-out;
}

.modal-botones {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
}

.btn-confirmar,
.btn-cancelar {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.btn-confirmar {
  background-color: #4caf50;
  color: white;
}
.btn-confirmar:hover {
  background-color: #388e3c;
}

.btn-cancelar {
  background-color: #e57373;
  color: white;
}
.btn-cancelar:hover {
  background-color: #c62828;
}

/* 🖨 IMPRESIÓN */
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

/* 🌟 ANIMACIONES */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>