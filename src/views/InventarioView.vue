<template>
  <div class="inventario">
    <h1>Inventario</h1>

    <div class="botones-superior">
      <button class="btn-agregar" @click="agregarProducto">➕ Agregar Producto</button>
      <button class="btn-agregar" @click="abrirModalCategoria">📁 Añadir Categoría</button>

      <div class="filtro-dropdown">
        <select v-model="categoriaSeleccionada" @change="filtrarPorCategoria">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categoriasUnicas" :key="cat">{{ cat }}</option>
        </select>
      </div>

      <input
        class="input-busqueda"
        type="text"
        v-model="terminoBusqueda"
        placeholder="🔍 Buscar producto..."
        @input="aplicarFiltro"
      />
    </div>

    <div class="lista-productos">
      <div
        v-for="producto in productosFiltrados"
        :key="producto.id"
        class="card"
      >
        <img :src="producto.imagen" alt="producto" />
        <h3>{{ producto.nombre }}</h3>
        <p>Categoría: {{ producto.categoria }}</p>
        <p>Precio: ${{ producto.precio }}</p>
        <p>Stock: {{ producto.stock }}</p>

        <div class="acciones">
          <button @click="editarProducto(producto.id)">✏️ Editar</button>
          <button @click="eliminarProducto(producto.id)">🗑️ Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Producto -->
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
                <option v-for="cat in categorias" :key="cat">{{ cat }}</option>
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
export default {
  data() {
    return {
      // Productos iniciales de prueba
      productos: JSON.parse(localStorage.getItem('productos')) || [
        {
          id: 1,
          nombre: 'Camiseta Verde',
          categoria: 'Ropa',
          precio: 199.99,
          stock: 10,
          imagen:
            'https://m.media-amazon.com/images/I/51tc2UgRMXL._AC_UF894,1000_QL80_.jpg'
        },
        {
          id: 2,
          nombre: 'Auriculares Bluetooth',
          categoria: 'Electrónica',
          precio: 599.5,
          stock: 5,
          imagen:
            'https://mobomx.vtexassets.com/arquivos/ids/196876-800-auto?v=638212067600330000&width=800&height=auto&aspect=true'
        }
      ],
      siguienteId: Number(localStorage.getItem('siguienteId')) || 3,
      modalActivo: false,
      modalCategoriaActivo: false,
      productoSeleccionado: null,
      formulario: { nombre: '', categoria: '', precio: 0, stock: 0, imagen: '' },
      formCategoria: { nombre: '' },
      terminoBusqueda: '',
      categoriaSeleccionada: '',
      productosFiltrados: [],
      categorias: JSON.parse(localStorage.getItem('categorias')) || ['Ropa', 'Electrónica']
    };
  },
  computed: {
    categoriasUnicas() {
      // Unificar categorías en productos y categorías creadas para filtro
      const categoriasDeProductos = this.productos.map(p => p.categoria);
      const todasCategorias = new Set([...categoriasDeProductos, ...this.categorias]);
      return Array.from(todasCategorias);
    }
  },
  created() {
    this.productosFiltrados = this.productos;
  },
  methods: {
    agregarProducto() {
      this.productoSeleccionado = null;
      this.formulario = { nombre: '', categoria: '', precio: 0, stock: 0, imagen: '' };
      this.modalActivo = true;
    },
    abrirModalCategoria() {
      this.formCategoria = { nombre: '' };
      this.modalCategoriaActivo = true;
    },
    guardarCategoria() {
      const nombre = this.formCategoria.nombre.trim();
      if (nombre && !this.categorias.includes(nombre)) {
        this.categorias.push(nombre);
        localStorage.setItem('categorias', JSON.stringify(this.categorias));
        this.modalCategoriaActivo = false;
      } else {
        alert('La categoría ya existe o el nombre es inválido.');
      }
    },
    cancelarCategoria() {
      this.modalCategoriaActivo = false;
    },
    editarProducto(id) {
      this.productoSeleccionado = id;
      const producto = this.productos.find(p => p.id === id);
      this.formulario = { ...producto };
      this.modalActivo = true;
    },
    guardarCambios() {
      if (this.productoSeleccionado === null) {
        this.productos.push({ id: this.siguienteId++, ...this.formulario });
        localStorage.setItem('siguienteId', this.siguienteId);
      } else {
        const index = this.productos.findIndex(p => p.id === this.productoSeleccionado);
        if (index !== -1) {
          this.productos[index] = { id: this.productoSeleccionado, ...this.formulario };
        }
      }
      this.modalActivo = false;
      this.guardarProductos();
    },
    eliminarProducto(id) {
      if (confirm('¿Seguro que deseas eliminar este producto?')) {
        this.productos = this.productos.filter(p => p.id !== id);
        this.guardarProductos();
      }
    },
    cancelarEdicion() {
      this.modalActivo = false;
    },
    guardarProductos() {
      localStorage.setItem('productos', JSON.stringify(this.productos));
      this.aplicarFiltro();
    },
    aplicarFiltro() {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      this.productosFiltrados = this.productos.filter(p => {
        const coincideNombre = p.nombre.toLowerCase().includes(termino);
        const coincideCategoria = this.categoriaSeleccionada
          ? p.categoria === this.categoriaSeleccionada
          : true;
        return coincideNombre && coincideCategoria;
      });
    },
    filtrarPorCategoria() {
      this.aplicarFiltro();
    }
  }
};
</script>

<style scoped>
/* Tu CSS sin cambios */
.inventario {
  font-family: 'Segoe UI', sans-serif;
  padding: 2rem;
  background-color: #f4f7f9;
  min-height: 100vh;
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
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
}

.input-busqueda {
  padding: 0.6rem 1rem;
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
  color: #2d3748;
}

.card p {
  margin: 0.2rem 0;
  color: #4a5568;
}

.acciones button {
  margin: 0.3rem;
  background-color: #718096;
  color: white;
  border: none;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.acciones button:hover {
  background-color: #4a5568;
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
</style>
