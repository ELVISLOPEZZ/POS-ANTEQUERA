// src/services/ventas.service.js
// Servicio centralizado para gestionar ventas (efectivo, crédito, etc.)

import api from "@/requests";  // instancia de Axios ya configurada con baseURL y headers

// Registrar una venta normal (efectivo, tarjeta, etc.)
export const realizarVenta = async (ventaData) => {
  const response = await api.post('/ventas', ventaData);
  return response.data;
};

// Registrar una venta a crédito (desde CajaView)
export const otorgarCredito = async (ventaData) => {
  const datosCredito = {
    ...ventaData,
    metodo_pago: 'credito'
  };

  const response = await api.post('/ventas', datosCredito);
  return response.data;
};

// Obtener ventas del día para la sucursal del usuario logueado
export const obtenerVentasDelDia = async () => {
  const response = await api.get('/ventas/dia');
  return response.data;
};

// Obtener detalle completo de una venta
export const obtenerVentaPorId = async (id) => {
  const response = await api.get(`/ventas/${id}`);
  return response.data;
};

// Obtener todas las ventas ligadas a un corte específico
export const obtenerVentasPorCorte = async (corteId) => {
  const response = await api.get(`/ventas/corte/${corteId}`);
  return response.data;
};

// Obtener ventas por rango de fechas, método de pago y cajero
export const obtenerVentasPorRango = async (filtros) => {
  const response = await api.get('/ventas/rango', { params: filtros });
  return response.data;
};

// Obtener resumen de ventas (conteo, ingresos totales y por método)
export const obtenerResumenVentas = async (filtros) => {
  const response = await api.get('/ventas/resumen', { params: filtros });
  return response.data;
};

// Eliminar una venta (si tienes permisos y lógica habilitada)
export const eliminarVenta = async (id) => {
  const response = await api.delete(`/ventas/${id}`);
  return response.data;
};
