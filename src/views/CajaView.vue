  <template>
    <div class="caja-view">
      <h1 class="titulo">🪙Caja de Cobro</h1>

<div v-if="mostrarModalCambio" class="modal-overlay">
  <div class="modal-contenido">
    <h3>🪙 Ingresar cambio inicial en caja</h3>
    
    <input
      v-model.number="cambioInicial"
      type="number"
      min="1"
      step="0.01"
      placeholder="Ej. 500.00"
      class="input-cambio"
    />

    <div class="modal-botones">
      <button class="btn-confirmar" @click="guardarCambioInicial">
        Guardar
      </button>
    </div>
  </div>
</div>


      <!-- ALERTA GENERAL -->
      <div v-if="alerta.visible" :class="['alerta-general', alerta.tipo]">
        {{ alerta.mensaje }}
      </div>

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
          v-for="(producto, index) in productosFiltrados"
          :key="producto.id + '-' + index"
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
          <li v-for="(item, index) in carrito" :key="item.id + '-' + index" class="item-carrito">
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

        <p class="total">Total de la venta: ${{ total.toFixed(2) }}</p>

        <div class="metodo-pago">
          <label>Método de pago:</label>
          <label><input type="radio" value="efectivo" v-model="metodoPago" /> Efectivo</label>
          <label><input type="radio" value="tarjeta" v-model="metodoPago" /> Tarjeta</label>
          <label><input type="radio" value="transferencia" v-model="metodoPago" /> Transferencia</label>
          <label><input type="radio" value="credito" v-model="metodoPago" /> Crédito</label>
        </div>

        <!-- FORMULARIO COMPLETO DE CRÉDITO -->
        <div v-if="metodoPago === 'credito'" class="formulario-credito">
          <h3>📋 Crear nuevo crédito</h3>
          <div class="form-group">
            <label for="nombreCredito">Nombre del cliente</label>
            <input
              id="nombreCredito"
              v-model="nuevoCreditoCaja.nombre"
              type="text"
              placeholder="Nombre del cliente"
            />
          </div>
          <div class="form-group">
            <label>Monto del crédito</label>
            <input :value="total.toFixed(2)" type="number" readonly />
          </div>
          <div class="form-group">
            <label for="descripcionCredito">Descripción (motivo del crédito)</label>
            <input
              id="descripcionCredito"
              v-model="nuevoCreditoCaja.descripcion"
              type="text"
              placeholder="Ejemplo: Préstamo por emergencia"
            />
          </div>
          <button class="btn-crear" @click="guardarCredito">Otorgar crédito</button>
        </div>

<div v-if="totalAcumulado > 0" class="recuadro-total-acumulado">
  <p><strong>Ventas totales del día:</strong> ${{ totalAcumulado.toFixed(2) }}</p>


<div class="dinero-total">
  <strong> Dinero en caja:</strong> ${{ dineroEnCajaTotal.toFixed(2) }}
</div>

</div>

        <button @click="mostrarModalDePago" :disabled="carrito.length === 0 || metodoPago === 'credito'" class="btn-finalizar">
          Finalizar Venta
        </button>
      </section>

  <!-- Modal de Pago -->
  <div
    v-if="mostrarModalPago"
    class="modal-overlay"
    @keydown.esc="cancelarPago"
    tabindex="0"
    ref="modalPago"
  >
    <div class="modal-contenido" role="dialog" aria-modal="true" aria-labelledby="tituloModalPago">
      <h3 id="tituloModalPago">Confirmar Pago💵</h3>

      <p>Total a pagar: <strong>${{ total.toFixed(2) }}</strong></p>

      <label for="montoRecibido">Monto recibido</label>
      <input
        id="montoRecibido"
        type="number"
        min="0"
        step="0.01"
        v-model.number="montoRecibido"
        @input="calcularCambio"
        placeholder="Ingresa el monto recibido"
        autofocus
      />

      <p v-if="cambio >= 0">Cambio: <strong>${{ cambio.toFixed(2) }}</strong></p>
      <p v-else class="alerta-error">Monto recibido insuficiente</p>

      <div class="modal-botones">
        <button
          class="btn-confirmar"
          :disabled="montoRecibido < total"
          @click="confirmarPago"
          title="Confirmar el pago"
        >
          Confirmar
        </button>

        <button
          class="btn-cancelar"
          @click="cancelarPago"
          title="Cancelar"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>


      <!-- Ticket -->
      <section v-if="ventaFinalizada" class="ticket" id="ticket">
        <h2>Ticket de Venta</h2>
        <ul>
          <li v-for="(item, index) in carritoAnterior" :key="item.id + '-' + index">
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

