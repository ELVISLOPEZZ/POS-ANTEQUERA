<template>
  <div class="inventario">

    <!-- Ventana emergente para mensajes temporales -->
    <transition name="fade">
        <div v-if="mensajeEmergente" :class="['alerta-emergente', tipoMensaje]">
        {{ mensajeEmergente }}
      </div>
    </transition>

    <h1>📦Inventario</h1>

    <div v-if="alertaActiva" class="alerta-visual">
      ⚠️ Alerta: Los siguientes productos tienen bajo inventario:
      <ul>
        <li v-for="p in productosBajoStock" :key="p.id">
          • {{ p.nombre }} (Stock: {{ p.stock }})
        </li>
      </ul>
    </div>

    <!-- Alerta de productos caducados -->
    <div v-if="alertaCaducidadActiva" class="alerta-visual alerta-caducados">
      ⚠️ Alerta: Los siguientes productos están caducados o por caducar:
      <ul>
        <li v-for="p in productosCaducados" :key="p.id">
          • {{ p.nombre }} (Caducidad: {{ p.fechaCaducidad }})
        </li>
      </ul>
    </div>

    <div class="botones-superior" style="gap: 0.7rem; flex-wrap: wrap; align-items: center;">
      <button class="btn-agregar" @click="agregarProducto">➕ Agregar Producto</button>
      <button class="btn-agregar" @click="abrirModalCategoria">📁 Añadir Categoría</button>
      <button class="btn-agregar btn-eliminar-categoria" @click="abrirModalEliminarCategoria">🗑️ Eliminar Categoría</button>


      <div class="filtro-dropdown">
        <select v-model="categoriaSeleccionada" @change="aplicarFiltro">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categoriasUnicas" :key="cat">{{ cat }}</option>
        </select>
      </div>

      <input
        class="input-busqueda"
        type="text"
        v-model="terminoBusqueda"
        placeholder="🔍 Buscar producto"
        @input="aplicarFiltro"
        style="min-width: 250px;"
      />
    </div>
    
      <div class="filtro-dropdown">
        <select v-model="filtroStock" @change="aplicarFiltro">
          <option value="todos">Stock</option>
         <option value="conStock">Con stock</option>
          <option value="agotados">Sin Stock</option>
        </select>
      </div>



    <div class="lista-productos">
      <div
        v-for="producto in productosFiltrados"
        :key="producto.id"
        :class="['card', { 'agotado': producto.stock === 0 }]"
      >
        <img :src="producto.imagen" alt="producto" />
        <h3>{{ producto.nombre }}</h3>
        <p>Categoría: {{ producto.categoria }}</p>
        <p>Precio: ${{ producto.precio }}</p>

        <!-- Mostrar stock en rojo si está agotado -->
        <p :class="{ 'stock-agotado': producto.stock === 0 }">
          Stock: {{ producto.stock }}
          <span v-if="producto.stock === 0" class="etiqueta-agotado">AGOTADO</span>
        </p>

        <div class="acciones">
          <button @click="editarProducto(producto.id)">✏️ Editar</button>
          <button @click="eliminarProducto(producto.id)">🗑️ Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Producto -->
    <transition name="fade">
      <div v-if="modalEliminarActivo" class="modal-eliminar-backdrop">
        <div class="modal-eliminar">
          <h3>Eliminar Producto ⚠️</h3>
          <p>¿Seguro que deseas eliminar <strong>"{{ productoAEliminar?.nombre }}"</strong>?</p>
          <div class="modal-eliminar-botones">
            <button class="btn-cancelar" @click="cancelarEliminar">Cancelar</button>
            <button class="btn-eliminar-confirmar" @click="confirmarEliminar">🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    </transition>

<!-- Modal Eliminar Categoría -->
<div v-if="modalEliminarCategoriaActivo" class="modal">
  <div class="modal-contenido">
    <h2>Eliminar Categoría</h2>
    <p>Busca y selecciona una categoría para eliminarla (⚠️ solo si no tiene productos asignados, se creo por error o duplicado).</p>

    <input
      type="text"
      v-model="busquedaCategoriaEliminar"
      placeholder="🔍 Buscar categoría..."
      class="input-busqueda"
    />

    <div class="form-row">
      <select v-model="categoriaAEliminar">
        <option value="" disabled>Seleccione una categoría</option>
        <option
          v-for="cat in categoriasFiltradasEliminar"
          :key="cat"
        >{{ cat }}</option>
      </select>
    </div>

    <div class="modal-acciones">
      <button class="btn-eliminar-confirmar" @click="eliminarCategoria">🗑️ Eliminar</button>
      <button class="btn-cancelar" @click="cancelarEliminarCategoria">❌ Cancelar</button>
    </div>
  </div>
