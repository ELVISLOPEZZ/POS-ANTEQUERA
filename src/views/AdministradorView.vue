<template>
  <div class="admin-view">
    <h1>Gestión de Personal y Sucursales</h1>

    <!-- FORMULARIO -->
    <form @submit.prevent="registrarUsuario" class="formulario">
      <div class="campo">
        <label>Usuario:</label>
        <input v-model="nuevoUsuario.username" type="text" required />
      </div>

      <div class="campo">
        <label>Contraseña:</label>
        <input v-model="nuevoUsuario.password" type="password" required />
      </div>

      <div class="campo">
        <label>Rol:</label>
        <select v-model="nuevoUsuario.rol" required>
          <option disabled value="">-- Selecciona un rol --</option>
          <option value="admin">Administrador</option>
          <option value="cajero">Cajero</option>
        </select>
      </div>

      <div class="campo">
        <label>Sucursal:</label>
        <select v-model="nuevoUsuario.sucursal" required>
          <option disabled value="">-- Selecciona una sucursal --</option>
          <option value="SUCURSAL1">Sucursal 1</option>
          <option value="SUCURSAL2">Sucursal 2</option>
          <option value="SUCURSAL3">Sucursal 3</option>
        </select>
      </div>

      <button type="submit" class="btn-guardar">
        {{ modoEdicion ? 'Actualizar Usuario' : 'Guardar Usuario' }}
      </button>
    </form>

    <div v-if="mensaje" class="mensaje">{{ mensaje }}</div>

    <!-- TABLA DE USUARIOS -->
    <table v-if="usuarios.length" class="tabla-usuarios">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Contraseña</th>
          <th>Rol</th>
          <th>Sucursal</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in usuarios" :key="index">
          <td>{{ user.username }}</td>
          <td>{{ user.password }}</td>
          <td>{{ user.rol }}</td>
          <td>{{ user.sucursal }}</td>
          <td>
            <button class="btn-eliminar" @click="confirmarEliminacion(index)">Eliminar</button>
            <button class="btn-editar" @click="editarUsuario(index)">Editar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- MODAL DE CONFIRMACIÓN -->
    <div v-if="modalActivo" class="modal-overlay">
      <div class="modal-contenido">
        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
        <div class="modal-botones">
          <button @click="eliminarUsuario" class="btn-confirmar">Sí</button>
          <button @click="modalActivo = false" class="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usuarios as usuariosBase } from '../auth.js'

export default {
  data() {
    return {
      nuevoUsuario: {
        username: '',
        password: '',
        rol: '',
        sucursal: ''
      },
      usuarios: [],
      mensaje: '',
      modoEdicion: false,
      indiceEdicion: null,
      modalActivo: false,
      usuarioAEliminarIndex: null
    }
  },
  mounted() {
    this.cargarUsuarios()
  },
  methods: {
    cargarUsuarios() {
      // Si hay usuarios en localStorage, los carga
      let usuariosLS = JSON.parse(localStorage.getItem('usuarios_custom'))
      if (usuariosLS && usuariosLS.length) {
        this.usuarios = usuariosLS
      } else {
        // Si no hay, carga los base de auth.js y guarda en localStorage
        this.usuarios = [...usuariosBase]
        localStorage.setItem('usuarios_custom', JSON.stringify(this.usuarios))
      }
    },
    registrarUsuario() {
      if (
        !this.nuevoUsuario.username.trim() ||
        !this.nuevoUsuario.password.trim() ||
        !this.nuevoUsuario.rol ||
        !this.nuevoUsuario.sucursal
      ) {
        this.mensaje = 'Por favor, completa todos los campos correctamente.'
        setTimeout(() => (this.mensaje = ''), 3000)
        return
      }

      // Verifica que el username sea único (excepto cuando edita)
      const existeUsuario = this.usuarios.some(
        (u, i) =>
          u.username === this.nuevoUsuario.username &&
          (!this.modoEdicion || i !== this.indiceEdicion)
      )
      if (existeUsuario) {
        this.mensaje = 'El nombre de usuario ya existe. Elige otro.'
        setTimeout(() => (this.mensaje = ''), 3000)
        return
      }

      if (this.modoEdicion) {
        this.usuarios[this.indiceEdicion] = { ...this.nuevoUsuario }
        this.mensaje = 'Usuario actualizado exitosamente.'
        this.modoEdicion = false
        this.indiceEdicion = null
      } else {
        this.usuarios.push({ ...this.nuevoUsuario })
        this.mensaje = 'Usuario registrado exitosamente.'
      }

      // Actualiza localStorage
      localStorage.setItem('usuarios_custom', JSON.stringify(this.usuarios))

      this.nuevoUsuario = { username: '', password: '', rol: '', sucursal: '' }
      setTimeout(() => (this.mensaje = ''), 3000)
    },
    editarUsuario(index) {
      const usuario = this.usuarios[index]
      this.nuevoUsuario = { ...usuario }
      this.modoEdicion = true
      this.indiceEdicion = index
      this.mensaje = `Editando usuario: ${usuario.username}`
    },
    confirmarEliminacion(index) {
      this.usuarioAEliminarIndex = index
      this.modalActivo = true
    },
    eliminarUsuario() {
      this.usuarios.splice(this.usuarioAEliminarIndex, 1)
      localStorage.setItem('usuarios_custom', JSON.stringify(this.usuarios))
      this.modalActivo = false
      this.usuarioAEliminarIndex = null
      this.mensaje = 'Usuario eliminado.'
      setTimeout(() => (this.mensaje = ''), 3000)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.admin-view {
  max-width: 900px;
  margin: auto;
  padding: 2rem;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
}

.admin-view h1 {
  text-align: center;
  font-weight: 700;
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.formulario {
  background: #f1f8e9;
  padding: 1.5rem;
  border-radius: 10px;
  border: 2px solid #aed581;
  margin-bottom: 2rem;
}

.campo {
  margin-bottom: 1rem;
}

.campo label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #2e7d32;
}

.campo input,
.campo select {
  width: 100%;
  padding: 0.6rem 0.9rem;
  font-size: 1rem;
  border: 2px solid #c8e6c9;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.3s ease;
}
.campo input:focus,
.campo select:focus {
  border-color: #4caf50;
}

.btn-guardar {
  background: #4caf50;
  color: white;
  font-weight: bold;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-guardar:hover {
  background: #2e7d32;
}

.tabla-usuarios {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
}
.tabla-usuarios th,
.tabla-usuarios td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}
.tabla-usuarios th {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 600;
}
.tabla-usuarios tr:last-child td {
  border-bottom: none;
}

.btn-eliminar {
  background: #e53935;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: background-color 0.3s ease;
}
.btn-eliminar:hover {
  background: #b71c1c;
}
.btn-editar {
  background: #42a5f5;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-editar:hover {
  background: #0d47a1;
}

.mensaje {
  margin-top: 1rem;
  background: #c8e6c9;
  padding: 0.8rem;
  border-radius: 6px;
  color: #256029;
  text-align: center;
  font-weight: bold;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-contenido {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  text-align: center;
}

.modal-contenido h2 {
  color: #2e7d32;
  margin-bottom: 1rem;
}

.modal-botones {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-confirmar {
  background: #388e3c;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-cancelar {
  background: #757575;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
