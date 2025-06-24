// src/productos.js

export function obtenerProductosPorSucursal(sucursal) {
  let productos = JSON.parse(localStorage.getItem('productos')) || []

  // Si el localStorage está vacío, se insertan productos de prueba
  if (productos.length === 0) {
    productos = [
      // SUCURSAL1 - ya existe 1 producto, agrego 4 más
      {
        id: 1,
        nombre: 'Camiseta Verde',
        categoria: 'Ropa',
        precio: 199.99,
        stock: 20,
        imagen: 'https://m.media-amazon.com/images/I/51tc2UgRMXL._AC_UF894,1000_QL80_.jpg',
        sucursal: 'SUCURSAL1',
        codigoBarras: '7500000000013',
        fechaCaducidad: '2027-12-31'
      },
      {
        id: 2,
        nombre: 'Pantalón Azul',
        categoria: 'Ropa',
        precio: 299.50,
        stock: 3,
        imagen: 'https://m.media-amazon.com/images/I/31HlsUv0lkL._AC_.jpg',
        sucursal: 'SUCURSAL1',
        codigoBarras: '7500000000020',
        fechaCaducidad: '2028-03-15'
      },
      {
        id: 3,
        nombre: 'Gorra Blanca',
        categoria: 'Ropa',
        precio: 120.00,
        stock: 20,
        imagen: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/dc8dd312874a4b1db224aa8500e5db5b_9366/Gorra_Beisbol_UNISEX_Blanco_FK0890_01_standard.jpg',
        sucursal: 'SUCURSAL1',
        codigoBarras: '7500000000037',
        fechaCaducidad: '2026-11-30'
      },
      {
        id: 4,
        nombre: 'Sudadera Gris',
        categoria: 'Ropa',
        precio: 450.00,
        stock: 20,
        imagen: 'https://shoppinginibiza.com/165816-large_default/lacoste-sudadera-gris-350112-hombre.jpg',
        sucursal: 'SUCURSAL1',
        codigoBarras: '7500000000044',
        fechaCaducidad: '2027-05-20'
      },
      {
        id: 5,
        nombre: 'Calcetines Blancos',
        categoria: 'Ropa',
        precio: 50.00,
        stock: 20,
        imagen: 'https://sportmasters.com.mx/cdn/shop/products/4HT3458-BCO-001.jpg?v=1698363961',
        sucursal: 'SUCURSAL1',
        codigoBarras: '7500000000051',
        fechaCaducidad: '2028-01-10'
      },
            {
        id: 6,
        nombre: 'Audifonos Inalámbricos',
        categoria: 'Electrónica',
        precio: 500.00,
        stock: 20,
        imagen: 'https://selectsound.com.mx/cdn/shop/files/audifonos-inalambricos-bluetooth-manos-libres-sense-bth028-401895.jpg?v=1717819739',
        sucursal: 'SUCURSAL1',
        codigoBarras: '7500000000151',
        fechaCaducidad: '2028-01-10'
      },
            {
        id: 7,
        nombre: 'Celular Samsung',
        categoria: 'Electrónica',
        precio: 10000.00,
        stock: 20,
        imagen: 'https://cdn1.coppel.com/images/catalog/mkp/7462/5000/74623943-1.jpg',
        sucursal: 'SUCURSAL1',
        codigoBarras: '7500000000251',
        fechaCaducidad: '2028-01-10'
      },
            {
        id: 8,
        nombre: 'Computadora Portátil',
        categoria: 'Electrónica',
        precio: 20000.00,
        stock: 20,
        imagen: 'https://www.asus.com/media/Odin/Websites/global/Series/15.png',
        sucursal: 'SUCURSAL1',
        codigoBarras: '7500000000351',
        fechaCaducidad: '2028-01-10'
      },

      // SUCURSAL2 - ya existe 1 producto, agrego 4 más
      {
        id: 6,
        nombre: 'Auriculares Bluetooth',
        categoria: 'Electrónica',
        precio: 599.5,
        stock: 5,
        imagen: 'https://mobomx.vtexassets.com/arquivos/ids/196876-800-auto?v=638212067600330000&width=800&height=auto&aspect=true',
        sucursal: 'SUCURSAL2',
        codigoBarras: '7500000000068',
        fechaCaducidad: '2029-06-30'
      },
      {
        id: 7,
        nombre: 'Smartwatch Deportivo',
        categoria: 'Electrónica',
        precio: 1200.00,
        stock: 4,
        imagen: 'https://example.com/smartwatch_deportivo.jpg',
        sucursal: 'SUCURSAL2',
        codigoBarras: '7500000000075',
        fechaCaducidad: '2029-12-15'
      },
      {
        id: 8,
        nombre: 'Cámara Digital',
        categoria: 'Electrónica',
        precio: 3500.00,
        stock: 3,
        imagen: 'https://example.com/camara_digital.jpg',
        sucursal: 'SUCURSAL2',
        codigoBarras: '7500000000082',
        fechaCaducidad: '2028-08-01'
      },
      {
        id: 9,
        nombre: 'Parlante Bluetooth',
        categoria: 'Electrónica',
        precio: 800.00,
        stock: 7,
        imagen: 'https://example.com/parlante_bluetooth.jpg',
        sucursal: 'SUCURSAL2',
        codigoBarras: '7500000000099',
        fechaCaducidad: '2029-03-22'
      },
      {
        id: 10,
        nombre: 'Cargador Inalámbrico',
        categoria: 'Electrónica',
        precio: 350.00,
        stock: 12,
        imagen: 'https://example.com/cargador_inalambrico.jpg',
        sucursal: 'SUCURSAL2',
        codigoBarras: '7500000000105',
        fechaCaducidad: '2028-10-10'
      },

      // SUCURSAL3 - ya existe 1 producto, agrego 4 más
      {
        id: 11,
        nombre: 'Zapatos Negros',
        categoria: 'Ropa',
        precio: 899.99,
        stock: 7,
        imagen: 'https://s3-us-west-1.amazonaws.com/calzzapato/zoom/09H6YN-2.jpg',
        sucursal: 'SUCURSAL3',
        codigoBarras: '7500000000112',
        fechaCaducidad: '2027-09-05'
      },
      {
        id: 12,
        nombre: 'Camisa Blanca',
        categoria: 'Ropa',
        precio: 350.00,
        stock: 9,
        imagen: 'https://example.com/camisa_blanca.jpg',
        sucursal: 'SUCURSAL3',
        codigoBarras: '7500000000129',
        fechaCaducidad: '2028-02-28'
      },
      {
        id: 13,
        nombre: 'Chaqueta de Cuero',
        categoria: 'Ropa',
        precio: 1500.00,
        stock: 5,
        imagen: 'https://example.com/chaqueta_cuero.jpg',
        sucursal: 'SUCURSAL3',
        codigoBarras: '7500000000136',
        fechaCaducidad: '2029-07-15'
      },
      {
        id: 14,
        nombre: 'Pantalón Negro',
        categoria: 'Ropa',
        precio: 550.00,
        stock: 6,
        imagen: 'https://example.com/pantalon_negro.jpg',
        sucursal: 'SUCURSAL3',
        codigoBarras: '7500000000143',
        fechaCaducidad: '2027-11-11'
      },
      {
        id: 15,
        nombre: 'Bufanda Azul',
        categoria: 'Ropa',
        precio: 150.00,
        stock: 14,
        imagen: 'https://example.com/bufanda_azul.jpg',
        sucursal: 'SUCURSAL3',
        codigoBarras: '7500000000150',
        fechaCaducidad: '2028-05-30'
      }
    ]
    localStorage.setItem('productos', JSON.stringify(productos))
    localStorage.setItem('siguienteId', '16')
  }

  // Normaliza nombres antiguos si es necesario
  productos = productos.map(p => {
    if (p.sucursal === 'CENTRO') p.sucursal = 'SUCURSAL1'
    else if (p.sucursal === 'NORTE') p.sucursal = 'SUCURSAL2'
    else if (p.sucursal === 'SUR') p.sucursal = 'SUCURSAL3'
    return p
  })

  // Guardar la normalización
  localStorage.setItem('productos', JSON.stringify(productos))

  // Retorna los productos filtrados por sucursal
  return productos.filter(p => p.sucursal === sucursal)
}
