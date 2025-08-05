import axios from 'axios';

const API_URL = 'http://localhost:3000/api/productos'; // Base para productos
const API_CATEGORIAS_URL = 'http://localhost:3000/api/categorias'; // Base para categorías

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

axiosProductos.interceptors.request.use(config => {
  const token = obtenerToken();
  if (token) config.headers.Authorization = token;
  return config;
});

axiosCategorias.interceptors.request.use(config => {
  const token = obtenerToken();
  if (token) config.headers.Authorization = token;
  return config;
});

// Productos
export const obtenerProductos = async () => {
  const response = await axiosProductos.get('/');
  return response.data;
};

export const obtenerProductoPorId = async (id) => {
  const response = await axiosProductos.get(`/${id}`);
  return response.data;
};

export const crearProducto = async (producto) => {
  const response = await axiosProductos.post('/', producto);
  return response.data;
};

export const actualizarProducto = async (id, producto) => {
  const response = await axiosProductos.put(`/${id}`, producto);
  return response.data;
};

export const eliminarProducto = async (id) => {
  const response = await axiosProductos.delete(`/${id}`);
  return response.data;
};

export const obtenerAlertasInventario = async () => {
  const response = await axiosProductos.get('/alertas');
  return response.data;
};

// Categorías
export const obtenerCategorias = async (sucursal) => {
  const response = await axiosCategorias.get(`/?sucursal=${sucursal}`);
  return response.data;
};


export const crearCategoria = async (categoria) => {
  const response = await axiosCategorias.post('/', categoria);
  return response.data;
};

export const eliminarCategoria = async (id) => {
  const response = await axiosCategorias.delete(`/${id}`);
  return response.data;
};
