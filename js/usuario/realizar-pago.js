// REALIZAR PAGO
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
    if (!sesion || sesion.tipo !== 'residente') window.location.href = '../login.html';
}

function cargarDatosUsuario() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    if (!sesion) return;
    
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const usuario = usuarios.find(u => u.email === sesion.email);
    
    if (usuario) {
        document.getElementById('nombreUsuario').textContent = usuario.nombre.split(' ')[0];
        document.getElementById('nombreResidente').textContent = usuario.nombre;
        
        if (usuario.casa) {
            document.getElementById('pasaje').textContent = usuario.casa.pasaje;
            document.getElementById('casa').textContent = usuario.casa.letra;
        }
    }
}

function cargarResumenPago() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
    const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
    
    // Calcular total del mes
    const fechaActual = new Date();
    const gastosMes = gastos.filter(g => {
        const fecha = new Date(g.fecha);
        return fecha.getMonth() === fechaActual.getMonth() && 
               fecha.getFullYear() === fechaActual.getFullYear();
    });
    
    const totalGastos = gastosMes.reduce((sum, g) => sum + parseFloat(g.monto), 0);
    const tuParte = totalGastos / 13;
    
    // Mostrar información
    document.getElementById('periodo').textContent = fechaActual.toLocaleDateString('es-CL', { 
        month: 'long', 
        year: 'numeric' 
    });
    document.getElementById('fechaActual').textContent = fechaActual.toLocaleDateString('es-CL');
    document.getElementById('totalPagar').textContent = formatearMoneda(tuParte);
    
    // Verificar si ya pagó
    const yaPago = pagos.some(p => p.email === sesion.email);
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
    
    const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
    const gastosMes = gastos.filter(g => {
        const fecha = new Date(g.fecha);
        const hoy = new Date();
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    });
    
    const totalGastos = gastosMes.reduce((sum, g) => sum + parseFloat(g.monto), 0);
    const monto = totalGastos / 13;
    
    const pago = {
        id: Date.now(),
        email: sesion.email,
        nombreResidente: usuario.nombre,
        pasaje: usuario.casa.pasaje,
        casa: usuario.casa.letra,
        monto: monto,
        fecha: new Date().toISOString(),
        metodoPago: document.getElementById('metodoPago').value,
        numeroReferencia: document.getElementById('numeroReferencia').value,
        estado: 'Pagado'
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
        window.validacionesComunes.mostrarAlerta('success', 
            '¡Pago registrado exitosamente! Redirigiendo...', 
            'main');
        
        // Redirigir al historial
        setTimeout(() => {
            window.location.href = 'historial-pagos.html';
        }, 2000);
    }, 2000);
}

function validarFormulario() {
    let valido = true;
    
    const metodoPago = document.getElementById('metodoPago').value;
    if (!metodoPago) {
        window.validacionesComunes.mostrarError('metodoPago', 'Selecciona un método de pago');
        valido = false;
    } else {
        window.validacionesComunes.mostrarExito('metodoPago');
    }
    
    const confirmar = document.getElementById('confirmar').checked;
    if (!confirmar) {
        window.validacionesComunes.mostrarError('confirmar', 'Debes confirmar el pago');
        valido = false;
    } else {
        window.validacionesComunes.mostrarExito('confirmar');
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
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
}
