// src/auth.js
import api from "@/requests"; // Importa la instancia axios configurada

// Login
export async function login(username, password) {
  try {
    const response = await api.post('/auth/login', {
      username,
      password
    });

    const { token, rol, sucursal_id } = response.data;

    // 🔐 Guardar token y otros datos en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('rol_usuario', rol);
    localStorage.setItem('store_code', sucursal_id);

    return response.data;
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al iniciar sesión';
  }
}

// Logout
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('rol_usuario');
  localStorage.removeItem('store_code');
}

// Verifica si el usuario está logueado
export function isLoggedIn() {
  return !!localStorage.getItem('token');
}

// Ya no necesitas usuarios de prueba si usas backend real
export const usuarios = [];
