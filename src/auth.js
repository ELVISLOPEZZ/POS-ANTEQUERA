// auth.js
export const usuarios = [
  {
    username: 'admin',
    password: 'admin',
    rol: 'admin',
    sucursal: 'SUCURSAL1'
  },
  {
    username: 'cajero1',
    password: 'cajero1',
    rol: 'cajero',
    sucursal: 'SUCURSAL2'
  },
  {
    username: 'cajero2',
    password: 'cajero2',
    rol: 'cajero',
    sucursal: 'SUCURSAL3'
  }
];

export const usuariosBase = [
  {
    username: 'admin',
    password: 'admin',
    rol: 'admin',
    sucursal: 'SUCURSAL1'
  },
  {
    username: 'cajero1',
    password: 'cajero1',
    rol: 'cajero',
    sucursal: 'SUCURSAL2'
  },
  {
    username: 'cajero2',
    password: 'cajero2',
    rol: 'cajero',
    sucursal: 'SUCURSAL3'
  }
];

export function login(username, password, sucursalSeleccionada) {
  // Cargar usuarios personalizados
  const usuariosCustom = JSON.parse(localStorage.getItem('usuarios_custom')) || [];
  // Combinar con los usuarios base
  const todosLosUsuarios = [...usuariosBase, ...usuariosCustom];
  const user = todosLosUsuarios.find(
    u => u.username === username && u.password === password
  );
  if (user) {
    if (user.rol === 'admin' || user.sucursal === sucursalSeleccionada) {
      localStorage.setItem('usuario', JSON.stringify(user));
      localStorage.setItem('store_code', sucursalSeleccionada);
      localStorage.setItem('rol_usuario', user.rol);
      return { success: true, user };
    } else {
      return {
        success: false,
        message: 'Sucursal incorrecta para este usuario'
      };
    }
  }
  return {
    success: false,
    message: 'Usuario o contraseña incorrectos'
  };
}


export function getUserRole() {
  const user = JSON.parse(localStorage.getItem('usuario'))
  return user ? user.rol : null
}

export function logout() {
  localStorage.removeItem('usuario')
  localStorage.removeItem('store_code')
  localStorage.removeItem('rol_usuario')
}

export function isLoggedIn() {
  return !!localStorage.getItem('usuario')
}