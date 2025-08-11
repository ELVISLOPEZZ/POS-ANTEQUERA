// src/services/productos.service.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/productos';
const API_CATEGORIAS_URL = 'http://localhost:3000/api/categorias';

function obtenerToken() {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
}

const axiosProductos = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

const axiosCategorias = axios.create({
  baseURL: API_CATEGORIAS_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptores para agregar token automáticamente
[axiosProductos, axiosCategorias].forEach(instance => {
  instance.interceptors.request.use(config => {
    const token = obtenerToken();
    if (token) config.headers.Authorization = token;
    return config;
  });

  instance.interceptors.response.use(
    res => res.data, // Solo devolvemos data
    err => {
      // Si el token expira o es inválido
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // Re-lanzamos el error para manejarlo en el componente
      return Promise.reject(err.response?.data || err);
    }
  );
});

// Productos
export const obtenerProductos = (sucursal) =>
  axiosProductos.get('/', { params: { sucursal } });

export const obtenerProductoPorId = (id) =>
  axiosProductos.get(`/${id}`);

export const buscarProductoPorCodigo = (codigo) =>
  axiosProductos.get(`/codigo/${codigo}`);

export const crearProducto = (producto) =>
  axiosProductos.post('/', producto);

export const actualizarProducto = (id, producto) =>
  axiosProductos.put(`/${id}`, producto);

export const eliminarProducto = (id) =>
  axiosProductos.delete(`/${id}`);

export const obtenerAlertasInventario = () =>
  axiosProductos.get('/alertas');

// Categorías
export const obtenerCategorias = (sucursal) =>
  axiosCategorias.get('/', { params: { sucursal } });

export const crearCategoria = (categoria) =>
  axiosCategorias.post('/', categoria);

export const eliminarCategoria = (id) =>
  axiosCategorias.delete(`/${id}`);
