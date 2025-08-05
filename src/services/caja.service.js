// src/services/ventas.service.js

import api from "@/requests";  // importa tu instancia axios configurada

export const realizarVenta = async (ventaData) => {
  const response = await api.post('/ventas', ventaData);
  return response.data;
};

export const obtenerVentasDelDia = async () => {
  const response = await api.get('/ventas/dia');
  return response.data;
};

export const obtenerVentaPorId = async (id) => {
  const response = await api.get(`/ventas/${id}`);
  return response.data;
};

export const obtenerVentasPorCorte = async (corteId) => {
  const response = await api.get(`/ventas/corte/${corteId}`);
  return response.data;
};

export const obtenerVentasPorRango = async (filtros) => {
  const response = await api.get('/ventas/rango', { params: filtros });
  return response.data;
};

export const obtenerResumenVentas = async (filtros) => {
  const response = await api.get('/ventas/resumen', { params: filtros });
  return response.data;
};

export const eliminarVenta = async (id) => {
  const response = await api.delete(`/ventas/${id}`);
  return response.data;
};
