<template>
  <!-- Toggle tipo burbujita pro -->
  <div class="tab-toggle">
    <div class="toggle-bg" :class="{ 'right': pestañaActiva === 'pagos' }"></div>
    <button
      :class="{ activo: pestañaActiva === 'ventas' }"
      @click="pestañaActiva = 'ventas'"
    >
      Ventas
    </button>
    <button
      :class="{ activo: pestañaActiva === 'pagos' }"
      @click="pestañaActiva = 'pagos'"
    >
      Pagos
    </button>
  </div>

  <div class="reporte-ventas">
    <h1>📊 Reporte de Ventas</h1>

    <!-- Filtros visibles solo si está en pestaña ventas -->
    <div class="filtros" v-if="pestañaActiva === 'ventas'">
      <label>Fecha:</label>
      <input type="date" v-model="fechaInicio" /> a
      <input type="date" v-model="fechaFin" />

      <label>Método de pago:</label>
      <select v-model="filtroMetodo">
        <option value="">Todos</option>
        <option value="efectivo">Efectivo</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="transferencia">Transferencia</option>
        <option value="credito">Crédito</option>
        <option value="pagado">Pagado</option>
      </select>

      <label>Cajero:</label>
      <input type="text" v-model="filtroCajero" placeholder="Nombre del cajero" />

      <label>Sucursal:</label>
      <select v-model="filtroSucursal">
        <option value="">Todas</option>
        <option value="SUCURSAL1">Sucursal 1</option>
        <option value="SUCURSAL2">Sucursal 2</option>
        <option value="SUCURSAL3">Sucursal 3</option>
      </select>
    </div>

    <!-- Tabla de Ventas (solo si pestaña es ventas) -->
    <div class="table-container" v-if="pestañaActiva === 'ventas'">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Cajero</th>
            <th>Sucursal</th>
            <th>Total</th>
            <th>Método de pago</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venta in ventasFiltradasConPagosCredito" :key="venta.id">
            <td>{{ venta.id }}</td>
            <td>{{ new Date(venta.fecha).toLocaleString() }}</td>
            <td>{{ obtenerNombreCajero(venta) }}</td>
            <td>{{ obtenerSucursalVenta(venta) }}</td>
            <td>${{ venta.total.toFixed(2) }}</td>
            <td :class="{ 
              'pago-credito': venta.metodoPago === 'credito', 
              'pago-pagado': venta.metodoPago === 'pagado' || venta.estadoCredito === 'pagado' 
            }">
              {{ venta.metodoPago === 'credito' ? 'Crédito' : (venta.estadoCredito === 'pagado' ? 'Pagado' : venta.metodoPago) }}
            </td>
            <td><button class="ver-detalle" @click="verDetalle(venta)">🔍 Ver</button></td>
          </tr>
        </tbody>
      </table>

      <div class="export-buttons">
        <button @click="exportarPDF">Exportar a PDF</button>
        <button @click="exportarExcel">Exportar a Excel</button>
      </div>
    </div>

    <!-- Aquí se carga el componente CortedeCaja cuando pestaña es 'pagos' -->
    <CortedeCaja v-if="pestañaActiva === 'pagos'" />

    <!-- Modales -->
    <ProductoVentaItem
      v-if="ventaSeleccionada"
      :venta="ventaSeleccionada"
      @cerrar="ventaSeleccionada = null"
    />
    <DetalleCreditoItem
      v-if="creditoSeleccionado"
      :credito="creditoSeleccionado"
      @cerrar="creditoSeleccionado = null"
    />
  </div>
</template>


