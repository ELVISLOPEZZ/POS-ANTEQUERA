import requests from './requests';

const registrarPago = (creditoId, dataPago) => {
  // dataPago debe tener: monto_pagado, fecha_pago, observaciones (opcional)
  return requests.post(`/pagos/${creditoId}`, dataPago);
};

const obtenerPagos = (creditoId) => {
  return requests.get(`/pagos/${creditoId}`);
};

export default {
  registrarPago,
  obtenerPagos,
};
