// ===================================
// GESTIÓN DE SOLICITUDES - ADMIN
// ===================================

let sesionActual = null;
let solicitudes = [];
let usuarios = [];

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    verificarAutenticacion();
    
    // Cargar datos
    cargarDatos();
    
    // Cargar solicitudes
    cargarSolicitudes();
    
    // Event listeners
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);
    document.getElementById('buscarSolicitud').addEventListener('input', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Actualizar nombre de usuario
    if (sesionActual) {
        document.getElementById('nombreUsuario').textContent = sesionActual.nombre;
    }
});

/**
 * Verifica que el usuario esté autenticado y sea administrador
 */
function verificarAutenticacion() {
    sesionActual = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    if (!sesionActual) {
        window.location.href = '../login.html';
        return;
    }
    
    if (sesionActual.tipo !== 'administrador') {
        window.location.href = '../vista_usuario/dashboard-usuario.html';
        return;
    }
}

/**
 * Carga los datos desde localStorage
 */
function cargarDatos() {
    solicitudes = window.validacionesComunes.obtenerDeStorage('solicitudes') || [];
    usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
}

/**
 * Carga las solicitudes y actualiza estadísticas
 */
function cargarSolicitudes() {
    // Actualizar estadísticas
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    const aprobadas = solicitudes.filter(s => s.estado === 'aprobada').length;
    const rechazadas = solicitudes.filter(s => s.estado === 'rechazada').length;
    
    document.getElementById('totalPendientes').textContent = pendientes;
    document.getElementById('totalAprobadas').textContent = aprobadas;
    document.getElementById('totalRechazadas').textContent = rechazadas;
    document.getElementById('badgeSolicitudes').textContent = pendientes;
    
    // Aplicar filtros
    aplicarFiltros();
}

/**
 * Aplica los filtros a las solicitudes
 */
function aplicarFiltros() {
    const estadoFiltro = document.getElementById('filtroEstado').value;
    const busqueda = document.getElementById('buscarSolicitud').value.toLowerCase();
    
    let solicitudesFiltradas = solicitudes;
    
    // Filtrar por estado
    if (estadoFiltro) {
        solicitudesFiltradas = solicitudesFiltradas.filter(s => s.estado === estadoFiltro);
    }
    
    // Filtrar por búsqueda
    if (busqueda) {
        solicitudesFiltradas = solicitudesFiltradas.filter(s => 
            s.nombre.toLowerCase().includes(busqueda) ||
            s.email.toLowerCase().includes(busqueda) ||
            s.rut.includes(busqueda) ||
            s.telefono.includes(busqueda)
        );
    }
    
    mostrarSolicitudes(solicitudesFiltradas);
}

/**
 * Muestra las solicitudes en la tabla
 */
