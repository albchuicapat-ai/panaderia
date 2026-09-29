document.addEventListener('DOMContentLoaded', function () {

  // Consigna 07: Modelo de catálogo como arreglo de objetos
  const catalogo = [
    { id: 'masaMadre', nombre: 'Pan de masa madre', precio: 18.00 },
    { id: 'alfajores', nombre: 'Caja de alfajores', precio: 24.00 },
    { id: 'torta', nombre: 'Torta pequeña', precio: 45.00 }
  ];

  const contenedor = document.getElementById('contenedorProductos');
  const form = document.getElementById('formPedido');

  // Consigna 07: Generación dinámica de la interfaz de productos mediante bucle
  catalogo.forEach(prod => {
    const row = document.createElement('div');
    row.className = 'row align-items-center mb-3 p-2 border-bottom';

    row.innerHTML = `
      <div class="col-12 col-sm-6">
        <label for="cant_${prod.id}" class="form-label mb-0 fw-bold">${prod.nombre}</label>
        <div class="text-muted small">Precio: S/ ${prod.precio.toFixed(2)}</div>
      </div>
      <div class="col-12 col-sm-6 mt-2 mt-sm-0">
        <div class="input-group">
          <span class="input-group-text">Cant.</span>
          <input type="number" class="form-control input-cantidad" id="cant_${prod.id}" 
                 data-precio="${prod.precio}" data-nombre="${prod.nombre}" data-id="${prod.id}"
                 min="0" max="10" step="1" value="0">
        </div>
        <div class="invalid-feedback" id="error_cant_${prod.id}"></div>
      </div>
    `;
    contenedor.appendChild(row);
  });

  // Escuchar eventos para recalcular los totales en tiempo real
  form.addEventListener('input', calcularTotales);
  document.getElementById('modalidad').addEventListener('change', calcularTotales);

  // Consigna 08: Función de cálculo de subtotal, descuento, reparto y total
  function calcularTotales() {
    let subtotal = 0;
    const inputs = document.querySelectorAll('.input-cantidad');

    inputs.forEach(input => {
      const cant = parseFloat(input.value) || 0;
      const precio = parseFloat(input.getAttribute('data-precio'));
      if (cant > 0) {
        subtotal += cant * precio;
      }
    });

    // Regla de descuento: 10% si el subtotal llega o supera S/ 100
    let descuento = 0;
    if (subtotal >= 100) {
      descuento = subtotal * 0.10;
    }

    // Regla de costo de reparto
    const modalidad = document.getElementById('modalidad').value;
    const reparto = (modalidad === 'reparto') ? 8.00 : 0.00;

    const total = (subtotal - descuento) + reparto;

    // Actualización visual en tiempo real con 2 decimales
    document.getElementById('lblSubtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('lblDescuento').textContent = `- S/ ${descuento.toFixed(2)}`;
    document.getElementById('lblReparto').textContent = `S/ ${reparto.toFixed(2)}`;
    document.getElementById('lblTotal').textContent = `S/ ${total.toFixed(2)}`;

    return { subtotal, descuento, reparto, total };
  }

  // Consigna 07 & 09: Validación al enviar y guardado en sessionStorage
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    limpiarErrores();

    let esValido = true;

    // Validación del cliente
    const nombreVal = document.getElementById('nombre').value.trim();
    const emailVal = document.getElementById('email').value.trim();
    const fechaVal = document.getElementById('fecha').value;
    const modalidadVal = document.getElementById('modalidad').value;

    if (nombreVal.length < 3 || nombreVal.length > 60) {
      mostrarError('nombre', 'errorNombre', 'El nombre debe tener entre 3 y 60 caracteres.');
      esValido = false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(emailVal)) {
      mostrarError('email', 'errorEmail', 'Ingrese un correo electrónico válido.');
      esValido = false;
    }

    if (!fechaVal) {
      mostrarError('fecha', 'errorFecha', 'Debe seleccionar una fecha de entrega.');
      esValido = false;
    } else {
      const fechaSel = new Date(fechaVal + 'T00:00:00');
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaSel < hoy) {
        mostrarError('fecha', 'errorFecha', 'La fecha no puede ser anterior a la de hoy.');
        esValido = false;
      }
    }

    // Validación de productos y cantidades
    const inputs = document.querySelectorAll('.input-cantidad');
    const productosElegidos = [];
    let hayInvalido = false;

    inputs.forEach(input => {
      const valStr = input.value.trim();
      const cant = Number(valStr);
      const prodId = input.getAttribute('data-id');
      const nombre = input.getAttribute('data-nombre');
      const precio = parseFloat(input.getAttribute('data-precio'));

      if (valStr !== '' && valStr !== '0') {
        // Regla: Entero entre 1 y 10
        if (!Number.isInteger(cant) || cant < 1 || cant > 10) {
          mostrarError(`cant_${prodId}`, `error_cant_${prodId}`, 'La cantidad debe ser un entero entre 1 y 10.');
          hayInvalido = true;
        } else {
          productosElegidos.push({
            id: prodId,
            nombre: nombre,
            precio: precio,
            cantidad: cant,
            subtotalItem: cant * precio
          });
        }
      }
    });

    if (hayInvalido) {
      esValido = false;
    }

    // Regla: Debe elegirse al menos un producto válido
    const errorGlobal = document.getElementById('errorProductosGlobal');
    if (productosElegidos.length === 0 && !hayInvalido) {
      errorGlobal.textContent = 'Debe seleccionar al menos un producto con una cantidad entre 1 y 10.';
      errorGlobal.classList.remove('d-none');
      esValido = false;
    } else {
      errorGlobal.classList.add('d-none');
    }

    // Consigna 09: Guardar objeto pedido en sessionStorage y navegar
    if (esValido) {
      const montos = calcularTotales();

      const pedido = {
        cliente: nombreVal,
        email: emailVal,
        fecha: fechaVal,
        modalidad: modalidadVal,
        productos: productosElegidos,
        subtotal: montos.subtotal,
        descuento: montos.descuento,
        reparto: montos.reparto,
        total: montos.total
      };

      sessionStorage.setItem('pedidoPanaderia', JSON.stringify(pedido));
      window.location.href = 'resumen-pedido.html';
    }
  });

  function mostrarError(campoId, errorId, mensaje) {
    const input = document.getElementById(campoId);
    const feedback = document.getElementById(errorId);
    if (input) input.classList.add('is-invalid');
    if (feedback) feedback.textContent = mensaje;
  }

  function limpiarErrores() {
    const inputs = document.querySelectorAll('.form-control, .form-select');
    inputs.forEach(input => input.classList.remove('is-invalid'));
    const feedbacks = document.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(fb => fb.textContent = '');
  }
});