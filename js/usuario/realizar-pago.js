// REALIZAR PAGO - VERSIÓN CORREGIDA
document.addEventListener('DOMContentLoaded', function() {
    verificarSesionUsuario();
    cargarDatosUsuario();
    cargarResumenPago();
    
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    document.getElementById('metodoPago').addEventListener('change', function() {
        const infoBancaria = document.getElementById('infoBancaria');
        if (this.value === 'Transferencia') {
            infoBancaria.classList.remove('d-none');
        } else {
            infoBancaria.classList.add('d-none');
        }
    });
    
    document.getElementById('formPago').addEventListener('submit', procesarPago);
});

function verificarSesionUsuario() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    if (!sesion || sesion.tipo !== 'residente') {
        window.location.href = '../login.html';
    }
}

function cargarDatosUsuario() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    if (!sesion) return;
    
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const usuario = usuarios.find(u => u.email === sesion.email);
    
    if (usuario) {
        document.getElementById('nombreUsuario').textContent = usuario.nombre.split(' ')[0];
        document.getElementById('nombreResidente').textContent = usuario.nombre;
        
        // Corregido: acceder directamente a las propiedades
        if (usuario.pasaje && usuario.casa) {
            document.getElementById('pasaje').textContent = usuario.pasaje;
            document.getElementById('casa').textContent = usuario.casa;
        }
    }
}

function cargarResumenPago() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
    const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
    
    // Calcular total de gastos aprobados
    const gastosAprobados = gastos.filter(g => g.estado === 'aprobado');
    const totalGastos = gastosAprobados.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
    const tuParte = Math.round(totalGastos / 13);
    
    // Mostrar información
    const fechaActual = new Date();
    document.getElementById('periodo').textContent = fechaActual.toLocaleDateString('es-CL', { 
        month: 'long', 
        year: 'numeric' 
    }).replace(/^\w/, (c) => c.toUpperCase());
    
    document.getElementById('fechaActual').textContent = fechaActual.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    document.getElementById('totalPagar').textContent = formatearMoneda(tuParte);
    
    // Verificar si ya pagó este mes
    const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
    const yaPago = pagos.some(p => 
        p.email === sesion.email && 
        p.mes === mesActual &&
        p.estado === 'confirmado'
    );
    
    const estadoDiv = document.getElementById('estadoPago');
    const formCard = document.getElementById('cardFormulario');
    
    if (yaPago) {
        estadoDiv.innerHTML = `
            <div class="alert alert-success">
                <i class="bi bi-check-circle-fill"></i>
                <strong>¡Ya has realizado el pago de este mes!</strong>
                <p class="mb-0">Tu pago ha sido registrado correctamente.</p>
            </div>
        `;
        formCard.style.display = 'none';
    } else {
        estadoDiv.innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <strong>Pago Pendiente</strong>
                <p class="mb-0">Completa el formulario para registrar tu pago.</p>
            </div>
        `;
    }
}

function procesarPago(e) {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const usuario = usuarios.find(u => u.email === sesion.email);
    
    if (!usuario) {
        alert('Error: Usuario no encontrado');
        return;
    }
    
    // Calcular monto
    const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
    const gastosAprobados = gastos.filter(g => g.estado === 'aprobado');
    const totalGastos = gastosAprobados.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
    const monto = Math.round(totalGastos / 13);
    
    // Crear objeto de pago
    const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const pago = {
        id: Date.now(),
        email: sesion.email,
        nombreResidente: usuario.nombre,
        pasaje: usuario.pasaje,
        casa: usuario.casa,
        monto: monto,
        mes: mesActual,
        fechaPago: new Date().toISOString(),
        metodoPago: document.getElementById('metodoPago').value,
        numeroReferencia: document.getElementById('numeroReferencia').value || 'N/A',
        estado: 'confirmado',
        registradoPor: sesion.email
    };
    
    // Mostrar loading
    const btnSubmit = document.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando pago...';
    
    // Simular procesamiento
    setTimeout(() => {
        // Guardar pago
        const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
        pagos.push(pago);
        window.validacionesComunes.guardarEnStorage('pagos', pagos);
        
        // Mostrar mensaje de éxito
        const alerta = document.createElement('div');
        alerta.className = 'alert alert-success alert-dismissible fade show';
        alerta.innerHTML = `
            <i class="bi bi-check-circle-fill"></i>
            <strong>¡Pago registrado exitosamente!</strong> 
            Redirigiendo al historial...
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('main').insertBefore(alerta, document.querySelector('main').firstChild);
        
        // Redirigir al historial
        setTimeout(() => {
            window.location.href = 'historial-pagos.html';
        }, 2000);
    }, 1500);
}

function validarFormulario() {
    let valido = true;
    
    // Validar método de pago
    const metodoPago = document.getElementById('metodoPago');
    const metodoPagoError = document.getElementById('metodoPagoError');
    
    if (!metodoPago.value) {
        metodoPago.classList.add('is-invalid');
        metodoPagoError.textContent = 'Selecciona un método de pago';
        valido = false;
    } else {
        metodoPago.classList.remove('is-invalid');
        metodoPago.classList.add('is-valid');
    }
    
    // Validar confirmación
    const confirmar = document.getElementById('confirmar');
    const confirmarError = document.getElementById('confirmarError');
    
    if (!confirmar.checked) {
        confirmar.classList.add('is-invalid');
        confirmarError.textContent = 'Debes confirmar el pago';
        valido = false;
    } else {
        confirmar.classList.remove('is-invalid');
        confirmar.classList.add('is-valid');
    }
    
    return valido;
}

function cerrarSesion(e) {
    e.preventDefault();
    if (confirm('¿Cerrar sesión?')) {
        window.validacionesComunes.eliminarDeStorage('sesionActual');
        window.location.href = '../login.html';
    }
}

function formatearMoneda(monto) {
    return new Intl.NumberFormat('es-CL', { 
        style: 'currency', 
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(monto);
}

console.log('✅ Realizar Pago cargado correctamente');
