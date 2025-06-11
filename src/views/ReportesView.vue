<template>
  <div class="reporte-ventas">
    <h1>Reporte de Ventas</h1>

    <label>Filtrar por fecha:</label>
    <input type="date" v-model="fechaInicio" /> a
    <input type="date" v-model="fechaFin" />

    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Total</th>
          <th>Método de pago</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="venta in ventasFiltradas" :key="venta.id">
          <td>{{ new Date(venta.fecha).toLocaleString() }}</td>
          <td>${{ venta.total }}</td>
          <td>{{ venta.metodoPago }}</td>
        </tr>
      </tbody>
    </table>

    <p><strong>Ingresos Totales: ${{ ingresosTotales }}</strong></p>

    <!-- Botones de exportación -->
    <div class="export-buttons">
      <button @click="exportarPDF">Exportar a PDF</button>
      <button @click="exportarExcel">Exportar a Excel</button>
    </div>
  </div>
</template>

<script>
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default {
  props: ['ventas'],
  data() {
    return {
      fechaInicio: '',
      fechaFin: ''
    };
  },
  computed: {
    ventasFiltradas() {
      return this.ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        const inicio = this.fechaInicio ? new Date(this.fechaInicio) : null;
        const fin = this.fechaFin ? new Date(this.fechaFin) : null;
        if (inicio && fechaVenta < inicio) return false;
        if (fin && fechaVenta > fin) return false;
        return true;
      });
    },
    ingresosTotales() {
      return this.ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);
    }
  },
  methods: {
    exportarPDF() {
      const doc = new jsPDF();
      doc.text("Reporte de Ventas", 14, 10);
      const rows = this.ventasFiltradas.map(v => [
        new Date(v.fecha).toLocaleString(),
        `$${v.total}`,
        v.metodoPago
      ]);
      doc.autoTable({
        head: [["Fecha", "Total", "Método de Pago"]],
        body: rows,
        startY: 20
      });
      doc.save("reporte_ventas.pdf");
    },
    exportarExcel() {
      const data = this.ventasFiltradas.map(v => ({
        Fecha: new Date(v.fecha).toLocaleString(),
        Total: v.total,
        MetodoPago: v.metodoPago
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'reporte_ventas.xlsx');
    }
  }
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #1976d2;
  color: white;
}
.export-buttons {
  margin-top: 1rem;
}
.export-buttons button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.export-buttons button:hover {
  background-color: #125ea6;
}
</style>
