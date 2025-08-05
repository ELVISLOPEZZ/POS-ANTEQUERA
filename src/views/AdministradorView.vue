<template>
  <div class="admin-view">
    <h1>🧍🏻Gestión de Personal</h1>

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
          <option value="administrador">Administrador</option>
          <option value="cajero">Cajero</option>
        </select>
      </div>

<!-- Cambia el campo Sucursal por ID numérico -->
<div class="campo">
  <label>Sucursal:</label>
  <select v-model.number="nuevoUsuario.sucursal_id" required>
    <option disabled value="">-- Selecciona una sucursal --</option>
    <option
      v-for="sucursal in sucursales"
      :key="sucursal.id"
      :value="sucursal.id"
    >
      {{ sucursal.nombre }}
    </option>
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
  <td>{{ user.password }}contraseña oculta</td>
  <td>{{ user.rol }}</td>
    <td>{{ obtenerNombreSucursal(user.sucursal_id) }}</td>
  <td class="acciones">
    <button class="btn-eliminar" @click="confirmarEliminacion(user)">🗑️ Eliminar</button>
    <button class="btn-editar" @click="editarUsuario(user)">✍🏼 Editar</button>
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
import { obtenerSucursales } from '@/services/sucursal.service.js';
import {obtenerUsuarios, registrarUsuario, actualizarUsuario, eliminarUsuario} from '@/services/usuario.service.js';

export default {
  data() {
    return {
      nuevoUsuario: {
        username: '',
        password: '',
        rol: '',
        sucursal_id: null,
      },
      sucursales: [],
      usuarios: [],
      mensaje: '',
      modoEdicion: false,
      indiceEdicion: null,
      modalActivo: false,
      usuarioAEliminar: null
    }
  },

    async mounted() {
  await this.cargarUsuarios();
  await this.cargarSucursales();
    },
  methods: {
    mostrarMensaje(texto, tipo = 'exito') {
      this.mensaje = texto;
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);
    },
    async cargarUsuarios() {
      try {
        this.usuarios = await obtenerUsuarios();
      } catch (error) {
        this.mostrarMensaje('Error al cargar usuarios.');
      }
    },
    async cargarSucursales() {
    try {
      this.sucursales = await obtenerSucursales();
    } catch (error) {
      console.error('Error cargando sucursales:', error);
      this.mostrarMensaje('No se pudieron cargar las sucursales.');
    }
    },
    async registrarUsuario() {
  const payload = {
    username: this.nuevoUsuario.username,
    rol: this.nuevoUsuario.rol,
    sucursal_id: parseInt(this.nuevoUsuario.sucursal_id),
  };

  // 👇 Solo incluir password si se proporciona y no está vacía
  if (!this.modoEdicion || (this.nuevoUsuario.password && this.nuevoUsuario.password.trim() !== '')) {
    payload.password = this.nuevoUsuario.password;
  }
  try {
    if (this.modoEdicion) {
      await actualizarUsuario(this.usuarioAEliminar.id, payload);
      this.mostrarMensaje('Usuario actualizado correctamente.');
    } else {
      await registrarUsuario(payload);
      this.mostrarMensaje('Usuario registrado correctamente.');
    }

    await this.cargarUsuarios();
    this.resetFormulario();
  } catch (error) {
    console.error('Error al registrar/actualizar usuario:', error);
    this.mostrarMensaje('Error al guardar el usuario.');
  }
    },
    editarUsuario(usuario) {
      this.nuevoUsuario = {
        username: usuario.username,
        password: '', // ⚠️ no mostrar contraseña anterior
        rol: usuario.rol,
        sucursal_id: usuario.sucursal_id
      };
      this.usuarioAEliminar = usuario;
      this.modoEdicion = true;
    },
    confirmarEliminacion(usuario) {
      this.usuarioAEliminar = usuario;
      this.modalActivo = true;
    },
    async eliminarUsuario() {
      if (!this.usuarioAEliminar || !this.usuarioAEliminar.id) {
        this.mostrarMensaje('ID de usuario inválido');
        return;
      }

      try {
        await eliminarUsuario(this.usuarioAEliminar.id);
        this.mostrarMensaje('Usuario eliminado correctamente');
        await this.cargarUsuarios();
      } catch (error) {
        console.error(error);
        this.mostrarMensaje('Error al eliminar usuario');
      } finally {
        this.modalActivo = false;
        this.usuarioAEliminar = null;
      }
    },
    resetFormulario() {
      this.nuevoUsuario = { username: '', password: '', rol: '', sucursal_id: null };
      this.modoEdicion = false;
      this.usuarioAEliminar = null;
    },
    obtenerNombreSucursal(id) {
    const sucursal = this.sucursales.find(s => s.id === id);
    return sucursal ? sucursal.nombre : 'Sin sucursal';
    },
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
  width: 100%;
  max-width: 220px;
  display: block;
  margin: 0 auto;
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
  word-wrap: break-word;
}

.tabla-usuarios th {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 600;
}

.tabla-usuarios tr:last-child td {
  border-bottom: none;
}

.btn-eliminar,
.btn-editar {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  color: white;
  transition: background-color 0.3s ease;
  margin: 0 0.2rem 0.2rem 0;
}

.btn-eliminar {
  background: #e53935;
}
.btn-eliminar:hover {
  background: #b71c1c;
}

.btn-editar {
  background: #42a5f5;
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

/* Modal */
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

/* Responsive */

@media (max-width: 700px) {
  .admin-view {
    padding: 1rem;
  }

  .formulario {
    padding: 1rem;
  }

  .btn-guardar {
    max-width: 100%;
  }

  .tabla-usuarios th,
  .tabla-usuarios td {
    padding: 0.6rem 0.3rem;
    font-size: 0.9rem;
  }

  .tabla-usuarios {
    font-size: 0.9rem;
  }

  /* Hacer que la tabla pueda hacer scroll horizontal */
  .tabla-usuarios {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  /* Botones acciones en bloque para móvil */
  .acciones {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .btn-eliminar,
  .btn-editar {
    margin: 0;
    width: 100%;
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }
}
</style>
