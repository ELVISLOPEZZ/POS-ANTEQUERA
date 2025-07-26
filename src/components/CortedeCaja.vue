<template>
  <div class="corte-caja">
    <h1>Cortes de Caja</h1>

    <!-- Filtros -->
    <div class="filtros">
      <label>
        Fecha:
        <input type="date" v-model="filtroFecha" />
      </label>

      <label>
        Sucursal:
        <select v-model="filtroSucursal">
          <option value="">Todas</option>
          <option value="SUCURSAL1">Sucursal 1</option>
          <option value="SUCURSAL2">Sucursal 2</option>
          <option value="SUCURSAL3">Sucursal 3</option>
        </select>
      </label>

      <label>
        Cajero:
        <input type="text" v-model="filtroCajero" placeholder="Nombre del cajero" />
      </label>
    </div>

    <table class="tabla-cortes">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Hora</th>
          <th>Sucursal</th>
          <th>Cajero</th>
          <th>Cambio Inicial</th>
          <th>Total Ventas</th>
          <th>Total en Caja</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(corte, index) in cortesFiltrados" :key="index">
          <td>{{ corte.fecha }}</td>
          <td>{{ corte.hora }}</td>
          <td>{{ corte.sucursal }}</td>
          <td>{{ corte.usuario?.nombre || '---' }}</td>
          <td>${{ corte.cambioInicial }}</td>
          <td>${{ corte.totalVentas }}</td>
          <td><strong>${{ corte.total }}</strong></td>
        </tr>
      </tbody>
    </table>

    <div v-if="cortesFiltrados.length === 0" class="mensaje-vacio">
      No hay cortes que coincidan con los filtros.
    </div>
  </div>
</template>

<script>
export default {
  name: "CorteDeCaja",
  data() {
    return {
      cortesHoy: [],
      filtroSucursal: "",
      filtroCajero: "",
      filtroFecha: this.obtenerFechaLocal(),
    };
  },
  computed: {
    cortesFiltrados() {
      return this.cortesHoy.filter((corte) => {
        const coincideSucursal = !this.filtroSucursal || corte.sucursal.toLowerCase().includes(this.filtroSucursal.toLowerCase());
        const coincideCajero = !this.filtroCajero || (corte.usuario?.nombre || "").toLowerCase().includes(this.filtroCajero.toLowerCase());
        const coincideFecha = !this.filtroFecha || corte.fecha === this.filtroFecha;

        return coincideSucursal && coincideCajero && coincideFecha;
      });
    },
  },
  mounted() {
    const cortesGuardados = JSON.parse(localStorage.getItem("cortes_realizados")) || [];
    
    this.cortesHoy = cortesGuardados.map((corte) => {
      const totalVentas = corte.ventas?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
      return {
        ...corte,
        totalVentas,
        total: totalVentas + (corte.cambioInicial || 0)
      };
    });
  },
  methods: {
    obtenerFechaLocal() {
      const ahora = new Date();
      const offset = ahora.getTimezoneOffset();
      const localDate = new Date(ahora.getTime() - offset * 60000);
      return localDate.toISOString().split("T")[0];
    },
  },
};
</script>



<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

.corte-caja {
  background: #f9fbfc;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  color: #333;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-top: 2rem;
  animation: fadeInScale 0.4s ease-out;
  max-width: 100%;
  overflow-x: auto;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.97);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.corte-caja h1 {
  font-size: 2rem;
  margin-bottom: 1.8rem;
  color: #356c94; /* color original */
  font-weight: 600;
  text-align: center;
}

/* Filtros */
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.filtros label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  color: #356c94; /* color original */
  font-size: 0.95rem;
  min-width: 180px;
}

.filtros input,
.filtros select {
  margin-top: 0.4rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  border: 1.5px solid #a7b9ce; /* un gris azulado suave */
  background: #fff;
  font-size: 0.95rem;
  color: #333;
  transition: border-color 0.3s ease;
  outline-offset: 2px;
}

.filtros input:focus,
.filtros select:focus {
  border-color: #356c94; /* color original */
  background: #fff;
  outline: none;
  box-shadow: 0 0 5px #356c94aa;
}

/* Tabla */
.tabla-cortes {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  font-size: 0.95rem;
  min-width: 720px;
}

.tabla-cortes thead tr th {
  background-color: #356c94; /* color original */
  color: #fff;
  font-weight: 600;
  padding: 0.8rem 1rem;
  text-align: center;
  border: none;
  user-select: none;
}

.tabla-cortes tbody tr {
  background: #fcfcfc; /* color original */
  transition: background-color 0.3s ease;
  border-radius: 8px;
}

.tabla-cortes tbody tr:hover {
  background-color: #d4e3f5; /* un azul claro para hover */
  cursor: pointer;
}

.tabla-cortes tbody tr td {
  padding: 0.7rem 1rem;
  border: none;
  text-align: center;
  color: #33475b;
  font-weight: 500;
}

.tabla-cortes tbody tr td strong {
  color: #244a75;
}

/* Mensaje vacío */
.mensaje-vacio {
  margin-top: 2rem;
  color: #6b7280;
  font-style: italic;
  text-align: center;
  font-weight: 500;
  user-select: none;
}

/* Scroll horizontal para contenedor */
.corte-caja::-webkit-scrollbar {
  height: 8px;
}

.corte-caja::-webkit-scrollbar-thumb {
  background: #356c94; /* color original */
  border-radius: 20px;
}

.corte-caja::-webkit-scrollbar-track {
  background: #e4ebf3; /* un gris muy claro */
  border-radius: 20px;
}
</style>
