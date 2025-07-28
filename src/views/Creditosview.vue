<template>
  <div class="creditos-view">

  <div class="tooltip-container">
    <span class="tooltip-icon">ℹ️</span>
    <div class="tooltip-text">
      Si eres administrador no cobres los créditos, ya que de esto se encargan los cajeros.
      <br />
      Si necesitas cobrar un crédito, inicia sesión con perfil de cajero y cobra el crédito.
      <br />
      Haslo cuando todos los turnos del día hayan finalizado.
    </div>
  </div>
    
    <h1>📋 Gestión de Créditos</h1>

    <p style="text-align:center; font-weight:600; color:#2e7d32;">
  💰 Dinero disponible en caja: ${{ formatoMoneda(dineroEnCaja) }}
</p>


    <!-- ➕ Nuevo crédito -->
    <div class="formulario-credito">
      <h2>"PRÉSTAMOS" Crear nuevo crédito</h2>
      <div class="form-group">
        <label for="nombreCliente">Nombre del cliente</label>
        <input id="nombreCliente" v-model="nuevoCredito.nombre" type="text" placeholder="Nombre del cliente" />
      </div>
      <div class="form-group">
        <label for="montoCredito">Monto del crédito</label>
        <input id="montoCredito" v-model.number="nuevoCredito.monto" type="number" min="1" placeholder="Monto del crédito" />
      </div>
      <div class="form-group">
        <label for="descripcionCredito">Descripción (motivo del crédito)</label>
        <input id="descripcionCredito" v-model="nuevoCredito.descripcion" type="text" placeholder="Ejemplo: Préstamo por emergencia" />
      </div>
      <button class="btn-crear" @click="crearCredito">Otorgar crédito</button>
    </div>

    <!-- 🧾 Créditos activos -->
    <h2 class="CAB">Creditos activos</h2>
        <!-- 🔍 Filtros -->
    <div class="filtros">
      <input v-model="busqueda" placeholder="Buscar por nombre " />
      <input v-model.number="filtroMonto" placeholder="Monto mínimo ($)" type="number" min="0" />
      <button @click="exportarExcel">📅 Excel</button>
      <button @click="exportarPDF">📄 PDF</button>
    </div>
    <div v-for="cliente in clientesOrdenados" :key="cliente.id" class="card-cliente">
      <h2>{{ cliente.nombre }}</h2>
      <p>💸 Deuda actual: <strong>${{ formatoMoneda(cliente.creditoPendiente) }}</strong></p>
      <p v-if="cliente.descripcion" class="descripcion"><strong>Descripción:</strong> {{ cliente.descripcion }}</p>

      <div class="acciones">
        <input
          type="number"
          v-model.number="cliente.pago"
          :max="cliente.creditoPendiente"
          min="1"
          placeholder="Monto a pagar"
        />
        <button @click="registrarPago(cliente)">💰 Registrar pago</button>
        <!-- Botón eliminar eliminado -->
      </div>
    </div>

    <!-- Botón y filtros para historial -->
    <div v-if="historialFinalizadosSucursal.length" class="toggle-historial">
      <button @click="mostrarHistorialFinalizados = !mostrarHistorialFinalizados">
        {{ mostrarHistorialFinalizados ? '🙈 Ocultar historial de préstamos finalizados' : '📚 Ver historial de préstamos finalizados' }}
      </button>

      <div v-if="mostrarHistorialFinalizados" class="filtros" style="margin-top: 1rem;">
        <input type="date" v-model="filtroFechaInicio" />
        <input type="date" v-model="filtroFechaFin" />
      </div>
    </div>

    <!-- ✅ Historial de créditos finalizados -->
    <div v-if="mostrarHistorialFinalizados && historialFiltrado.length" class="historial-finalizados">
      <h2>📚 Créditos Finalizados</h2>
      <table class="tabla-historial">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Monto Final</th>
            <th>Descripción</th>
            <th>Fecha de Finalización</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(credito, i) in historialFiltrado" :key="i">
            <td>{{ credito.nombre }}</td>
            <td>${{ formatoMoneda(credito.monto) }}</td>
            <td>{{ credito.descripcion || '-' }}</td>
            <td>{{ new Date(credito.fecha).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!clientesOrdenados.length">No hay resultados con los filtros aplicados.</p>

    <!-- Toasts -->
    <transition-group name="toast" tag="div" class="toasts-container">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.tipo]">
        {{ toast.mensaje }}
        <button class="close-btn" @click="cerrarToast(toast.id)">×</button>
      </div>
    </transition-group>
    <!-- Modal eliminar eliminado -->
  </div>
</template>



<script>
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  data() {
    return {
      clientes: [],
      historialFinalizados: [],
      busqueda: "",
      filtroMonto: null,
      nuevoCredito: { nombre: "", monto: null, descripcion: "" },
      toasts: [],
      toastId: 0,
      mostrarHistorialFinalizados: false,
      filtroFechaInicio: "",
      filtroFechaFin: "",
      sucursalActual: localStorage.getItem("store_code") || null,
      pagando: false,
      dineroEnCaja: 0, 
    };
  },
  computed: {
    clientesOrdenados() {
      return this.clientes
        .filter(c =>
          c.sucursal === this.sucursalActual &&
          c.creditoPendiente > 0 &&
          (c.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) || c.id.toString().includes(this.busqueda)) &&
          (this.filtroMonto === null || c.creditoPendiente >= this.filtroMonto)
        )
        .sort((a, b) => b.creditoPendiente - a.creditoPendiente)
        .map(c => ({ ...c, pago: c.pago === 0 ? null : c.pago }));
    },
    historialFinalizadosSucursal() {
      return this.historialFinalizados.filter(c => c.sucursal === this.sucursalActual);
    },
    historialFiltrado() {
      return this.historialFinalizadosSucursal.filter(c => {
        const fecha = new Date(c.fecha);
        const inicio = this.filtroFechaInicio ? new Date(this.filtroFechaInicio) : null;
        const fin = this.filtroFechaFin ? new Date(this.filtroFechaFin) : null;
        if (inicio && fecha < inicio) return false;
        if (fin && fecha > fin) return false;
        return true;
      });
    }
  },
  methods: {
  cargarDineroEnCaja() {
    const sucursal = localStorage.getItem("store_code") || "sin_sucursal";
    const hoy = new Date().toISOString().slice(0, 10);

    const cambioInicial = parseFloat(localStorage.getItem(`cambioInicial_${sucursal}`)) || 0;
    const totalAcumulado = parseFloat(localStorage.getItem(`total_acumulado_${sucursal}_${hoy}`)) || 0;

    this.dineroEnCaja = cambioInicial + totalAcumulado;
  },

    crearCredito() {
  const { nombre, monto, descripcion } = this.nuevoCredito;
  const cajaKey = `dinero_en_caja_${this.sucursalActual}`;
  const caja = parseFloat(localStorage.getItem(cajaKey)) || 0;

  if (!nombre.trim() || monto <= 0) {
    this.mostrarToast("⚠️Ingresa un nombre válido y un monto mayor a 0.", "error");
    return;
  }

  if (monto > caja) {
    this.mostrarToast("⚠️Monto excede el dinero disponible en caja.", "error");
    return;
  }

  const existente = this.clientes.find(
    c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.sucursal === this.sucursalActual
  );

  if (existente) {
    existente.creditoPendiente += monto;
    existente.montoInicial += monto;
    existente.descripcion += descripcion ? `; ${descripcion}` : "";
  } else {
    this.clientes.push({
      id: Date.now(),
      nombre: nombre.trim(),
      creditoPendiente: monto,
      montoInicial: monto,
      descripcion: descripcion.trim(),
      sucursal: this.sucursalActual
    });
  }

  const nuevoTotal = caja - monto;
  localStorage.setItem(cajaKey, nuevoTotal.toFixed(2));

  this.nuevoCredito = { nombre: "", monto: null, descripcion: "" };
  this.guardarClientes();
  this.mostrarToast("Crédito otorgado y descontado de caja.", "exito");
  this.dineroEnCaja = nuevoTotal;
},

registrarPago(cliente) {
  if (this.pagando) return;
  this.pagando = true;

  if (!cliente.pago || cliente.pago <= 0) {
    this.mostrarToast("⚠️Monto inválido.", "error");
    this.pagando = false;
    return;
  }

  if (cliente.pago !== cliente.creditoPendiente) {
    this.mostrarToast("⚠️ Solo se permiten pagos exactos que liquiden toda la deuda.", "error");
    this.pagando = false;
    return;
  }

  const index = this.clientes.findIndex(c => c.id === cliente.id);
  const montoPago = cliente.pago;
  const clienteNombre = this.clientes[index].nombre;

  this.clientes[index].creditoPendiente = 0;

  const usuarioActual = JSON.parse(localStorage.getItem("usuario")) || {
    username: "desconocido",
    sucursal: "sin_sucursal"
  };

  const ingreso = {
    tipo: "pago_credito",
    monto: montoPago,
    fecha: new Date().toISOString(),
    sucursal: this.sucursalActual,
    cliente: clienteNombre,
    descripcion: this.clientes[index].descripcion || '',
    usuario: {
      nombre: usuarioActual.username,
      sucursal: this.sucursalActual
    }
  };

  const ingresos = JSON.parse(localStorage.getItem("ingresos_credito") || "[]");
  ingresos.push(ingreso);
  localStorage.setItem("ingresos_credito", JSON.stringify(ingresos));

  this.historialFinalizados.push({
    nombre: clienteNombre,
    monto: this.clientes[index].montoInicial,
    descripcion: this.clientes[index].descripcion,
    fecha: new Date().toISOString(),
    sucursal: this.sucursalActual
  });

  this.clientes.splice(index, 1);
  this.guardarClientes();
  this.mostrarHistorialFinalizados = true;
  this.mostrarToast("Crédito pagado y movido al historial.", "exito");

  const cajaKey = `dinero_en_caja_${this.sucursalActual}`;
  const nuevoTotal = parseFloat(localStorage.getItem(cajaKey)) + montoPago;
  localStorage.setItem(cajaKey, nuevoTotal.toFixed(2));
  window.dispatchEvent(new Event("dinero-en-caja-actualizado"));
  this.dineroEnCaja = nuevoTotal;

  setTimeout(() => {
    this.pagando = false;
  }, 500);
},

    exportarExcel() {
      const data = this.clientesOrdenados.map(c => ({
        fecha: new Date().toLocaleDateString(),
        Nombre: c.nombre,
        "Crédito pendiente": `$${c.creditoPendiente.toFixed(2)}`,
        Descripción: c.descripcion || ""
      }));
      const total = this.clientesOrdenados.reduce((acc, c) => acc + c.creditoPendiente, 0);
      data.push({ Nombre: "TOTAL GENERAL", "Crédito pendiente": `$${total.toFixed(2)}` });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Deudores");
      XLSX.writeFile(wb, "clientes_credito.xlsx");
    },

    exportarPDF() {
      const doc = new jsPDF();
      const data = this.clientesOrdenados.map(c => [
        c.id,
        c.nombre,
        `$${c.creditoPendiente.toFixed(2)}`,
        c.descripcion || ""
      ]);
      const total = this.clientesOrdenados.reduce((acc, c) => acc + c.creditoPendiente, 0);
      data.push(["", "TOTAL GENERAL", `$${total.toFixed(2)}`, ""]);

      doc.autoTable({
        head: [["ID", "Cliente", "Deuda", "Descripción"]],
        body: data
      });
      doc.save("clientes_credito.pdf");
    },

    guardarClientes() {
  const sucursal = this.sucursalActual;
  const clientesKey = `clientes_${sucursal}`;
  const historialKey = `historialFinalizados_${sucursal}`;

  localStorage.setItem(clientesKey, JSON.stringify(this.clientes));
  localStorage.setItem(historialKey, JSON.stringify(this.historialFinalizados));
},


    cargarClientes() {
  const sucursal = this.sucursalActual;
  const clientesKey = `clientes_${sucursal}`;
  const historialKey = `historialFinalizados_${sucursal}`;
  const dineroKey = `dinero_en_caja_${sucursal}`;

  const datos = localStorage.getItem(clientesKey);
  const historial = localStorage.getItem(historialKey);
  this.clientes = datos ? JSON.parse(datos) : [];
  this.historialFinalizados = historial ? JSON.parse(historial) : [];
},


    mostrarToast(mensaje, tipo = "info") {
      const id = this.toastId++;
      this.toasts.push({ id, mensaje, tipo });
      setTimeout(() => this.cerrarToast(id), 4000);
    },

    cerrarToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    },

    formatoMoneda(valor) {
      const numero = parseFloat(valor);
      return isNaN(numero) ? '0.00' : numero.toFixed(2);
    },

    actualizarDineroCaja() {
      this.dineroEnCaja = parseFloat(localStorage.getItem("dinero_en_caja")) || 0;
    }
  },
