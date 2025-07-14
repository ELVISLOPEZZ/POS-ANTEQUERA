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

    <!-- Tabla de ventas -->
    <div class="table-container">
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
    </div>

    <!-- Botones exportar -->
    <div class="export-buttons">
      <button @click="exportarPDF">Exportar a PDF</button>
      <button @click="exportarExcel">Exportar a Excel</button>
    </div>

    <!-- Modal detalle venta -->
    <ProductoVentaItem
      v-if="ventaSeleccionada"
      :venta="ventaSeleccionada"
      @cerrar="ventaSeleccionada = null"
    />

    <!-- Modal detalle crédito -->
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
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default {
  components: { ProductoVentaItem, DetalleCreditoItem },
  props: ['ventas'],
  data() {
    const hoy = new Date().toISOString().split('T')[0]
    return {
      fechaInicio: hoy,
      fechaFin: hoy,
      filtroMetodo: '',
      filtroCajero: '',
      filtroSucursal: '',
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
        descripcion: pago.descripcion || 'Sin descripción'  // Aquí agregamos la descripción
      }))

      const todasLasVentas = [...this.ventas, ...pagosCreditoFormateados]

      return todasLasVentas.filter(venta => {
        const fechaVenta = new Date(venta.fecha)
        const inicio = new Date(this.fechaInicio)
        const fin = new Date(this.fechaFin)
        const dentroDeRango = fechaVenta >= inicio && fechaVenta <= new Date(fin.getTime() + 86400000 - 1)

        const cajeroNombre = this.obtenerNombreCajero(venta).toLowerCase()
        const coincideMetodo = this.filtroMetodo ? (venta.metodoPago === this.filtroMetodo || venta.estadoCredito === this.filtroMetodo) : true
        const coincideCajero = this.filtroCajero ? cajeroNombre.includes(this.filtroCajero.toLowerCase()) : true
        const coincideSucursal = this.filtroSucursal ? (this.obtenerSucursalVenta(venta) === this.filtroSucursal) : true

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
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Filtros */
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
  outline: none;
  font-size: 0.95rem;
  flex: 1 1 180px;
  min-width: 140px;
}

.filtros input:focus,
.filtros select:focus {
  border-color: #4caf50;
}

/* KPIs */
.resumen {
  background: #e8f5e9;
  border-left: 5px solid #4caf50;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  font-weight: 600;
  color: #2c3e50;
}

.resumen p {
  margin: 0.5rem 0;
  flex: 1 1 200px;
}

/* Tabla: Agregamos contenedor scroll para móvil */
.table-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
  border-radius: 10px;
  background: white;
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 10px;
  overflow: hidden;
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

/* Botones Exportar */
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
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.export-buttons button:hover {
  background: #1b5e20;
}

/* Responsive */
@media (max-width: 768px) {
  .filtros {
    flex-direction: column;
    align-items: stretch;
  }

  .filtros label {
    margin-bottom: 0.2rem;
  }

  .resumen {
    flex-direction: column;
    gap: 0.8rem;
  }

  table, .resumen p {
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
.pago-credito {
  color: red;
  font-weight: bold;
}

.pago-pagado {
  color: green;
  font-weight: bold;
}
</style>