-------------------------------------------------------Scryp funcional----------------------------------------------------------------------
<script>
import { obtenerProductosPorSucursal, actualizarProductosPorSucursal } from '../productos.js';

export default {
  data() {
        return {
      sucursal: JSON.parse(localStorage.getItem('usuario'))?.sucursal || 'sin_sucursal',
      mostrarModalPago: false,
montoRecibido: 0,
cambio: 0,
          cambioInicial: 0, // ✅ Esto evita el warning
      mostrarModalCambio: false,
      dineroInicial: 0, // dinero con que inicia la caja
      rol: '',
      productos: [],
      carrito: [],
      codigoEscaneado: '',
      metodoPago: 'efectivo',
      ventaFinalizada: false,
      carritoAnterior: [],
      metodoPagoAnterior: '',
      totalAnterior: 0,
      totalAcumulado: 0, // ventas del día
      ventasRealizadas: [],
      inputActivo: false,
      busquedaProducto: '',
      productoNoEncontrado: false,
      modalVisible: false,
      itemAEliminar: null,
          corteEnProceso: false,
      nuevoCreditoCaja: {
        nombre: '',
        descripcion: '',
      },
      alerta: {
        visible: false,
        mensaje: '',
        tipo: 'exito'
      }
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
    },
  dineroEnCajaTotal() {
    return this.dineroInicial + this.totalAcumulado;
  },
  },

mounted() {
  const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  this.rol = usuario.rol || 'cajero';

  this.cargarProductos();

  const claveCambio = `cambioInicial_${this.sucursal}`;
  const cambioGuardado = localStorage.getItem(claveCambio);

  if (this.rol.toLowerCase() !== 'admin') {
    if (!cambioGuardado || isNaN(parseFloat(cambioGuardado))) {
      this.mostrarModalCambio = true;
      this.totalAcumulado = 0;
      this.dineroInicial = 0;
    } else {
      this.dineroInicial = parseFloat(cambioGuardado);

      const claveTotal = `total_acumulado_${this.sucursal}_${new Date().toISOString().slice(0, 10)}`;
      const totalGuardado = localStorage.getItem(claveTotal);
      if (totalGuardado) {
        this.totalAcumulado = parseFloat(totalGuardado);
      } else {
        this.totalAcumulado = 0;
      }
    }
  }

},


  methods: {
    cargarProductos() {
      const productos = obtenerProductosPorSucursal(this.sucursal);
      this.productos = productos || [];
    },

guardarCambioInicial() {
  if (!this.cambioInicial || this.cambioInicial <= 0) {
    alert('Ingresa un valor válido para el cambio inicial');
    return;
  }

  this.dineroInicial = this.cambioInicial; // ✅ Asigna el cambio a dineroInicial

  const fecha = new Date().toLocaleDateString();
  const horaInicio = new Date().toLocaleTimeString();
  const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  const sucursal = usuario.sucursal || 'sin_sucursal';

  const corte = {
    fecha,
    horaInicio,
    sucursal,
    usuario: usuario.nombre || 'desconocido',
    cambio: this.dineroInicial,
    ventas: [],
    total: 0,
  };

  let cortes = JSON.parse(localStorage.getItem('cortes')) || [];
  cortes.push(corte);
  localStorage.setItem('cortes', JSON.stringify(cortes));

  localStorage.setItem(`cambioInicial_${sucursal}`, this.dineroInicial);

  this.mostrarModalCambio = false;
},

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

  // ✅ Limpia el buscador y oculta los resultados
  this.busquedaProducto = '';

  // ✅ Opcional: reenfocar input de código de barras
  this.$nextTick(() => this.$refs.inputCodigo?.focus());
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

    guardarCredito() {
      if (!this.nuevoCreditoCaja.nombre.trim()) {
        this.mostrarAlerta('⚠️ Ingresa el nombre del cliente.', 'error');
        return;
      }
      if (!this.total || this.total <= 0) {
        this.mostrarAlerta('⚠️ El carrito está vacío.', 'error');
        return;
      }

      const nombre = this.nuevoCreditoCaja.nombre.trim();
      const descripcionUsuario = this.nuevoCreditoCaja.descripcion.trim();
      const monto = this.total;
      const sucursal = this.sucursal;

      const detalleProductos = this.carrito
        .map(item => `${item.nombre} x${item.cantidad}`)
        .join(', ');
      const descripcionCompleta = descripcionUsuario
        ? `${descripcionUsuario}; Productos: ${detalleProductos}`
        : `Productos: ${detalleProductos}`;

      const claveClientes = `clientes_${sucursal}`;
      const clientes = JSON.parse(localStorage.getItem(claveClientes)) || [];

      const existente = clientes.find(
        c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.sucursal === sucursal
      );

      if (existente) {
        existente.creditoPendiente += monto;
        existente.montoInicial += monto;
        existente.descripcion = descripcionCompleta;
      } else {
        clientes.push({
          id: Date.now(),
          nombre,
          creditoPendiente: monto,
          montoInicial: monto,
          descripcion: descripcionCompleta,
          historial: [],
          sucursal
        });
      }

      localStorage.setItem(claveClientes, JSON.stringify(clientes));

      const usuarioActual = JSON.parse(localStorage.getItem('usuario')) || {
        username: 'desconocido',
        sucursal: 'sin_sucursal'
      };

      const ventaCredito = {
        id: Date.now(),
        productos: JSON.parse(JSON.stringify(this.carrito)),
        total: this.total,
        metodoPago: 'credito',
        fecha: new Date().toISOString(),
        usuario: {
          nombre: usuarioActual.username,
          sucursal: this.sucursal
        },
        sucursal: this.sucursal
      };

      const todasVentas = JSON.parse(localStorage.getItem('ventas_realizadas')) || [];
      todasVentas.push(ventaCredito);
      localStorage.setItem('ventas_realizadas', JSON.stringify(todasVentas));

      this.$emit('nueva-venta', ventaCredito);

      this.nuevoCreditoCaja = { nombre: '', descripcion: '' };
      this.carrito = [];
      this.ventaFinalizada = false;
      this.metodoPago = 'efectivo';

      this.mostrarAlerta('✔️ Crédito guardado sin afectar caja.', 'exito');
    },

    cargarTotalDelDia() {
      const hoy = new Date().toISOString().slice(0, 10);
      const sucursal = this.sucursal;
      let total = 0;

      const todasVentas = JSON.parse(localStorage.getItem('ventas_realizadas') || '[]');
      const ventasHoy = todasVentas.filter(v =>
        v.sucursal === sucursal &&
        v.fecha?.startsWith(hoy) &&
        v.metodoPago !== 'credito'
      );
      ventasHoy.forEach(v => total += v.total);

      const pagosCredito = JSON.parse(localStorage.getItem('ingresos_credito') || '[]');
      const pagosHoy = pagosCredito.filter(p =>
        p.tipo === 'pago_credito' &&
        p.sucursal === sucursal &&
        p.fecha?.startsWith(hoy)
      );
      pagosHoy.forEach(p => total += p.monto);

      this.totalAcumulado = total;

      const claveTotal = `total_acumulado_${sucursal}_${hoy}`;
      localStorage.setItem(claveTotal, total.toString());
    },

    finalizarVenta() {
      if (this.metodoPago === 'credito') {
        alert('Para ventas a crédito, usa el botón "Otorgar crédito".');
        return;
      }

      this.carrito.forEach(item => {
        const prod = this.productos.find(p => p.id === item.id);
        if (prod) prod.stock -= item.cantidad;
      });

      actualizarProductosPorSucursal(this.sucursal, this.productos);

      const usuarioActual = JSON.parse(localStorage.getItem('usuario')) || {
        username: 'desconocido',
        sucursal: 'sin_sucursal'
      };

      const venta = {
        id: Date.now(),
        productos: JSON.parse(JSON.stringify(this.carrito)),
        total: this.total,
        metodoPago: this.metodoPago,
        fecha: new Date().toISOString(),
        usuario: {
          nombre: usuarioActual.username,
          sucursal: this.sucursal
        },
        sucursal: this.sucursal
      };

      const todasVentas = JSON.parse(localStorage.getItem('ventas_realizadas')) || [];
      todasVentas.push(venta);
      localStorage.setItem('ventas_realizadas', JSON.stringify(todasVentas));

      this.sumarAlTotalDelDia(this.total);

      // ✅ Actualizar dinero en caja por sucursal
      const claveDinero = `dinero_en_caja_${this.sucursal}`;
      const dineroActual = parseFloat(localStorage.getItem(claveDinero)) || 0;
      const nuevoDinero = dineroActual + this.total;
      localStorage.setItem(claveDinero, nuevoDinero.toFixed(2));
      window.dispatchEvent(new Event("dinero-en-caja-actualizado"));

      this.$emit('nueva-venta', venta);
      this.carritoAnterior = [...this.carrito];
      this.totalAnterior = this.total;
      this.metodoPagoAnterior = this.metodoPago;
      this.ventaFinalizada = true;
      this.carrito = [];
      this.codigoEscaneado = '';
    },

    sumarAlTotalDelDia(monto) {
      const hoy = new Date().toISOString().slice(0, 10);
      const claveTotal = `total_acumulado_${this.sucursal}_${hoy}`;
      const totalAnterior = parseFloat(localStorage.getItem(claveTotal)) || 0;
      const nuevoTotal = totalAnterior + monto;
      localStorage.setItem(claveTotal, nuevoTotal.toString());
      this.totalAcumulado = nuevoTotal;
    },

mostrarModalDePago() {
  this.mostrarModalPago = true;
  this.montoRecibido = 0;
  this.cambio = 0;
},

calcularCambio() {
  if (this.montoRecibido >= this.total) {
    this.cambio = this.montoRecibido - this.total;
  } else {
    this.cambio = 0;
  }
},

confirmarPago() {
this.finalizarVenta();
  this.mostrarModalPago = false;
},

cancelarPago() {
  this.mostrarModalPago = false;
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
    },

    mostrarAlerta(mensaje, tipo = 'exito') {
      this.alerta.mensaje = mensaje;
      this.alerta.tipo = tipo;
      this.alerta.visible = true;
      setTimeout(() => {
        this.alerta.visible = false;
      }, 3000);
    }, 
    // 🔽 AGREGA ESTA FUNCIÓN AL FINAL DE "methods"
realizarCorteDeCaja() {
  const usuarioData = JSON.parse(localStorage.getItem('usuario')) || {};
  const ventasGuardadas = JSON.parse(localStorage.getItem('ventas_realizadas')) || [];
  const cortes = JSON.parse(localStorage.getItem('cortes_realizados')) || [];

  if (usuarioData.rol === 'admin') {
    this.mostrarAlerta('⚠️ Los administradores no pueden realizar cortes de caja.', 'error');
    return;
  }

  // ✅ Fecha local en México en formato YYYY-MM-DD
  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');

  const horaActual = new Date().toLocaleTimeString('es-MX');

  const usuario = {
    nombre: usuarioData.nombre || usuarioData.username || 'Desconocido',
    sucursal: usuarioData.sucursal || this.sucursal
  };

  const cortesSucursal = cortes
    .filter(corte => corte.sucursal === this.sucursal)
    .sort((a, b) => b.timestamp - a.timestamp);

  const ultimoCorteTimestamp = cortesSucursal.length > 0 ? cortesSucursal[0].timestamp : 0;

  const ventasNuevas = ventasGuardadas.filter(venta => {
    return (
      venta.sucursal === this.sucursal &&
      new Date(venta.fecha).getTime() > ultimoCorteTimestamp
    );
  });

  const totalVentas = ventasNuevas.reduce((acc, venta) => acc + (venta.total || 0), 0);

  const cambioInicialKey = `cambioInicial_${this.sucursal}`;
  const cambioInicial = Number(localStorage.getItem(cambioInicialKey)) || 0;

  const totalCaja = cambioInicial + totalVentas;

  const corte = {
    sucursal: this.sucursal,
    fecha: fechaHoy,
    hora: horaActual,
    total: totalCaja,
    ventas: ventasNuevas,
    usuario: usuario,
    cambioInicial: cambioInicial,
    totalVentas: totalVentas,
    timestamp: Date.now()
  };

  cortes.push(corte);
  localStorage.setItem('cortes_realizados', JSON.stringify(cortes));

  localStorage.removeItem(`total_acumulado_${this.sucursal}_${fechaHoy}`);
  localStorage.removeItem(`dinero_en_caja_${this.sucursal}`);
  localStorage.removeItem(`cambioInicial_${this.sucursal}`);

  this.totalAcumulado = 0;
  this.dineroInicial = 0;
  this.carrito = [];
  this.codigoEscaneado = '';
  this.ventaFinalizada = false;
  this.metodoPago = 'efectivo';

  this.mostrarAlerta('📦 Corte de caja realizado exitosamente.', 'exito');
  window.dispatchEvent(new Event('corte-realizado'));
}



  }
};
</script>