mounted() {
  this.cargarClientes();            // 🔁 Primero carga todo del localStorage
  this.cargarDineroEnCaja();       // ✅ Después suma cambioInicial + ventas
  window.addEventListener("dinero-en-caja-actualizado", this.actualizarDineroCaja);

  this.cargarClientes();
  window.addEventListener("dinero-en-caja-actualizado", this.actualizarDineroCaja);
},

  beforeUnmount() {
    window.removeEventListener("dinero-en-caja-actualizado", this.actualizarDineroCaja);
  }
};
</script>




<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
.tooltip-container {
  position: absolute;
  top: 25px;
  right: 30px;
  display: inline-block;
  z-index: 10;
}

.creditos-view {
  position: relative;
  max-width: 900px;
  margin: auto;
  padding: 2rem;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
}


.tooltip-icon {
  cursor: pointer;
  font-size: 22px;
}

.tooltip-text {
  width: 360px; /* o ajusta a 340px si lo prefieres */
  visibility: hidden;
  background-color: #333;
  color: #fff;
  text-align: left;
  border-radius: 8px;
  padding: 12px;
  position: absolute;
  z-index: 10;
  top: 30px;
  right: 0;
  font-size: 13px;
  line-height: 1.4;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.3s;
}


.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.creditos-view {
  max-width: 900px;
  margin: auto;
  padding: 2rem;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
}

