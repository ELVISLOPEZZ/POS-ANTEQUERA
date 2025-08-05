// src/services/corteCaja.service.js

import api from "@/requests";  // importa tu instancia axios configurada

const API_URL = "/cortes";  // baseURL ya está en api

export default {
  abrirCorte(cambioInicial) {
    return api.post(`${API_URL}/abrir`, { cambio_inicial: cambioInicial });
  },

  cerrarCorte() {
    return api.post(`${API_URL}/cerrar`);
  },

  obtenerCorteActual() {
    return api.get(`${API_URL}/actual`);
  }
};
