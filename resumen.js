document.addEventListener('DOMContentLoaded', function () {
  const mensajeSinDatos = document.getElementById('mensajeSinDatos');
  const cardResumen = document.getElementById('cardResumen');
  const btnCorregir = document.getElementById('btnCorregir');

  // Recuperar datos almacenados en sessionStorage
  const datosGuardados = sessionStorage.getItem('pedidoPanaderia');

  // Control de entrada directa sin datos
  if (!datosGuardados) {
    mensajeSinDatos.classList.remove('d-none');
    cardResumen.classList.add('d-none');
  } else {
    const pedido = JSON.parse(datosGuardados);

    // Renderizar datos del cliente
    document.getElementById('resCliente').textContent = pedido.cliente;
    document.getElementById('resEmail').textContent = pedido.email;
    document.getElementById('resFecha').textContent = pedido.fecha;
    document.getElementById('resModalidad').textContent = 
      (pedido.modalidad === 'reparto') ? 'Reparto a domicilio (S/ 8.00)' : 'Retiro en tienda (S/ 0.00)';

    // Renderizar filas de la tabla de productos
    const tabla = document.getElementById('tablaProductos');
    tabla.innerHTML = '';

    pedido.productos.forEach(prod => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${prod.nombre}</td>
        <td class="text-center">S/ ${prod.precio.toFixed(2)}</td>
        <td class="text-center">${prod.cantidad}</td>
        <td class="text-end">S/ ${prod.subtotalItem.toFixed(2)}</td>
      `;
      tabla.appendChild(tr);
    });

    // Renderizar montos finales
    document.getElementById('resSubtotal').textContent = `S/ ${pedido.subtotal.toFixed(2)}`;
    document.getElementById('resDescuento').textContent = `- S/ ${pedido.descuento.toFixed(2)}`;
    document.getElementById('resReparto').textContent = `S/ ${pedido.reparto.toFixed(2)}`;
    document.getElementById('resTotal').textContent = `S/ ${pedido.total.toFixed(2)}`;

    cardResumen.classList.remove('d-none');
    mensajeSinDatos.classList.add('d-none');
  }

  // Redirección para corregir o modificar el pedido
  if (btnCorregir) {
    btnCorregir.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }
});