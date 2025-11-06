// MIS GASTOS
document.addEventListener('DOMContentLoaded', function() {
    verificarSesionUsuario();
    cargarDatosUsuario();
    cargarGastos();
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
        if (usuario.casa) {
            document.getElementById('pasajeUsuario').textContent = usuario.casa.pasaje;
            document.getElementById('casaUsuario').textContent = usuario.casa.letra;
        }
    }
}

function cargarGastos() {
    const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
    
    // Filtrar gastos del mes actual
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();
    
    const gastosMes = gastos.filter(g => {
        const fecha = new Date(g.fecha);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    });
    
    const tbody = document.getElementById('tablaGastos');
    
    if (gastosMes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-3"></i>
                    <p class="mt-3 mb-0">No hay gastos registrados este mes</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let totalGeneral = 0;
    
    tbody.innerHTML = gastosMes.map(g => {
        const tuParte = parseFloat(g.monto) / 13;
        totalGeneral += parseFloat(g.monto);
        
        return `
            <tr class="fade-in">
                <td><strong>${g.concepto}</strong></td>
                <td><span class="badge bg-info">${g.categoria}</span></td>
                <td class="fw-bold">${formatearMoneda(g.monto)}</td>
                <td class="text-success fw-bold">${formatearMoneda(tuParte)}</td>
                <td>${new Date(g.fecha).toLocaleDateString('es-CL')}</td>
            </tr>
        `;
    }).join('');
    
    const tuParteTotal = totalGeneral / 13;
    
    // Actualizar totales
    document.getElementById('totalMes').textContent = formatearMoneda(tuParteTotal);
    document.getElementById('cantidadGastos').textContent = gastosMes.length;
    document.getElementById('tuParte').textContent = formatearMoneda(tuParteTotal);
    document.getElementById('totalGeneral').textContent = formatearMoneda(totalGeneral);
    document.getElementById('totalTuParte').textContent = formatearMoneda(tuParteTotal);
    
    // Verificar si ya pagó
    const pagado = pagos.some(p => p.email === sesion.email);
    const estadoElement = document.getElementById('estadoPago');
    
    if (pagado) {
        estadoElement.textContent = 'Pagado';
        estadoElement.classList.remove('text-warning');
        estadoElement.classList.add('text-success');
        estadoElement.closest('.card').classList.remove('border-warning');
        estadoElement.closest('.card').classList.add('border-success');
    } else {
        estadoElement.textContent = 'Pendiente';
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
