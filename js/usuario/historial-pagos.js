// HISTORIAL DE PAGOS
let todosPagos = [];

document.addEventListener('DOMContentLoaded', function() {
    verificarSesionUsuario();
    cargarDatosUsuario();
    cargarHistorialPagos();
    
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    document.getElementById('btnFiltrar').addEventListener('click', filtrarPorFecha);
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
    }
}

function cargarHistorialPagos() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
    
    // Filtrar solo los pagos del usuario actual
    todosPagos = pagos.filter(p => p.email === sesion.email);
    
    mostrarPagos(todosPagos);
    actualizarResumen(todosPagos);
}

function mostrarPagos(pagos) {
    const tbody = document.getElementById('tablaPagos');
    
    if (pagos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-3"></i>
                    <p class="mt-3 mb-0">No hay pagos registrados</p>
                    <a href="realizar-pago.html" class="btn btn-success mt-3">
                        <i class="bi bi-credit-card"></i> Realizar Primer Pago
                    </a>
                </td>
            </tr>
        `;
        return;
    }
    
    // Ordenar por fecha descendente
    pagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    tbody.innerHTML = pagos.map(p => `
        <tr class="fade-in">
            <td><strong>${new Date(p.fecha).toLocaleDateString('es-CL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</strong></td>
            <td>Gastos Comunes - ${new Date(p.fecha).toLocaleDateString('es-CL', { 
                month: 'long', 
                year: 'numeric' 
            })}</td>
            <td class="text-success fw-bold">${formatearMoneda(p.monto)}</td>
            <td><span class="badge bg-info">${p.metodoPago || 'Transferencia'}</span></td>
            <td><span class="badge bg-success"><i class="bi bi-check-circle"></i> Pagado</span></td>
        </tr>
    `).join('');
}

function actualizarResumen(pagos) {
    const totalPagos = pagos.length;
    const totalPagado = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);
    
    document.getElementById('totalPagos').textContent = totalPagos;
    document.getElementById('totalPagado').textContent = formatearMoneda(totalPagado);
    
    if (pagos.length > 0) {
        const ultimoPago = pagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
        document.getElementById('ultimoPago').textContent = new Date(ultimoPago.fecha).toLocaleDateString('es-CL');
    } else {
        document.getElementById('ultimoPago').textContent = 'Sin pagos';
    }
}

function filtrarPorFecha() {
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    
    if (!fechaDesde && !fechaHasta) {
        mostrarPagos(todosPagos);
        window.validacionesComunes.mostrarAlerta('info', 'Mostrando todos los pagos', 'main');
        return;
    }
    
    const pagosFiltrados = todosPagos.filter(p => {
        const fechaPago = new Date(p.fecha);
        const desde = fechaDesde ? new Date(fechaDesde) : new Date('1900-01-01');
        const hasta = fechaHasta ? new Date(fechaHasta) : new Date('2100-12-31');
        
        return fechaPago >= desde && fechaPago <= hasta;
    });
    
    mostrarPagos(pagosFiltrados);
    actualizarResumen(pagosFiltrados);
    
    window.validacionesComunes.mostrarAlerta('success', 
        `Se encontraron ${pagosFiltrados.length} pago(s)`, 'main');
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
