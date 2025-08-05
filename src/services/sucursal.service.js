// src/services/sucursal.service.js


//SE USA EN: Administradorview.vue
import api from '../requests';

export const obtenerSucursales = () => api.get('/sucursales').then(res => res.data);

export const crearSucursal = (sucursalData) =>
  api.post('/sucursales', sucursalData).then(res => res.data);

export const actualizarSucursal = (id, sucursalData) =>
  api.put(`/sucursales/${id}`, sucursalData).then(res => res.data);

export const eliminarSucursal = (id) =>
  api.delete(`/sucursales/${id}`).then(res => res.data);