</div>


    <div v-if="modalActivo" class="modal">
      <div class="modal-contenido">
        <h2>{{ productoSeleccionado === null ? 'Agregar Producto' : 'Editar Producto' }}</h2>
        <form @submit.prevent="guardarCambios">
          <div class="form-grid">
            <div class="form-row">
              <label for="nombre">Nombre</label>
              <input id="nombre" v-model="formulario.nombre" required />
            </div>
            <div class="form-row">
              <label for="categoria">Categoría</label>

<select id="categoria" v-model="formulario.categoria" required>
  <option value="" disabled>Seleccione categoría</option>
  <option v-for="cat in categoriasUnicas" :key="cat">{{ cat }}</option>
</select>

            </div>
            <div class="form-row">
              <label for="precio">Precio</label>
              <input
                id="precio"
                v-model.number="formulario.precio"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-row">
              <label for="stock">Stock</label>
              <input id="stock" v-model.number="formulario.stock" type="number" min="0" required />
            </div>
            <div class="form-row">
              <label for="codigoBarras">Código de Barras</label>
              <input
                id="codigoBarras"
                v-model="formulario.codigoBarras"
                type="text"
                pattern="\d{1,13}"
                maxlength="13"
                inputmode="numeric"
                required
              />
            </div>
            <div class="form-row">
              <label for="fechaCaducidad">Caducidad</label>
              <input id="fechaCaducidad" v-model="formulario.fechaCaducidad" type="date" required />
            </div>
            <div class="form-row form-row-full">
              <label for="imagen">URL de imagen</label>
              <input id="imagen" v-model="formulario.imagen" />
            </div>
          </div>
          <div class="modal-acciones">
            <button type="submit" class="btn-guardar">💾 Guardar</button>
            <button type="button" class="btn-cancelar" @click="cancelarEdicion">❌ Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Categoría -->
    <div v-if="modalCategoriaActivo" class="modal">
      <div class="modal-contenido">
        <h2>Añadir Categoría</h2>
        <form @submit.prevent="guardarCategoria">
          <div class="form-grid">
            <div class="form-row form-row-full">
              <label for="nombreCategoria">Nombre de la Categoría</label>
              <input
                id="nombreCategoria"
                v-model="formCategoria.nombre"
                required
                placeholder="Ejemplo: Electrónica"
              />
            </div>
          </div>
          <div class="modal-acciones">
            <button type="submit" class="btn-guardar">💾 Guardar</button>
            <button type="button" class="btn-cancelar" @click="cancelarCategoria">❌ Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { obtenerProductosPorSucursal } from '../productos.js'
