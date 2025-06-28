<template>
  <div class="reporte-ventas">
    <h1>Reporte de Ventas</h1>

    <!-- Filtros -->
    <div class="filtros">
      <label>Fecha:</label>
      <input type="date" v-model="fechaInicio" /> a
      <input type="date" v-model="fechaFin" />

      <label>Método de pago:</label>
      <select v-model="filtroMetodo">
        <option value="">Todos</option>
        <option value="efectivo">Efectivo</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="transferencia">Transferencia</option>
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

    <!-- KPIs -->
    <div class="resumen">
      <p>Total de Ventas: <strong>{{ ventasFiltradas.length }}</strong></p>
      <p>Ingresos Totales: <strong>${{ ingresosTotales.toFixed(2) }}</strong></p>
      <p>Promedio por Venta: <strong>${{ promedioVenta.toFixed(2) }}</strong></p>
    </div>

    <!-- Tabla -->
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
        <tr v-for="venta in ventasFiltradas" :key="venta.id">
          <td>{{ venta.id }}</td>
          <td>{{ new Date(venta.fecha).toLocaleString() }}</td>
          <td>{{ venta.usuario?.nombre || 'N/A' }}</td>
          <td>{{ venta.usuario?.sucursal || 'N/A' }}</td>
          <td>${{ venta.total.toFixed(2) }}</td>
          <td>{{ venta.metodoPago }}</td>
          <td><button class="ver-detalle" @click="verDetalle(venta)">🔍 Ver</button></td>
        </tr>
      </tbody>
    </table>

    <!-- Botones exportar -->
    <div class="export-buttons">
      <button @click="exportarPDF">Exportar a PDF</button>
      <button @click="exportarExcel">Exportar a Excel</button>
    </div>

    <!-- Modal de detalles -->
    <ProductoVentaItem v-if="ventaSeleccionada" :venta="ventaSeleccionada" @cerrar="ventaSeleccionada = null" />
  </div>
</template>

<script>
import ProductoVentaItem from '../components/ProductoVentaItem.vue'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default {
  components: { ProductoVentaItem },
  props: ['ventas'],
  data() {
    const hoy = new Date().toISOString().split('T')[0]
    return {
      fechaInicio: hoy,
      fechaFin: hoy,
      filtroMetodo: '',
      filtroCajero: '',
      filtroSucursal: '',
      ventaSeleccionada: null
    }
  },
  computed: {
    ventasFiltradas() {
      return this.ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha)
        const inicio = new Date(this.fechaInicio)
        const fin = new Date(this.fechaFin)
        const dentroDeRango = fechaVenta >= inicio && fechaVenta <= new Date(fin.getTime() + 86400000 - 1)
        const coincideMetodo = this.filtroMetodo ? venta.metodoPago === this.filtroMetodo : true
        const coincideCajero = this.filtroCajero ? venta.usuario?.nombre?.toLowerCase().includes(this.filtroCajero.toLowerCase()) : true
        const coincideSucursal = this.filtroSucursal ? (venta.usuario?.sucursal === this.filtroSucursal) : true
        return dentroDeRango && coincideMetodo && coincideCajero && coincideSucursal
      })
    },
    ingresosTotales() {
      return this.ventasFiltradas.reduce((sum, v) => sum + v.total, 0)
    },
    promedioVenta() {
      return this.ventasFiltradas.length ? this.ingresosTotales / this.ventasFiltradas.length : 0
    }
  },
  methods: {
    verDetalle(venta) {
      this.ventaSeleccionada = JSON.parse(JSON.stringify(venta))
    },
    exportarPDF() {
      const doc = new jsPDF()
      doc.text("Reporte de Ventas", 14, 10)
      const rows = this.ventasFiltradas.map(v => [
        v.id,
        new Date(v.fecha).toLocaleString(),
        v.usuario?.nombre || 'N/A',
        v.usuario?.sucursal || 'N/A',
        `$${v.total.toFixed(2)}`,
        v.metodoPago
      ])
      doc.autoTable({
        head: [["ID", "Fecha", "Cajero", "Sucursal", "Total", "Método de Pago"]],
        body: rows,
        startY: 20
      })
      doc.save("reporte_ventas.pdf")
    },
    exportarExcel() {
      const data = this.ventasFiltradas.map(v => ({
        ID: v.id,
        Fecha: new Date(v.fecha).toLocaleString(),
        Cajero: v.usuario?.nombre || 'N/A',
        Sucursal: v.usuario?.sucursal || 'N/A',
        Total: v.total,
        MetodoPago: v.metodoPago
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
.reporte-ventas {
  max-width: 1100px;
  margin: auto;
  padding: 2rem;
  background: #fff;
  font-family: 'Poppins', sans-serif;
}
.filtros {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.filtros label {
  font-weight: 600;
  color: #333;
}
.filtros input,
.filtros select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-family: 'Poppins', sans-serif;
}
.resumen {
  margin-bottom: 1rem;
  background: #f1f8f2;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.resumen p {
  font-weight: 600;
  margin: 0.5rem 0;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: #fefefe;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
}
th, td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
}
th {
  background-color: #2e7d32;
  color: white;
  text-transform: uppercase;
}
.ver-detalle {
  background-color: #388e3c;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.ver-detalle:hover {
  background-color: #256429;
}
.export-buttons {
  margin-top: 2rem;
  text-align: right;
}
.export-buttons button {
  margin-left: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #4caf50;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.export-buttons button:hover {
  background-color: #2e7d32;
}
</style>