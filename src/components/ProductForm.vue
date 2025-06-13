<template>
  <div class="formulario-producto">
    <h2>Registrar nuevo producto</h2>
    <form @submit.prevent="guardarProducto">
      <input v-model="producto.nombre" type="text" placeholder="Nombre del producto" required />
      <textarea v-model="producto.descripcion" placeholder="Descripción"></textarea>
      <input v-model="producto.categoria" type="text" placeholder="Categoría" />
      <input v-model.number="producto.precio" type="number" step="0.01" placeholder="Precio" required />
      <input v-model.number="producto.stock" type="number" placeholder="Stock" required />
      <input v-model="producto.codigo_barras" type="text" placeholder="Código de Barras" />
      <input v-model="producto.fecha_caducidad" type="date" placeholder="Fecha de Caducidad" />
      <input v-model="producto.unidad_medida" type="text" placeholder="Unidad de Medida" />
      <input v-model="producto.proveedor" type="text" placeholder="Proveedor" />

      <button type="submit">Guardar</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ProductForm',
  data() {
    return {
      producto: {
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: null,
        stock: null,
        codigo_barras: '',
        fecha_caducidad: '',
        unidad_medida: '',
        proveedor: ''
      }
    }
  },
  methods: {
    guardarProducto() {
      // Simulación de guardado (ejemplo localStorage o petición a API)
      const productos = JSON.parse(localStorage.getItem('productos') || '[]')
      productos.push({ id: Date.now(), ...this.producto })
      localStorage.setItem('productos', JSON.stringify(productos))

      alert('Producto guardado con éxito')
      this.$emit('producto-creado')
    }
  }
}
</script>

<style scoped>
.formulario-producto {
  max-width: 500px;
  margin: auto;
}
input, textarea {
  display: block;
  width: 100%;
  margin-bottom: 10px;
}
</style>

<style scoped>
.formulario-producto {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 500px;
  margin: 2rem auto;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
input, textarea {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
button {
  background-color: #28a745;
  color: white;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}
button:hover {
  background-color: #218838;
}
</style>
