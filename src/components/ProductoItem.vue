-------------------------------------------------------NO SE ESTA USANDO EN NINGUN LUGAR-------------------------------------------------------
<template>
  <div class="producto-item">
    <h3>{{ producto.nombre }}</h3>
    <p>Precio: ${{ producto.precio }}</p>
    <p>Stock: {{ producto.stock }}</p>
    <button @click="$emit('editar', producto)">Editar</button>
    <button @click="$emit('eliminar', producto.id)">Eliminar</button>
  </div>
</template>

<script>
export default {
  props: {
    producto: Object
  }
}
</script>

<style scoped>
.producto-item {
  border: 1px solid #ccc;
  padding: 1rem;
  margin: 0.5rem;
  border-radius: 6px;
  background: #f9f9f9;
}
button {
  margin-right: 0.5rem;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
button:last-child {
  background-color: #f44336;
}
</style>