.creditos-view h1 {
  text-align: center;
  font-weight: 700;
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Filtros */
.filtros {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filtros input {
  flex: 1 1 200px;
  padding: 0.6rem 0.9rem;
  font-size: 1rem;
  border: 2px solid #c8e6c9;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.3s ease;
}

.filtros input:focus {
  border-color: #4caf50;
}

.filtros button {
  background: #4caf50;
  color: white;
  font-weight: bold;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.filtros button:hover {
  background: #2e7d32;
}

/* Formulario */
.formulario-credito {
  background: #f1f8e9;
  padding: 1.5rem;
  border-radius: 10px;
  border: 2px solid #aed581;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #2e7d32;
}

.form-group input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  font-size: 1rem;
  border: 2px solid #c8e6c9;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #4caf50;
}

.btn-crear {
  background: #4caf50;
  color: white;
  font-weight: bold;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: block;
  width: 100%;
  margin-top: 1rem;
}

.btn-crear:hover {
  background: #2e7d32;
}

h2.CAB {
  margin-top: 2rem;
  font-size: 1.8rem;
  color: #2c3e50;
  text-align: center;
}

/* Cards de clientes */
.card-cliente {
  background: white;
  padding: 1.4rem 1.8rem;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
  margin-bottom: 1.2rem;
  border: 2px solid #aed581;
}

.card-cliente h2 {
  margin-bottom: 0.5rem;
  color: #2e7d32;
  font-weight: 700;
}

.card-cliente p {
  margin: 0.3rem 0;
  font-size: 1rem;
  color: #555;
}

.card-cliente .descripcion {
  font-style: italic;
  color: #4caf50;
}

.acciones {
  margin-top: 1rem;
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  align-items: center;
}

.acciones input[type="number"] {
  width: 140px;
  padding: 0.5rem 0.8rem;
  border: 2px solid #c8e6c9;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.acciones input[type="number"]:focus {
  border-color: #4caf50;
}

.acciones button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
}

.acciones button:nth-child(2) {
  background: #4caf50;
  color: white;
}

.acciones button:nth-child(2):hover {
  background: #2e7d32;
}

/* Historial finalizados */
.historial-finalizados {
  background: #e8f5e9;
  border: 2px solid #aed581;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin-top: 2rem;
}

.historial-finalizados h2 {
  color: #2e7d32;
  font-weight: 700;
  margin-bottom: 1rem;
}

/* Toasts */
.toasts-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  background: #4caf50;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(76,175,80,0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 220px;
}