<script>
import ProductoVentaItem from '../components/ProductoVentaItem.vue'
import DetalleCreditoItem from '../components/DetalleCreditoItem.vue'
import CortedeCaja from '../components/CortedeCaja.vue' // Importa tu componente aquí

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default {
  components: { ProductoVentaItem, DetalleCreditoItem, CortedeCaja },
  props: ['ventas', 'sucursal'],
  data() {
    const hoy = new Date().toISOString().split('T')[0]
    return {
      pestañaActiva: 'ventas', // pestaña inicial
      fechaInicio: hoy,
      fechaFin: hoy,
      filtroMetodo: '',
      filtroCajero: '',
      filtroSucursal: this.sucursal || '',
      ventaSeleccionada: null,
      creditoSeleccionado: null
    }
  },
  computed: {
    ventasFiltradasConPagosCredito() {
      const creditosPagados = JSON.parse(localStorage.getItem('ingresos_credito') || '[]')
      const pagosCreditoFormateados = creditosPagados.map((pago, i) => ({
        id: `PC-${i + 1}`,
        fecha: pago.fecha,
        total: pago.monto,
        metodoPago: 'pagado',
        usuario: pago.usuario ?? { nombre: 'Desconocido', sucursal: pago.sucursal ?? 'Desconocida' },
        estadoCredito: 'pagado',
        cliente: pago.cliente || 'Desconocido',
        sucursal: pago.sucursal ?? 'Desconocida',
        descripcion: pago.descripcion || 'Sin descripción'
      }))

      const todasLasVentas = [...this.ventas, ...pagosCreditoFormateados]

      return todasLasVentas.filter(venta => {
        const fechaVentaStr = new Date(venta.fecha).toISOString().split('T')[0]
        const dentroDeRango = fechaVentaStr >= this.fechaInicio && fechaVentaStr <= this.fechaFin
        const cajeroNombre = this.obtenerNombreCajero(venta).toLowerCase()
        const coincideMetodo = this.filtroMetodo
          ? venta.metodoPago === this.filtroMetodo || venta.estadoCredito === this.filtroMetodo
          : true
        const coincideCajero = this.filtroCajero
          ? cajeroNombre.includes(this.filtroCajero.toLowerCase())
          : true
        const coincideSucursal = this.filtroSucursal
          ? this.obtenerSucursalVenta(venta) === this.filtroSucursal
          : true

        return dentroDeRango && coincideMetodo && coincideCajero && coincideSucursal
      })
    }
  },
  methods: {
    obtenerNombreCajero(venta) {
      if (!venta.usuario) return 'Desconocido'
      if (typeof venta.usuario === 'string') return venta.usuario
      if (typeof venta.usuario === 'object' && venta.usuario.nombre) return venta.usuario.nombre
      return 'Desconocido'
    },
    obtenerSucursalVenta(venta) {
      return venta.usuario?.sucursal || venta.sucursal || 'Desconocida'
    },
    verDetalle(venta) {
      if (venta.metodoPago === 'pagado' && venta.id.startsWith('PC-')) {
        this.creditoSeleccionado = { ...venta }
        this.ventaSeleccionada = null
      } else {
        this.ventaSeleccionada = { ...venta }
        this.creditoSeleccionado = null
      }
    },
    exportarPDF() {
      const doc = new jsPDF()
      doc.text("Reporte de Ventas", 14, 10)
      const rows = this.ventasFiltradasConPagosCredito.map(v => [
        v.id,
        new Date(v.fecha).toLocaleString(),
        this.obtenerNombreCajero(v),
        this.obtenerSucursalVenta(v),
        `$${v.total.toFixed(2)}`,
        v.estadoCredito === 'pendiente' ? 'Crédito' : (v.estadoCredito === 'pagado' ? 'Pagado' : v.metodoPago)
      ])
      doc.autoTable({
        head: [["ID", "Fecha", "Cajero", "Sucursal", "Total", "Método de Pago"]],
        body: rows,
        startY: 20
      })
      doc.save("reporte_ventas.pdf")
    },
    exportarExcel() {
      const data = this.ventasFiltradasConPagosCredito.map(v => ({
        ID: v.id,
        Fecha: new Date(v.fecha).toLocaleString(),
        Cajero: this.obtenerNombreCajero(v),
        Sucursal: this.obtenerSucursalVenta(v),
        Total: v.total,
        MetodoPago: v.estadoCredito === 'pendiente' ? 'Crédito' : (v.estadoCredito === 'pagado' ? 'Pagado' : v.metodoPago)
      }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Ventas")
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([buffer], { type: 'application/octet-stream' })
      saveAs(blob, 'reporte_ventas.xlsx')
    }
  }
}
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

/* =========================
   Contenedor principal
========================= */
.reporte-ventas {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0,0,0,0.08);
}

.reporte-ventas h1 {
  text-align: center;
  font-weight: 700;
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

/* =========================
   Toggle tipo burbuja (pestañas)
========================= */
.tab-toggle {
  position: relative;
  display: flex;                 /* Para que margin: auto funcione y se centre */
  border: 2px solid #4caf50;
  border-radius: 999px;
  background: #e8f5e9;
  padding: 4px;
  width: 250px;
  margin: 0 auto 2rem;          /* Centra horizontalmente */
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 3px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}

.toggle-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: #4caf50;
  border-radius: 999px;
  transition: transform 0.3s ease;
  z-index: 0;
}

.toggle-bg.right {
  transform: translateX(100%);
}

.tab-toggle button {
  flex: 1;
  background: transparent;
  border: none;
  color: #4caf50;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.6rem 0;
  cursor: pointer;
  position: relative;
  z-index: 1;
  border-radius: 999px;
  transition: color 0.3s ease;
}

.tab-toggle button.activo {
  color: white;
}

/* =========================
   Filtros de búsqueda
========================= */
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  justify-content: space-between;
}

.filtros label {
  font-weight: 600;
  color: #2e7d32;
  min-width: 90px;
}

.filtros input,
.filtros select {
  padding: 0.6rem;
  border: 2px solid #c8e6c9;
  border-radius: 6px;
  font-size: 0.95rem;
  flex: 1 1 180px;
  min-width: 140px;
}

.filtros input:focus,
.filtros select:focus {
  border-color: #4caf50;
}

/* =========================
   Tabla y contenedor scroll
========================= */
.table-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

th {
  background: #2e7d32;
  color: white;
  font-weight: 600;
}

td {
  font-size: 0.95rem;
  color: #555;
}

/* =========================
   Botón "Ver detalle"
========================= */
.ver-detalle {
  background: #4caf50;
  color: white;
  padding: 0.4rem 0.9rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.ver-detalle:hover {
  background: #388e3c;
}

/* =========================
   Botones exportar PDF y Excel
========================= */
.export-buttons {
  text-align: center;
  margin-top: 1rem;
}

.export-buttons button {
  background: #2e7d32;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  margin: 0 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.export-buttons button:hover {
  background: #1b5e20;
}

/* =========================
   Animaciones Fade para modales
========================= */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* =========================
   Estados de pago (colores)
========================= */
.pago-credito {
  color: red;
  font-weight: bold;
}

.pago-pagado {
  color: green;
  font-weight: bold;
}

/* =========================
   Responsive - Adaptaciones para móviles
========================= */
@media (max-width: 768px) {
  .filtros {
    flex-direction: column;
    align-items: stretch;
  }

  .filtros label {
    margin-bottom: 0.2rem;
  }

  table, .ver-detalle {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .reporte-ventas {
    padding: 1rem;
  }

  .filtros input,
  .filtros select {
    flex: 1 1 100%;
    min-width: auto;
  }

  .export-buttons button {
    margin: 0.3rem 0;
    width: 100%;
  }
}
</style>
