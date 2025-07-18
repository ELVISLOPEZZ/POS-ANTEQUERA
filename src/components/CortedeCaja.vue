<template>
  <div class="corte-caja">
    <h2>📦 Cortes de Caja del Día</h2>

    <div class="filtros">
      <label>Sucursal:</label>
      <select v-model="filtroSucursal">
        <option value="">Todas</option>
        <option value="SUCURSAL1">Sucursal 1</option>
        <option value="SUCURSAL2">Sucursal 2</option>
        <option value="SUCURSAL3">Sucursal 3</option>
      </select>

      <label>Cajero:</label>
      <input type="text" v-model="filtroCajero" placeholder="Nombre del cajero" />
    </div>

    <div class="tabla-cortes">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Cajero</th>
            <th>Sucursal</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(corte, i) in cortesFiltrados" :key="i">
            <td>{{ corte.fecha }}</td>
            <td>{{ corte.hora || new Date(corte.timestamp).toLocaleTimeString() }}</td>
            <td>{{ obtenerNombreCajero(corte) }}</td>
            <td>{{ obtenerSucursalCorte(corte) }}</td>
            <td>${{ parseFloat(corte.total).toFixed(2) }}</td>
          </tr>
          <tr v-if="cortesFiltrados.length === 0">
            <td colspan="5">No hay cortes disponibles.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "CortedeCaja",
  data() {
    return {
      cortesHoy: [],
      filtroSucursal: '',
      filtroCajero: '',
    };
  },
  computed: {
    cortesFiltrados() {
      return this.cortesHoy.filter(corte => {
        const nombreCajero = this.obtenerNombreCajero(corte).toLowerCase();
        const filtroCajero = this.filtroCajero.toLowerCase();

        const coincideCajero = this.filtroCajero
          ? nombreCajero.includes(filtroCajero)
          : true;

        const filtroSuc = this.filtroSucursal.toLowerCase();
        const sucursalCorte = this.obtenerSucursalCorte(corte).toLowerCase();

        const coincideSucursal = this.filtroSucursal
          ? sucursalCorte === filtroSuc
          : true;

        return coincideCajero && coincideSucursal;
      });
    }
  },
  methods: {
    cargarCortes() {
      const hoy = new Date().toISOString().slice(0, 10);
      const cortesRaw = JSON.parse(localStorage.getItem('cortes_caja') || '[]');

      const cortesNormalizados = cortesRaw.map(corte => {
        const fecha = corte.fecha || new Date(corte.timestamp).toISOString().slice(0, 10);
        let usuario = corte.usuario;
        if (!usuario || typeof usuario !== 'object') {
          usuario = { nombre: 'Desconocido', sucursal: 'Desconocida' };
        } else if (typeof usuario === 'string') {
          usuario = { nombre: usuario, sucursal: corte.sucursal || 'Desconocida' };
        }
        return {
          ...corte,
          fecha,
          usuario,
          sucursal: corte.sucursal || usuario.sucursal || 'Desconocida',
        };
      });

      const cortesHoy = cortesNormalizados.filter(corte => corte.fecha === hoy);

      // Orden descendente (más reciente arriba)
      cortesHoy.sort((a, b) => b.timestamp - a.timestamp);

      this.cortesHoy = cortesHoy;
    },
    obtenerNombreCajero(corte) {
      if (!corte.usuario) return 'Desconocido';
      if (typeof corte.usuario === 'string') return corte.usuario;
      if (typeof corte.usuario === 'object' && corte.usuario.nombre) return corte.usuario.nombre;
      return 'Desconocido';
    },
    obtenerSucursalCorte(corte) {
      return corte.usuario?.sucursal || corte.sucursal || 'Desconocida';
    }
  },
  mounted() {
    this.cargarCortes();
    window.addEventListener('corte-realizado', this.cargarCortes);
  },
  beforeUnmount() {
    window.removeEventListener('corte-realizado', this.cargarCortes);
  }
};
</script>





<style scoped>
.corte-caja {
  background: #f3f7f8;
  padding: 2rem;
  border-radius: 10px;
  font-family: 'Poppins', sans-serif;
  color: #333;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

.filtros {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.2rem;
  align-items: center;
  flex-wrap: wrap;
}

.filtros label {
  font-weight: bold;
}

.filtros input,
.filtros select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.tabla-cortes {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th,
td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: center;
}

th {
  background: #00796b;
  color: white;
}
</style>