<style scoped>
/* Estilos del modal de cobro*/

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  animation: fadeIn 0.25s ease-out;
  backdrop-filter: blur(4px);
}

.modal-contenido {
  background: #ffffff;
  padding: 2rem 2.5rem;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 360px;
  text-align: center;
  animation: slideIn 0.3s ease-out;
  font-family: 'Poppins', sans-serif;
}

.modal-contenido h3 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #000000;
}

.modal-contenido input[type="number"] {
  width: 100%;
  padding: 0.9rem 1rem;
  font-size: 1.1rem;
  border: 2px solid #c8e6c9;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.3s;
  margin-bottom: 1.5rem;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
}

.modal-contenido input[type="number"]:focus {
  border-color: #000000;
}

.modal-botones {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-confirmar {
  background-color: #43a047;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.25s ease, transform 0.2s ease;
}

.btn-confirmar:hover:not(:disabled) {
  background-color: #388e3c;
  transform: scale(1.04);
}

.btn-confirmar:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.btn-cancelar {
  background-color: #e74c3c;
  color: white;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-cancelar:hover {
  background-color: #c62828;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}


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

.dinero-total {
  color: #004404;
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

/* ============================
   ESTILOS NUEVOS PARA LA TABLA
=============================== */
.tabla-container {
  overflow-x: auto;
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: #fff;
  padding: 1rem;
}

.tabla-reportes {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1rem;
  color: #2e7d32;
}

.tabla-reportes thead tr {
  background-color: transparent;
}

.tabla-reportes thead th {
  padding: 12px 20px;
  text-align: left;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.9rem;
  color: #4caf50;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #4caf50;
  user-select: none;
}

.tabla-reportes tbody tr {
  background: #e8f5e9;
  box-shadow: 0 4px 6px rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: block;
  margin-bottom: 12px;
  padding: 12px 20px;
}

.tabla-reportes tbody tr:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.25);
}

.tabla-reportes tbody tr td {
  display: block;
  padding: 6px 0;
  font-weight: 600;
  border: none;
  color: #256029;
}

.tabla-reportes tbody tr td::before {
  content: attr(data-label);
  font-weight: 700;
  text-transform: uppercase;
  margin-right: 10px;
  color: #4caf50;
  font-size: 0.75rem;
}

@media (min-width: 768px) {
  .tabla-reportes {
    border-spacing: 0;
  }

  .tabla-reportes tbody tr {
    display: table-row;
    background: white;
    box-shadow: none;
    border-radius: 0;
    margin-bottom: 0;
    padding: 0;
    cursor: default;
  }

  .tabla-reportes tbody tr:hover {
    transform: none;
    box-shadow: none;
  }

  .tabla-reportes tbody tr td {
    display: table-cell;
    padding: 12px 20px;
    color: #2e7d32;
    font-weight: normal;
    border-bottom: 1px solid #e0e0e0;
  }

  .tabla-reportes tbody tr td::before {
    content: none;
  }
}
/* FORMULARIO CRÉDITO */
.formulario-credito {
  background-color: #e8f5e9; /* verde muy suave */
  border: 2px solid #81c784; /* verde medio */
  border-radius: 10px;
  padding: 1.5rem 2rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(129, 199, 132, 0.3);
}

.formulario-credito h3 {
  color: #2e7d32;
  font-weight: 700;
  margin-bottom: 1rem;
  font-family: 'Poppins', sans-serif;
  text-align: center;
  letter-spacing: 0.6px;
}

.formulario-credito .form-group {
  margin-bottom: 1.2rem;
}

.formulario-credito label {
  display: block;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
  user-select: none;
}

.formulario-credito input[type="text"],
.formulario-credito input[type="number"] {
  width: 100%;
  padding: 0.55rem 1rem;
  font-size: 1rem;
  border: 2px solid #4caf50;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
}

.formulario-credito input[type="text"]:focus,
.formulario-credito input[type="number"]:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 6px rgba(46, 125, 50, 0.5);
}

.btn-crear {
  display: block;
  width: 100%;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 0;
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 0.5rem;
}

.btn-crear:hover {
  background-color: #388e3c;
}

.btn-crear:active {
  background-color: #2e7d32;
}

.alerta-general {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  font-weight: bold;
  color: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
  z-index: 9999;
  transition: opacity 0.3s ease;
}

.alerta-general.exito {
  background-color: #4caf50; /* verde */
}

.alerta-general.error {
  background-color: #f44336; /* rojo */
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  animation: fadeIn 0.25s ease-out;
  backdrop-filter: blur(4px);
}

.modal-contenido {
  background: #ffffff;
  padding: 2rem 2.5rem;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 360px;
  text-align: center;
  animation: slideIn 0.3s ease-out;
  font-family: 'Poppins', sans-serif;
}

.modal-contenido h3 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #000000;
}

.modal-contenido input[type="number"] {
  width: 100%;
  padding: 0.9rem 1rem;
  font-size: 1.1rem;
  border: 2px solid #c8e6c9;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.3s;
  margin-bottom: 1.5rem;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
}

.modal-contenido input[type="number"]:focus {
  border-color: #000000;
}

.modal-botones {
  display: flex;
  justify-content: center;
}

.modal-botones .btn-confirmar {
  background-color: #43a047;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.25s ease, transform 0.2s ease;
}

.modal-botones .btn-confirmar:hover {
  background-color: #388e3c;
  transform: scale(1.04);
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

</style>
