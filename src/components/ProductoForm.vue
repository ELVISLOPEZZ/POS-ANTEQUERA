<template>
  <form @submit.prevent="submitForm">
    <div>
      <label>Nombre:</label>
      <input v-model="producto.nombre" required />
    </div>
    <div>
      <label>Precio:</label>
      <input type="number" v-model.number="producto.precio" min="0" required />
    </div>
    <div>
      <label>Stock:</label>
      <input type="number" v-model.number="producto.stock" min="0" required />
    </div>
    <button type="submit">{{ producto.id ? 'Guardar' : 'Agregar' }}</button>
    <button type="button" @click="$emit('cancelar')">Cancelar</button>
  </form>
</template>

<script>
export default {
  props: {
    productoEditado: Object
  },
  data() {
    return {
      producto: {
        id: null,
        nombre: '',
        precio: 0,
        stock: 0
      }
    }
  },
  watch: {
    productoEditado: {
      immediate: true,
      handler(nuevo) {
        if (nuevo) {
          this.producto = { ...nuevo }
        } else {
          this.producto = { id: null, nombre: '', precio: 0, stock: 0 }
        }
      }
    }
  },
  methods: {
    submitForm() {
      this.$emit('guardar', { ...this.producto })
    }
  }
}
</script>

<style scoped>
form > div {
  margin-bottom: 1rem;
}
label {
  display: inline-block;
  width: 70px;
}
input {
  padding: 0.3rem;
  width: 200px;
}
button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button[type="submit"] {
  background-color: #4caf50;
  color: white;
}
button[type="button"] {
  background-color: #f44336;
  color: white;
}
</style>

