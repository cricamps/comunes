// DASHBOARD USUARIO
document.addEventListener('DOMContentLoaded', function() {
    verificarSesionUsuario();
    cargarDatosUsuario();
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
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
        document.getElementById('nombreCompleto').textContent = usuario.nombre;
        if (usuario.casa) {
            document.getElementById('pasajeUsuario').textContent = usuario.casa.pasaje;
            document.getElementById('casaUsuario').textContent = usuario.casa.letra;
        }
        
        // Calcular gasto del mes
        const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
        const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        const gastosPorCasa = totalGastos / 13;
        document.getElementById('gastoMes').textContent = formatearMoneda(gastosPorCasa);
        
        // Verificar estado de pago
        const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
        const pagoMes = pagos.find(p => p.email === sesion.email);
        
        if (pagoMes) {
            document.getElementById('estadoPago').textContent = 'Pagado';
            document.getElementById('estadoPago').parentElement.parentElement.querySelector('.stat-icon').classList.remove('bg-warning');
            document.getElementById('estadoPago').parentElement.parentElement.querySelector('.stat-icon').classList.add('bg-success');
            document.getElementById('ultimoPago').textContent = new Date(pagoMes.fecha).toLocaleDateString('es-CL');
        } else {
            document.getElementById('estadoPago').textContent = 'Pendiente';
            document.getElementById('ultimoPago').textContent = 'Sin pagos';
        }
    }
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
