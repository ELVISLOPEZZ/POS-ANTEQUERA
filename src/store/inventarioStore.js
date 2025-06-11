import { reactive, watch } from 'vue'

const STORAGE_KEY = 'pos_inventario'

function cargarProductos() {
  const productosGuardados = localStorage.getItem(STORAGE_KEY)
  if (productosGuardados) {
    return JSON.parse(productosGuardados)
  }
  return [
    { id: 1, nombre: 'Pan', precio: 10, stock: 50 },
    { id: 2, nombre: 'Café', precio: 20, stock: 30 },
    { id: 3, nombre: 'Refresco', precio: 15, stock: 40 }
  ]
}

const state = reactive({
  productos: cargarProductos(),
  siguienteId: 4
})

// Guardar cambios automáticamente en localStorage
watch(() => state.productos, (productos) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productos))
}, { deep: true })

function obtenerProductos() {
  return state.productos
}

function agregarProducto(producto) {
  producto.id = state.siguienteId++
  state.productos.push(producto)
}

function editarProducto(productoEditado) {
  const index = state.productos.findIndex(p => p.id === productoEditado.id)
  if (index !== -1) {
    state.productos[index] = productoEditado
  }
}

function eliminarProducto(id) {
  const index = state.productos.findIndex(p => p.id === id)
  if (index !== -1) {
    state.productos.splice(index, 1)
  }
}

export default {
  state,
  obtenerProductos,
  agregarProducto,
  editarProducto,
  eliminarProducto
}
