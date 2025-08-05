// en categoria.service.js
import api from '../requests';

export const crearCategoria = (categoria) => {
  return api.post('/categorias', categoria);
};

export const obtenerCategorias = (sucursal_id) => {
  return api.get(`/categorias?sucursal_id=${sucursal_id}`);
};
