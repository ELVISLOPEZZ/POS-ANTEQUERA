<template>
  <div class="reporte-productos">
    <h1>Productos Más Vendidos</h1>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad Vendida</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="producto in productosVendidos" :key="producto.id">
          <td>{{ producto.nombre }}</td>
          <td>{{ producto.cantidadTotal }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: ['ventas'],
  computed: {
    productosVendidos() {
      const ventas = this.ventas || [];
      const contador = {};

      ventas.forEach(venta => {
        venta.productos.forEach(p => {
          if (!contador[p.id]) {
            contador[p.id] = { id: p.id, nombre: p.nombre, cantidadTotal: 0 };
          }
          contador[p.id].cantidadTotal += p.cantidad;
        });
      });

      // Convertir a array y ordenar por cantidad descendente
      return Object.values(contador).sort((a, b) => b.cantidadTotal - a.cantidadTotal);
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
</style>