export default {
  data() {
    return {
      obtenerProductosPorSucursal,
      sucursal: localStorage.getItem('store_code') || '',
      productos: [],
      siguienteId: Number(localStorage.getItem('siguienteId')) || 4,
      modalActivo: false,
      modalCategoriaActivo: false,
      productoSeleccionado: null,
      formulario: { nombre: '', categoria: '', precio: 0, stock: 0, imagen: '', codigoBarras: '', fechaCaducidad: '' },
      formCategoria: { nombre: '' },
      terminoBusqueda: '',
      categoriaSeleccionada: '',
      filtroStock: 'todos',   // filtro stock: todos, agotados, conStock
      productosFiltrados: [],
      alertaActiva: false,
      productosBajoStock: [],
      categoriasPorSucursal: JSON.parse(localStorage.getItem('categoriasPorSucursal')) || {},
      mensajeEmergente: '',
      modalEliminarActivo: false,
      productoAEliminar: null,
      productosCaducados: [],
      alertaCaducidadActiva: false,
      mensajeEmergente: '',
      tipoMensaje: '', // ✅ nuevo: puede ser 'exito' o 'error'
      modalEliminarCategoriaActivo: false,
categoriaAEliminar: '',
busquedaCategoriaEliminar: '',

    }
  },
computed: {
categoriasUnicas() {
  // Categorías de productos reales en esta sucursal
  const categoriasProductos = this.productos.map(p => p.categoria)
  // Categorías creadas manualmente para esta sucursal
  const creadasSucursal = this.categoriasPorSucursal[this.sucursal] || []
  const todas = new Set([...categoriasProductos, ...creadasSucursal])
  return Array.from(todas)
},
categoriasFiltradasEliminar() {
  const todas = this.categoriasPorSucursal[this.sucursal] || []
  const termino = this.busquedaCategoriaEliminar.toLowerCase()
  return todas.filter(cat => cat.toLowerCase().includes(termino))
},
  },
  created() {
    let storeCode = localStorage.getItem('store_code')
    if (!storeCode) {
      storeCode = 'SUCURSAL1'
      localStorage.setItem('store_code', storeCode)
    }
    this.sucursal = storeCode
    this.refrescarProductos()
    this.aplicarFiltro()
    this.verificarBajoInventario()
  },
  methods: {
    verificarBajoInventario() {
      const umbral = 5
      this.productosBajoStock = this.productos.filter(p => p.stock <= umbral)
      this.alertaActiva = this.productosBajoStock.length > 0
      const hoy = new Date().toISOString().slice(0, 10)
      this.productosCaducados = this.productos.filter(p => p.fechaCaducidad && p.fechaCaducidad <= hoy)
      this.alertaCaducidadActiva = this.productosCaducados.length > 0
    },
    agregarProducto() {
      this.productoSeleccionado = null
      this.formulario = { nombre: '', categoria: '', precio: 0, stock: 0, imagen: '', codigoBarras: '', fechaCaducidad: '' }
      this.modalActivo = true
    },
    abrirModalCategoria() {
      this.formCategoria = { nombre: '' }
      this.modalCategoriaActivo = true
    },
guardarCategoria() {
  const nombre = this.formCategoria.nombre.trim()

  if (!nombre) {
    this.tipoMensaje = 'error'
    this.mensajeEmergente = '❌ El nombre no puede estar vacío.'
    setTimeout(() => this.mensajeEmergente = '', 3000)
    return
  }

  // Inicializar si no existe aún la sucursal
  if (!this.categoriasPorSucursal[this.sucursal]) {
    this.categoriasPorSucursal[this.sucursal] = []
  }

  // Verificar si ya existe en esta sucursal
  const yaExiste = this.categoriasPorSucursal[this.sucursal].includes(nombre) ||
                   this.productos.some(p => p.categoria === nombre)

  if (yaExiste) {
    this.tipoMensaje = 'advertencia'
    this.mensajeEmergente = `⚠️ La categoría "${nombre}" ya existe en esta sucursal.`
    setTimeout(() => this.mensajeEmergente = '', 4000)
    return
  }

  // Agregar categoría a la sucursal
  this.categoriasPorSucursal[this.sucursal].push(nombre)
  localStorage.setItem('categoriasPorSucursal', JSON.stringify(this.categoriasPorSucursal))

  this.tipoMensaje = 'exito'
  this.mensajeEmergente = `✅ Categoría "${nombre}" añadida a ${this.sucursal}.`
  this.modalCategoriaActivo = false
  this.formCategoria.nombre = ''

  // Refrescar para filtros
  this.refrescarProductos()
  setTimeout(() => this.mensajeEmergente = '', 3000)
},
abrirModalEliminarCategoria() {
  this.busquedaCategoriaEliminar = ''
  this.categoriaAEliminar = ''
  this.modalEliminarCategoriaActivo = true
},

cancelarEliminarCategoria() {
  this.modalEliminarCategoriaActivo = false
},

eliminarCategoria() {
  const categoria = this.categoriaAEliminar
  if (!categoria) {
    this.tipoMensaje = 'error'
    this.mensajeEmergente = '❌ Debes seleccionar una categoría.'
    setTimeout(() => (this.mensajeEmergente = ''), 3000)
    return
  }

  const tieneProductos = this.productos.some(p => p.categoria === categoria)
  if (tieneProductos) {
    this.tipoMensaje = 'error'
    this.mensajeEmergente = `⚠️ No se puede eliminar. Existen productos con la categoría "${categoria}".`
    setTimeout(() => (this.mensajeEmergente = ''), 4000)
    return
  }

  const categorias = this.categoriasPorSucursal[this.sucursal] || []
  this.categoriasPorSucursal[this.sucursal] = categorias.filter(c => c !== categoria)

  localStorage.setItem('categoriasPorSucursal', JSON.stringify(this.categoriasPorSucursal))

  this.tipoMensaje = 'exito'
  this.mensajeEmergente = `✅ Categoría "${categoria}" eliminada correctamente.`
  this.modalEliminarCategoriaActivo = false
  this.categoriaAEliminar = ''

  this.refrescarProductos()
  setTimeout(() => (this.mensajeEmergente = ''), 3000)
},
    cancelarCategoria() {
      this.modalCategoriaActivo = false
    },
    editarProducto(id) {
      this.productoSeleccionado = id
      const producto = this.productos.find(p => p.id === id)
      this.formulario = { ...producto }
      this.modalActivo = true
    },
guardarCambios() {
  const codigo = this.formulario.codigoBarras?.toString().trim() || ''

  if (!/^\d{1,13}$/.test(codigo)) {
    this.tipoMensaje = 'error'
    this.mensajeEmergente = '❌ El código de barras debe tener solo números y máximo 13 dígitos.'
    setTimeout(() => {
      this.mensajeEmergente = ''
      this.tipoMensaje = ''
    }, 4000)
    return
  }

  let todosLosProductos = JSON.parse(localStorage.getItem('productos')) || []
  const esNuevo = this.productoSeleccionado === null

  // ✅ Filtramos los productos SOLO de esta sucursal
  const productosSucursal = todosLosProductos.filter(p => p.sucursal === this.sucursal)

  // ✅ Verificamos si ya existe un producto con el mismo código en esta sucursal
  const yaExiste = productosSucursal.some(p =>
    p.codigoBarras === codigo &&
    (esNuevo || p.id !== this.productoSeleccionado)
  )

  if (yaExiste) {
    this.tipoMensaje = 'error'
    this.mensajeEmergente = `❌ Ya existe un producto con ese código de barras en la sucursal "${this.sucursal}".`
    setTimeout(() => {
      this.mensajeEmergente = ''
      this.tipoMensaje = ''
    }, 4000)
    return
  }

  if (esNuevo) {
    const nuevoProducto = {
      id: this.siguienteId++,
      ...this.formulario,
      codigoBarras: codigo,
      sucursal: this.sucursal
    }
    todosLosProductos.push(nuevoProducto)
  } else {
    const index = todosLosProductos.findIndex(p => p.id === this.productoSeleccionado)
    if (index !== -1) {
      todosLosProductos[index] = {
        id: this.productoSeleccionado,
        ...this.formulario,
        codigoBarras: codigo,
        sucursal: this.sucursal
      }
    }
  }

  localStorage.setItem('siguienteId', this.siguienteId)
  localStorage.setItem('productos', JSON.stringify(todosLosProductos))
  this.modalActivo = false
  this.refrescarProductos()

  this.tipoMensaje = 'exito'
  this.mensajeEmergente = esNuevo
    ? '✅ Producto creado exitosamente'
    : '✏️✅ Producto editado correctamente'

  setTimeout(() => {
    this.mensajeEmergente = ''
    this.tipoMensaje = ''
  }, 3000)
},
    eliminarProducto(id) {
      const producto = this.productos.find(p => p.id === id)
      if (producto) {
        this.abrirModalEliminar(producto)
      }
    },
    cancelarEdicion() {
      this.modalActivo = false
    },
    refrescarProductos() {
      const todosLosProductos = JSON.parse(localStorage.getItem('productos')) || []
      this.productos = todosLosProductos.filter(p => p.sucursal === this.sucursal)
      this.aplicarFiltro()
      this.verificarBajoInventario()
    },
    aplicarFiltro() {
      const termino = this.terminoBusqueda.toLowerCase().trim()
      this.productosFiltrados = this.productos.filter(p => {
        const coincideNombre = p.nombre.toLowerCase().includes(termino)
        const coincideCategoria = this.categoriaSeleccionada
          ? p.categoria === this.categoriaSeleccionada
          : true
        let cumpleFiltroStock = true
        if (this.filtroStock === 'agotados') {
          cumpleFiltroStock = p.stock === 0
        } else if (this.filtroStock === 'conStock') {
          cumpleFiltroStock = p.stock > 0
        }
        return coincideNombre && coincideCategoria && cumpleFiltroStock
      })
    },
    abrirModalEliminar(producto) {
      this.productoAEliminar = producto
      this.modalEliminarActivo = true
    },
    cancelarEliminar() {
      this.modalEliminarActivo = false
      this.productoAEliminar = null
    },
    confirmarEliminar() {
      if (!this.productoAEliminar) return
      let todosLosProductos = JSON.parse(localStorage.getItem('productos')) || []
      todosLosProductos = todosLosProductos.filter(p => p.id !== this.productoAEliminar.id)
      localStorage.setItem('productos', JSON.stringify(todosLosProductos))
      this.refrescarProductos()
      this.modalEliminarActivo = false
      this.productoAEliminar = null
      this.mensajeEmergente = 'Producto eliminado correctamente ❌'
      setTimeout(() => {
        this.mensajeEmergente = ''
      }, 3000)
    }
  }
}
</script>


