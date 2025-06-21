-------------------------------------------------------NO SE ESTA USANDO EN NINGUN LUGAR-------------------------------------------------------
<template>
  <div class="carrito">
    <h3>Carrito</h3>
    <div v-if="carrito.length === 0">No hay productos</div>
    <ul>
      <li v-for="item in carrito" :key="item.id">
        {{ item.nombre }} x {{ item.cantidad }} = ${{ (item.precio * item.cantidad).toFixed(2) }}
        <button @click="$emit('eliminar', item.id)">🗑</button>
      </li>
    </ul>
    <hr />
    <p><strong>Total:</strong> ${{ total.toFixed(2) }}</p>
  </div>
</template>

<script>
export default {
  props: ['carrito'],
  emits: ['eliminar'],
  computed: {
    total() {
      return this.carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    }
  }
}
</script>

<style scoped>
.carrito {
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 0.5rem 0;
}
button {
  margin-left: 1rem;
  background: red;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>
