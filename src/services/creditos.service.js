// src/services/creditos.service.js
import request from '../requests';

// Obtener todos los créditos activos por sucursal
export const obtenerCreditos = async () => {
  const response = await request.get('/creditos/activos');
  return response.data.creditos;
};

// Registrar un nuevo crédito
export const registrarCredito = async (datosCredito) => {
  const response = await request.post('/creditos', datosCredito);
  return response.data.credito;
};

// Obtener un crédito específico junto con su historial de pagos
export const obtenerCreditoPorId = async (id) => {
  const response = await request.get(`/creditos/${id}`);
  return response.data.credito;
};

// Cancelar un crédito
export const cancelarCredito = async (id) => {
  const response = await request.put(`/creditos/cancelar/${id}`);
  return response.data.credito;
};

export const registrarPago = async (creditoId, datosPago) => {
  const response = await request.post(`/pagos/${creditoId}`, datosPago);
  return response.data;
};

