// src/services/corteCaja.service.js
import api from '../requests'; // Usa esta instancia que ya agrega el token

const API_BASE = '/corte';

export async function abrirCorte(dinero_inicial, sucursal_id) {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/api/corte/abrir', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ dinero_inicial, sucursal_id })
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
}



export const cerrarCorte = async () => {
  try {
    const response = await api.post(`${API_BASE}/cerrar`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const obtenerCorteActual = async () => {
  try {
    const response = await api.get(`${API_BASE}/actual`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
