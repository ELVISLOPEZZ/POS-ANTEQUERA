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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.reporte-ventas {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0,0,0,0.08);
}

.reporte-ventas h1 {
  font-weight: 700;
  font-size: 2.4rem;
  letter-spacing: 0.5px;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

th, td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.95rem;
}

th {
  background-color: #2e7d32;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
}

tr:last-child td {
  border-bottom: none;
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

