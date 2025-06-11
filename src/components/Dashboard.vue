<template>
  <div>
    <CajaCobro @nueva-venta="agregarVenta" />

    <ReporteVentas :ventas="ventas" />

    <ReporteProductos :ventas="ventas" />
  </div>
</template>

<script>
import CajaCobro from './CajaCobro.vue'
import ReporteVentas from './ReporteVentas.vue'
import ReporteProductos from './ReporteProductos.vue'

export default {
  components: { CajaCobro, ReporteVentas, ReporteProductos },
  data() {
    return {
      ventas: []
    }
  },
  methods: {
    agregarVenta(venta) {
      this.ventas.push(venta)
    }
  }
}
</script>