.toast.error {
  background: #e53935;
  box-shadow: 0 4px 10px rgba(229,57,53,0.4);
}

.toast .close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  margin-left: 12px;
}

/* Botón para mostrar historial */
.toggle-historial {
  margin: 1.5rem 0;
  text-align: center;
}

.toggle-historial button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 24px;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(76,175,80,0.4);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.toggle-historial button:hover {
  background-color: #2e7d32;
  box-shadow: 0 6px 12px rgba(46,125,50,0.6);
}

.toggle-historial button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(76,175,80,0.7);
}

.tabla-historial {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
  margin-top: 1rem;
}

.tabla-historial th,
.tabla-historial td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
  color: #555;
  font-size: 1rem;
}

.tabla-historial th {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 600;
}

.tabla-historial tr:last-child td {
  border-bottom: none;
}

/* Responsive */
@media (max-width: 480px) {
  .creditos-view {
    padding: 1rem;
  }

  .formulario-credito,
  .card-cliente,
  .historial-finalizados {
    padding: 1rem;
  }

  .tabla-historial {
    display: block;
    overflow-x: auto;
  }

  .tabla-historial table {
    width: 100%;
    min-width: 500px;
  }

  h1 {
    font-size: 1.8rem;
  }

  .toast {
    font-size: 0.9rem;
    padding: 10px 14px;
  }
}
</style>
