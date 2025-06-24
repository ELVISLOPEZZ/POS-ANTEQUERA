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
  </div>
</template>

<script>
export default {
  props: ['ventas'],
  data() {
    const hoy = new Date().toISOString().split('T')[0]
    return {
      fechaInicio: hoy,
      fechaFin: hoy
    }
  },
  computed: {
    ventasFiltradas() {
      return this.ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha)
        const inicio = new Date(this.fechaInicio)
        const fin = new Date(this.fechaFin)
        // Comparar fechas normalizadas
        return fechaVenta >= inicio && fechaVenta <= new Date(fin.getTime() + 86400000 - 1)
      })
    },
    ingresosTotales() {
      return this.ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0)
    }
  }
}
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
</style>
