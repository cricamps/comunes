// DASHBOARD USUARIO - VERSIÓN MEJORADA
document.addEventListener('DOMContentLoaded', function() {
    verificarSesionUsuario();
    cargarDatosUsuario();
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
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
        // Nombre del usuario
        document.getElementById('nombreUsuario').textContent = usuario.nombre.split(' ')[0];
        document.getElementById('nombreCompleto').textContent = usuario.nombre;
        
        // Información de la casa
        if (usuario.pasaje && usuario.casa) {
            document.getElementById('pasajeUsuario').textContent = usuario.pasaje;
            document.getElementById('casaUsuario').textContent = usuario.casa;
        }
        
        // Calcular gasto del mes (total gastos / 13 casas)
        const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
        const gastosAprobados = gastos.filter(g => g.estado === 'aprobado');
        const totalGastos = gastosAprobados.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
        const gastosPorCasa = Math.round(totalGastos / 13);
        
        // Mostrar gasto del mes
        document.getElementById('gastoMes').textContent = formatearMoneda(gastosPorCasa);
        
        // Verificar estado de pago del mes actual
        const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
        const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
        const pagoMesActual = pagos.find(p => 
            p.email === sesion.email && 
            p.mes === mesActual &&
            p.estado === 'confirmado'
        );
        
        if (pagoMesActual) {
            // Ya pagó este mes
            document.getElementById('estadoPago').textContent = 'Pagado';
            document.getElementById('estadoPago').parentElement.parentElement.querySelector('.stat-icon').classList.remove('bg-warning');
            document.getElementById('estadoPago').parentElement.parentElement.querySelector('.stat-icon').classList.add('bg-success');
            document.getElementById('deudaActual').textContent = '$0';
            document.getElementById('deudaActual').classList.remove('text-danger');
            document.getElementById('deudaActual').classList.add('text-success');
            
            // Mostrar fecha del último pago
            const fechaPago = new Date(pagoMesActual.fechaPago);
            document.getElementById('ultimoPago').textContent = fechaPago.toLocaleDateString('es-CL', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
            });
        } else {
            // Aún no ha pagado
            document.getElementById('estadoPago').textContent = 'Pendiente';
            document.getElementById('deudaActual').textContent = formatearMoneda(gastosPorCasa);
            
            // Buscar el último pago (cualquier mes)
            const pagosPrevios = pagos.filter(p => p.email === sesion.email && p.estado === 'confirmado');
            if (pagosPrevios.length > 0) {
                // Ordenar por fecha y obtener el más reciente
                pagosPrevios.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
                const ultimoPago = pagosPrevios[0];
                const fechaPago = new Date(ultimoPago.fechaPago);
                document.getElementById('ultimoPago').textContent = fechaPago.toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } else {
                document.getElementById('ultimoPago').textContent = 'Sin pagos';
            }
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
    return new Intl.NumberFormat('es-CL', { 
        style: 'currency', 
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(monto);
}

console.log('✅ Dashboard Usuario cargado correctamente');
