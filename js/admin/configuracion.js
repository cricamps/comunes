// ===================================
// CONFIGURACIÓN - ADMIN
// ===================================

let sesionActual = null;
let configuracion = {};

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    verificarAutenticacion();
    
    // Cargar configuración
    cargarConfiguracion();
    
    // Cargar propietarios
    cargarPropietarios();
    
    // Event listeners
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    document.getElementById('formGastosComunes').addEventListener('submit', guardarConfiguracionGastos);
    document.getElementById('formConfigGeneral').addEventListener('submit', guardarConfiguracionGeneral);
    
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
 * Carga la configuración desde localStorage
 */
function cargarConfiguracion() {
    configuracion = window.validacionesComunes.obtenerDeStorage('configuracion') || {
        montoMensual: 95000,
        diaVencimiento: 15,
        fechaEmision: 1,
        totalCasas: 13,
        nombreComunidad: 'Pasajes 8651 y 8707',
        direccion: '',
        emailContacto: ''
    };
    
    // Llenar formulario de gastos comunes
    document.getElementById('montoMensual').value = configuracion.montoMensual || 95000;
    document.getElementById('diaVencimiento').value = configuracion.diaVencimiento || 15;
    document.getElementById('fechaEmision').value = configuracion.fechaEmision || 1;
    document.getElementById('totalCasas').value = configuracion.totalCasas || 13;
    
    // Llenar formulario general
    document.getElementById('nombreComunidad').value = configuracion.nombreComunidad || 'Pasajes 8651 y 8707';
    document.getElementById('direccionComunidad').value = configuracion.direccion || '';
    document.getElementById('emailContacto').value = configuracion.emailContacto || '';
    
    // Actualizar resumen
    actualizarResumen();
}

/**
 * Actualiza el resumen de configuración
 */
function actualizarResumen() {
    const monto = document.getElementById('montoMensual').value || 0;
    const vencimiento = document.getElementById('diaVencimiento').value || 15;
    const emision = document.getElementById('fechaEmision').value || 1;
    
    document.getElementById('resumenMonto').textContent = `$${parseInt(monto).toLocaleString('es-CL')}`;
    document.getElementById('resumenVencimiento').textContent = `Día ${vencimiento}`;
    document.getElementById('resumenEmision').textContent = `Día ${emision}`;
}

/**
 * Guarda la configuración de gastos comunes
 */
function guardarConfiguracionGastos(e) {
    e.preventDefault();
    
    const montoMensual = parseInt(document.getElementById('montoMensual').value) || 0;
    const diaVencimiento = parseInt(document.getElementById('diaVencimiento').value) || 15;
    const fechaEmision = parseInt(document.getElementById('fechaEmision').value) || 1;
    
    // Validaciones
    if (montoMensual <= 0) {
        window.validacionesComunes.mostrarAlerta('warning', 
            '⚠️ El monto mensual debe ser mayor a 0', 
            'main');
        return;
    }
    
    // Actualizar configuración
    configuracion.montoMensual = montoMensual;
    configuracion.diaVencimiento = diaVencimiento;
    configuracion.fechaEmision = fechaEmision;
    
    // Guardar en localStorage
    window.validacionesComunes.guardarEnStorage('configuracion', configuracion);
    
    // Actualizar resumen
    actualizarResumen();
    
    window.validacionesComunes.mostrarAlerta('success', 
        '✅ Configuración de gastos comunes guardada correctamente', 
        'main');
}

/**
 * Guarda la configuración general
 */
function guardarConfiguracionGeneral(e) {
    e.preventDefault();
    
    configuracion.nombreComunidad = document.getElementById('nombreComunidad').value.trim();
    configuracion.direccion = document.getElementById('direccionComunidad').value.trim();
    configuracion.emailContacto = document.getElementById('emailContacto').value.trim();
    
    window.validacionesComunes.guardarEnStorage('configuracion', configuracion);
    
    window.validacionesComunes.mostrarAlerta('success', 
        '✅ Configuración general guardada correctamente', 
        'main');
}

/**
 * Carga los propietarios en la tabla
 */
function cargarPropietarios() {
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const propietarios = usuarios.filter(u => u.pasaje && u.casa);
    
    const tbody = document.getElementById('tablaPropietarios');
    
    if (propietarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    No hay propietarios registrados
                </td>
            </tr>
        `;
        document.getElementById('totalPropietarios').textContent = '0';
        document.getElementById('casasOcupadasProp').textContent = '0';
        document.getElementById('casasDisponiblesProp').textContent = '13';
        return;
    }
    
    tbody.innerHTML = propietarios.map(p => `
        <tr>
            <td><strong>${p.nombre}</strong></td>
            <td>${p.rut}</td>
            <td><span class="badge bg-secondary">Pasaje ${p.pasaje}, Casa ${p.casa}</span></td>
            <td>${p.email}</td>
            <td>+56 ${p.telefono}</td>
            <td><span class="badge bg-success">Activo</span></td>
        </tr>
    `).join('');
    
    // Actualizar estadísticas
    const totalPropietarios = propietarios.length;
    const casasOcupadas = propietarios.length;
    const casasDisponibles = 13 - casasOcupadas;
    
    document.getElementById('totalPropietarios').textContent = totalPropietarios;
    document.getElementById('casasOcupadasProp').textContent = casasOcupadas;
    document.getElementById('casasDisponiblesProp').textContent = casasDisponibles;
}

/**
 * Exporta los propietarios a Excel (simulado como CSV)
 */
window.exportarPropietarios = function() {
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const propietarios = usuarios.filter(u => u.pasaje && u.casa);
    
    if (propietarios.length === 0) {
        window.validacionesComunes.mostrarAlerta('warning', 
            '⚠️ No hay propietarios para exportar', 
            'main');
        return;
    }
    
    // Crear CSV
    let csv = 'Nombre,RUT,Pasaje,Casa,Email,Teléfono,Fecha Registro\n';
    
    propietarios.forEach(p => {
        const fecha = p.fechaRegistro ? new Date(p.fechaRegistro).toLocaleDateString('es-CL') : 'N/A';
        csv += `"${p.nombre}","${p.rut}","${p.pasaje}","${p.casa}","${p.email}","+56${p.telefono}","${fecha}"\n`;
    });
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `propietarios_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.validacionesComunes.mostrarAlerta('success', 
        '✅ Archivo CSV descargado correctamente', 
        'main');
};

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