function mostrarSolicitudes(solicitudesAMostrar) {
    const tbody = document.getElementById('tablaSolicitudes');
    
    document.getElementById('cantidadSolicitudes').textContent = solicitudesAMostrar.length;
    
    if (solicitudesAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    No hay solicitudes que mostrar
                </td>
            </tr>
        `;
        return;
    }
    
    // Ordenar por fecha (más recientes primero)
    solicitudesAMostrar.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
    
    tbody.innerHTML = solicitudesAMostrar.map((s, index) => {
        const fecha = new Date(s.fechaSolicitud);
        const fechaFormateada = fecha.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const estadoBadge = {
            'pendiente': 'warning',
            'aprobada': 'success',
            'rechazada': 'danger'
        };
        
        const estadoTexto = {
            'pendiente': 'Pendiente',
            'aprobada': 'Aprobada',
            'rechazada': 'Rechazada'
        };
        
        return `
            <tr>
                <td><small>${fechaFormateada}</small></td>
                <td><strong>${s.nombre}</strong></td>
                <td>${s.rut}</td>
                <td>${s.email}</td>
                <td>+56 ${s.telefono}</td>
                <td><span class="badge bg-secondary">${s.pasaje}-${s.casa}</span></td>
                <td><span class="badge bg-${estadoBadge[s.estado]}">${estadoTexto[s.estado]}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="verDetalle(${index})" title="Ver detalle">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${s.estado === 'pendiente' ? `
                        <button class="btn btn-sm btn-success" onclick="aprobarSolicitud(${index})" title="Aprobar">
                            <i class="bi bi-check-circle"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="rechazarSolicitud(${index})" title="Rechazar">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Ver detalle de una solicitud
 */
window.verDetalle = function(index) {
    const estadoFiltro = document.getElementById('filtroEstado').value;
    const busqueda = document.getElementById('buscarSolicitud').value.toLowerCase();
    
    let solicitudesFiltradas = solicitudes;
    if (estadoFiltro) {
        solicitudesFiltradas = solicitudesFiltradas.filter(s => s.estado === estadoFiltro);
    }
    if (busqueda) {
        solicitudesFiltradas = solicitudesFiltradas.filter(s => 
            s.nombre.toLowerCase().includes(busqueda) ||
            s.email.toLowerCase().includes(busqueda) ||
            s.rut.includes(busqueda) ||
            s.telefono.includes(busqueda)
        );
    }
    
    const solicitud = solicitudesFiltradas[index];
    
    const fecha = new Date(solicitud.fechaSolicitud);
    const fechaFormateada = fecha.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const contenido = `
        <div class="mb-3">
            <strong><i class="bi bi-calendar"></i> Fecha de Solicitud:</strong><br>
            ${fechaFormateada}
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-person"></i> Nombre:</strong><br>
            ${solicitud.nombre}
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-card-text"></i> RUT:</strong><br>
            ${solicitud.rut}
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-envelope"></i> Email:</strong><br>
            <a href="mailto:${solicitud.email}">${solicitud.email}</a>
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-phone"></i> Teléfono:</strong><br>
            <a href="tel:+56${solicitud.telefono}">+56 ${solicitud.telefono}</a>
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-house-door"></i> Vivienda Solicitada:</strong><br>
            <span class="badge bg-secondary fs-6">Pasaje ${solicitud.pasaje}, Casa ${solicitud.casa}</span>
        </div>
        ${solicitud.mensaje ? `
        <div class="mb-3">
            <strong><i class="bi bi-chat-text"></i> Mensaje:</strong><br>
            <div class="p-3 bg-light rounded">${solicitud.mensaje}</div>
        </div>
        ` : ''}
        <div class="mb-0">
            <strong><i class="bi bi-circle-fill"></i> Estado:</strong><br>
            <span class="badge bg-${solicitud.estado === 'pendiente' ? 'warning' : solicitud.estado === 'aprobada' ? 'success' : 'danger'} fs-6">
                ${solicitud.estado === 'pendiente' ? 'Pendiente' : solicitud.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
            </span>
        </div>
    `;
    
    document.getElementById('detalleContenido').innerHTML = contenido;
    new bootstrap.Modal(document.getElementById('modalDetalle')).show();
};

/**
 * Aprobar una solicitud
 */
window.aprobarSolicitud = function(index) {
    const estadoFiltro = document.getElementById('filtroEstado').value;
    const busqueda = document.getElementById('buscarSolicitud').value.toLowerCase();
    
    let solicitudesFiltradas = solicitudes;
    if (estadoFiltro) {
        solicitudesFiltradas = solicitudesFiltradas.filter(s => s.estado === estadoFiltro);
    }
    if (busqueda) {
        solicitudesFiltradas = solicitudesFiltradas.filter(s => 
            s.nombre.toLowerCase().includes(busqueda) ||
            s.email.toLowerCase().includes(busqueda) ||
            s.rut.includes(busqueda) ||
            s.telefono.includes(busqueda)
        );
    }
    
    const solicitud = solicitudesFiltradas[index];
    
    if (!confirm(`¿Aprobar la solicitud de ${solicitud.nombre} para la casa ${solicitud.pasaje}-${solicitud.casa}?\n\nEsto creará una cuenta de residente con acceso al sistema.`)) {
        return;
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
        nombre: solicitud.nombre,
        rut: solicitud.rut,
        email: solicitud.email,
        telefono: solicitud.telefono,
        pasaje: solicitud.pasaje,
        casa: solicitud.casa,
        rol: 'residente',
        password: 'User123!', // Contraseña por defecto
        fechaRegistro: new Date().toISOString()
    };
    
    usuarios.push(nuevoUsuario);
    window.validacionesComunes.guardarEnStorage('usuarios', usuarios);
    
    // Actualizar estado de solicitud
    const solicitudIndex = solicitudes.findIndex(s => 
        s.email === solicitud.email && 
        s.fechaSolicitud === solicitud.fechaSolicitud
    );
    
    if (solicitudIndex !== -1) {
        solicitudes[solicitudIndex].estado = 'aprobada';
        solicitudes[solicitudIndex].fechaAprobacion = new Date().toISOString();
        solicitudes[solicitudIndex].aprobadoPor = sesionActual.email;
        window.validacionesComunes.guardarEnStorage('solicitudes', solicitudes);
    }
    
    window.validacionesComunes.mostrarAlerta('success', 
        `✅ Solicitud aprobada. Se ha creado la cuenta de <strong>${solicitud.nombre}</strong>.<br>
        <small>Credenciales: ${solicitud.email} / User123!</small>`, 
        'main');
    
    cargarDatos();
    cargarSolicitudes();
};

/**
 * Rechazar una solicitud
 */
window.rechazarSolicitud = function(index) {
    const estadoFiltro = document.getElementById('filtroEstado').value;
    const busqueda = document.getElementById('buscarSolicitud').value.toLowerCase();
    
    let solicitudesFiltradas = solicitudes;
    if (estadoFiltro) {
        solicitudesFiltradas = solicitudesFiltradas.filter(s => s.estado === estadoFiltro);
    }
    if (busqueda) {
        solicitudesFiltradas = solicitudesFiltradas.filter(s => 
            s.nombre.toLowerCase().includes(busqueda) ||
            s.email.toLowerCase().includes(busqueda) ||
            s.rut.includes(busqueda) ||
            s.telefono.includes(busqueda)
        );
    }
    
    const solicitud = solicitudesFiltradas[index];
    
    const motivo = prompt(`¿Estás seguro de rechazar la solicitud de ${solicitud.nombre}?\n\nPuedes escribir un motivo (opcional):`);
    
    if (motivo === null) {
        return; // Usuario canceló
    }
    
    // Actualizar estado de solicitud
    const solicitudIndex = solicitudes.findIndex(s => 
        s.email === solicitud.email && 
        s.fechaSolicitud === solicitud.fechaSolicitud
    );
    
    if (solicitudIndex !== -1) {
        solicitudes[solicitudIndex].estado = 'rechazada';
        solicitudes[solicitudIndex].fechaRechazo = new Date().toISOString();
        solicitudes[solicitudIndex].rechazadoPor = sesionActual.email;
        solicitudes[solicitudIndex].motivoRechazo = motivo || 'Sin motivo especificado';
        window.validacionesComunes.guardarEnStorage('solicitudes', solicitudes);
    }
    
    window.validacionesComunes.mostrarAlerta('info', 
        `Solicitud de <strong>${solicitud.nombre}</strong> rechazada.`, 
        'main');
    
    cargarDatos();
    cargarSolicitudes();
};

/**
 * Limpiar filtros
 */
function limpiarFiltros() {
    document.getElementById('filtroEstado').value = 'pendiente';
    document.getElementById('buscarSolicitud').value = '';
    aplicarFiltros();
}

/**
 * Cierra la sesión
 */
function cerrarSesion(e) {
    e.preventDefault();
    
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        window.validacionesComunes.eliminarDeStorage('sesionActual');
        window.location.href = '../login.html';
    }
}
