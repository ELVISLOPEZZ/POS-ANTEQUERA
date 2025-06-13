<template>
  <div class="login-wrapper">
    <div class="login-box">
      <div class="login-header">
        <h1>Bienvenido</h1>
        <p>Ingresa tus credenciales para acceder al sistema POS</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="username">Usuario</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Ingresa tu usuario"
            required
          />
        </div>

        <div class="input-group">
          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>

        <div class="input-group">
          <label for="sucursal">Selecciona una sucursal</label>
          <select id="sucursal" v-model="sucursalSeleccionada" required>
            <option disabled value="">-- Elige una sucursal --</option>
            <option value="SUCURSAL1">Sucursal 1</option>
            <option value="SUCURSAL2">Sucursal 2</option>
            <option value="SUCURSAL3">Sucursal 3</option>
          </select>
        </div>

        <button type="submit" class="btn-login">Iniciar Sesión</button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { login } from '../auth.js'

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      sucursalSeleccionada: '',
      error: ''
    }
  },
  methods: {
    handleLogin() {
      const acceso = login(this.username, this.password)
      if (acceso) {
        if (!this.sucursalSeleccionada) {
          this.error = 'Debes seleccionar una sucursal'
          return
        }

        // Guardar la nueva sucursal en localStorage
        localStorage.setItem('store_code', this.sucursalSeleccionada)

        this.error = ''
        this.$router.push('/caja') // Redirige a la vista principal
      } else {
        this.error = 'Credenciales incorrectas. Intenta de nuevo.'
      }
    }
  }
}
</script>


<style scoped>
/* Reseteo solo para este componente */
:deep(html),
:deep(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.login-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
              url('/fondo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.login-box {
  background-color: #ffffff;
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  animation: fadeIn 0.7s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2rem;
  color: #4e342e;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #7e5c51;
  font-size: 0.95rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #5d4037;
}

.input-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #d7ccc8;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-group input:focus {
  border-color: #a1887f;
  outline: none;
  box-shadow: 0 0 0 3px rgba(161, 136, 127, 0.2);
}

.btn-login {
  width: 100%;
  padding: 0.8rem;
  background-color: #a1887f;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.btn-login:hover {
  background-color: #6d4c41;
  transform: translateY(-2px);
}

.error-message {
  margin-top: 1rem;
  color: #c62828;
  text-align: center;
  font-size: 0.95rem;
}
</style>
