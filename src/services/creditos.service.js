// src/services/creditos.service.js


//SE USA EN: Creditosview.vue

import api from "@/requests";

const API_URL = "/creditos"; // ya baseURL está en api

export default {
  obtenerCreditosActivos() {
    return api.get(API_URL);
  },

  obtenerCreditoPorId(id) {
    return api.get(`${API_URL}/${id}`);
  },

  registrarCredito(dataCredito) {
    return api.post(API_URL, dataCredito);
  },

  cancelarCredito(id) {
    return api.put(`${API_URL}/${id}/cancelar`);
  },

  obtenerPagos(creditoId) {
    return api.get(`${API_URL}/${creditoId}/pagos`);
  },

  registrarPago(creditoId, dataPago) {
    return api.post(`${API_URL}/${creditoId}/pagos`, dataPago);
  },

  // ✅ Nuevo método: obtener créditos por fecha (query param)
  obtenerCreditosPorFecha(fecha) {
    return api.get(`${API_URL}?fecha_venta=${encodeURIComponent(fecha)}`);
  }
};