<style scoped>
.inventario {
  font-family: 'Segoe UI', sans-serif;
  padding: 2rem;
  background-color: #f4f7f9;
  min-height: 100vh;
}

.inventario h1 {
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 700;
  font-size: 2.4rem;
  letter-spacing: 0.5px;
  color: #2c3e50;
  margin-bottom: 1.2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.botones-superior {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.btn-agregar {
  background-color: #38a169;
  color: white;
  font-weight: 600;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-agregar:hover {
  background-color: #2f855a;
}

.filtro-dropdown select {
  padding: 0.6rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
}

.input-busqueda {
  padding: 0.8rem 0.1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  width: 250px;
}

.lista-productos {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
}

.card {
  background-color: white;
  padding: 1rem;
  border-radius: 12px;
  width: 220px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card img {
  width: 100%;
  height: 130px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.card h3 {
  margin-bottom: 0.3rem;
  color: #482d2d;
}

.card p {
  margin: 0.2rem 0;
  color: #4a5568;
}

.acciones button {
  margin: 0.3rem;
  background-color: #0066ff;
  color: white;
  border: none;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.acciones button:first-child:hover {
  background-color: #2980b9;
}

.acciones button:last-child {
  background-color: #e53e3e;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(229, 72, 66, 0.5);
  transition: background-color 0.3s, box-shadow 0.3s;
}

.acciones button:last-child:hover {
  background-color: #c53030;
  box-shadow: 0 6px 15px rgba(197, 48, 48, 0.7);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-contenido {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.modal h2 {
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  color: #2d3748;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
}

.form-row {
  display: flex;
  flex-direction: column;
}

.form-row-full {
  grid-column: 1 / -1;
}

.form-row label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #4a5568;
}

.form-row input,
.form-row select {
  padding: 0.55rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-guardar {
  background-color: #38a169;
  color: white;
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.btn-cancelar {
  background-color: #e53e3e;
  color: white;
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.alerta {
  background-color: #ffeeba;
  color: #856404;
  border: 1px solid #f5c6cb;
  border-left: 8px solid #ffc107;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1rem 0;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  animation: aparecer 0.3s ease-out;
  position: relative;
}

.alerta::before {
  content: "⚠️ ";
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

@keyframes aparecer {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alerta-visual {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  border-left: 8px solid #ffc107;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  animation: aparecer 0.3s ease-out;
}

.alerta-visual ul {
  margin: 0.5rem 0 0 1rem;
  padding: 0;
  list-style: none;
}

.alerta-emergente {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #38a169;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(56, 161, 105, 0.6);
  font-weight: 700;
  font-size: 1rem;
  z-index: 9999;
  user-select: none;
  cursor: default;
  animation: aparecerEmergente 0.3s ease forwards;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

@keyframes aparecerEmergente {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === Modal Eliminar Producto Mejorado === */
.modal-eliminar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 11000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-eliminar {
  background: #fff;
  padding: 2rem 3rem;
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  color: #e53e3e;
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-eliminar h3 {
  margin-bottom: 1.2rem;
  font-size: 1.8rem;
  letter-spacing: 0.03em;
  color: #e53e3e;
}

.modal-eliminar p {
  margin-bottom: 2rem;
  font-size: 1.15rem;
  color: #555;
  font-weight: 500;
  line-height: 1.4;
}

.modal-eliminar-botones {
  display: flex;
  justify-content: center;
  gap: 1.8rem;
}

.btn-cancelar {
  background-color: #a0aec0;
  color: #ffffff;
  padding: 0.6rem 1.6rem;
  font-weight: 700;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  box-shadow: 0 2px 6px rgba(162, 192, 160, 0.5);
  user-select: none;
}

.btn-cancelar:hover {
  background-color: #718096;
  color: #fff;
  box-shadow: 0 4px 10px rgba(113, 128, 150, 0.7);
}

.btn-eliminar-confirmar {
  background-color: #e53e3e;
  color: white;
  padding: 0.6rem 1.8rem;
  font-weight: 700;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.6);
  user-select: none;
}

.btn-eliminar-confirmar:hover {
  background-color: #c53030;
  box-shadow: 0 6px 18px rgba(197, 48, 48, 0.8);
}

.modal-eliminar .icono-alerta {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: #e53e3e;
  animation: aparecer 0.4s ease;
}

.alerta-caducados {
  border-left-color: #e53e3e !important;
  background-color: #fff0f0 !important;
  color: #9b2c2c !important;
}

/* === Responsive con 2 columnas para cards === */
.lista-productos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.2rem;
}


@media (max-width: 768px) {
  .lista-productos {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .lista-productos {
    grid-template-columns: 1fr;
  }

  /* Estirar alertas al 100% ancho */
  .alerta,
  .alerta-visual {
    width: 100%;
    box-sizing: border-box;
  }

  /* Botones del modal eliminar emparejados con mismo ancho */
  .modal-eliminar-botones {
    flex-direction: column;
    gap: 1rem;
  }
  .modal-eliminar-botones button {
    width: 100%;
    padding-left: 0;
    padding-right: 0;
  }
}

/* Asegúrate que las cards respondan bien al tamaño */
.card {
  background-color: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}

.card img {
  width: 100%;
  height: 130px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.card h3 {
  margin-bottom: 0.4rem;
  font-size: clamp(1rem, 2vw, 1.2rem);
}

.card p {
  margin: 0.2rem 0;
  color: #4a5568;
  font-size: clamp(0.9rem, 1.8vw, 1rem);
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.6rem;
}

.acciones button {
  padding: 0.5rem 0.9rem;
  font-size: 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.card {
  background-color: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%; /* <-- Importante para que respete el grid */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s ease;
}
/* Estilo para productos agotados */
.card.agotado {
  background-color: #ffe5e5; /* Fondo rojo muy claro */
  border: 1.5px solid #e53e3e; /* Borde rojo */
  box-shadow: 0 0 8px rgba(229, 62, 62, 0.3);
}

.card.agotado h3,
.card.agotado p {
  color: #9b2c2c; /* Texto rojo oscuro */
  font-weight: 700;
}

/* Etiqueta pequeña "AGOTADO" junto al stock */
.etiqueta-agotado {
  background-color: #e53e3e;
  color: white;
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  margin-left: 0.5rem;
  font-weight: 700;
  vertical-align: middle;
}

/* Stock en rojo cuando está agotado */
.stock-agotado {
  color: #c53030;
  font-weight: 700;
}




/* Botón / checkbox personalizado para filtro de stock */
.filtro-stock {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-weight: 600;
  color: #2c3e50;
  user-select: none;
  padding: 0.4rem 0.8rem;
  border: 2px solid #38a169;
  border-radius: 8px;
  background-color: white;
  transition: background-color 0.2s, color 0.2s;
}

.filtro-stock input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.filtro-stock:hover {
  background-color: #38a169;
  color: white;
}

.filtro-stock.activo {
  background-color: #38a169;
  color: white;
  border-color: #2f855a;
}

.alerta-emergente {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 15px 25px;
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.3s ease-in-out;
  animation: slideDown 0.5s ease-out;
}

/* Éxito */
.alerta-emergente.exito {
  background-color: #d4edda;
  color: #155724;
  border: 2px solid #28a745;
}

/* Error */
.alerta-emergente.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 2px solid #dc3545;
}

.alerta-emergente.advertencia {
  background-color: #ffe08a;
  color: #7c5c00;
  border: 1px solid #ff0000;
}

.btn-eliminar-confirmar {
  background-color: #fe2f2c;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px; 
  transition: background-color 0.3s;
}


.modal .input-busqueda {
  margin-bottom: 10px;
}


/* Animación */
@keyframes slideDown {
  from {
    transform: translateX(-50%) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
</style>
