// ===================================
// GESTIONAR RESIDENTES
// ===================================

let residentes = [];

document.addEventListener('DOMContentLoaded', function() {
    verificarSesionAdmin();
    cargarNombreAdmin();
    cargarResidentes();
    cargarEstadisticas();
    
    // Event listeners
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    document.getElementById('btnGuardarResidente').addEventListener('click', guardarResidente);
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminar);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Filtros
    document.getElementById('inputBuscar').addEventListener('input', aplicarFiltros);
    document.getElementById('selectPasaje').addEventListener('change', function() {
        actualizarSelectCasaFiltro();
        aplicarFiltros();
    });
    document.getElementById('selectCasa').addEventListener('change', aplicarFiltros);
    
    // Formulario
    document.getElementById('rut').addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9kK]/g, '');
        if (this.value.length > 1) {
            this.value = window.validacionesComunes.formatearRUT(this.value);
        }
    });
    
    document.getElementById('telefono').addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    document.getElementById('pasaje').addEventListener('change', actualizarSelectCasa);
    
    document.getElementById('modalNuevoResidente').addEventListener('hidden.bs.modal', limpiarFormulario);
});

function verificarSesionAdmin() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    if (!sesion || sesion.tipo !== 'administrador') {
        window.location.href = '../login.html';
    }
}

function cargarNombreAdmin() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    if (sesion) document.getElementById('nombreAdmin').textContent = sesion.nombre || 'Admin';
}

function cerrarSesion(e) {
    e.preventDefault();
    if (confirm('¿Cerrar sesión?')) {
        window.validacionesComunes.eliminarDeStorage('sesionActual');
        window.location.href = '../login.html';
    }
}

function cargarResidentes() {
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    residentes = usuarios.filter(u => u.casa); // Solo usuarios con casa asignada
    mostrarResidentes(residentes);
}

function cargarEstadisticas() {
    const totalCasas = 13;
    const casasOcupadas = residentes.length;
    const casasDisponibles = totalCasas - casasOcupadas;
    const porcentaje = ((casasOcupadas / totalCasas) * 100).toFixed(0);
    
    document.getElementById('totalResidentes').textContent = casasOcupadas;
    document.getElementById('casasOcupadas').textContent = casasOcupadas;
    document.getElementById('casasDisponibles').textContent = casasDisponibles;
    document.getElementById('porcentajeOcupacion').textContent = porcentaje;
}

function mostrarResidentes(residentesAMostrar) {
    const tbody = document.getElementById('tablaResidentes');
    
    if (residentesAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6" class="text-center text-muted py-5">
                <i class="bi bi-inbox fs-3"></i>
                <p class="mt-3 mb-0">No hay residentes registrados</p>
                <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#modalNuevoResidente">
                    <i class="bi bi-person-plus"></i> Agregar Primer Residente
                </button>
            </td></tr>
        `;
        return;
    }
    
    tbody.innerHTML = residentesAMostrar.map(r => `
        <tr class="fade-in">
            <td><strong>${r.nombre}</strong></td>
            <td>${r.rut}</td>
            <td>${r.email}</td>
            <td>+56 ${r.telefono}</td>
            <td>
                <span class="badge bg-${r.rol === 'administrador' ? 'danger' : 'secondary'}">
                    Pasaje ${r.pasaje}, Casa ${r.casa}
                </span>
                ${r.rol === 'administrador' ? '<span class="badge bg-warning ms-1"><i class="bi bi-shield-check"></i> Admin</span>' : ''}
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="verResidente('${r.email}')" title="Ver detalles">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editarResidente('${r.email}')" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarResidente('${r.email}', '${r.nombre}')" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function guardarResidente() {
    if (!validarFormulario()) return;
    
    const emailOriginal = document.getElementById('residenteEmail').value;
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    
    const residente = {
        nombre: document.getElementById('nombre').value.trim(),
        rut: document.getElementById('rut').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        pasaje: document.getElementById('pasaje').value,
        casa: document.getElementById('casa').value,
        rol: document.getElementById('rol').value || 'residente',
        password: emailOriginal ? null : 'User123!', // Solo para nuevos
        fechaRegistro: emailOriginal ? null : new Date().toISOString()
    };
    
    if (emailOriginal) {
        // Editar
        const index = usuarios.findIndex(u => u.email === emailOriginal);
        if (index !== -1) {
            // Preservar campos que no deben cambiar en edición
            const usuarioActual = usuarios[index];
            usuarios[index] = { 
                ...usuarioActual, 
                ...residente,
                password: usuarioActual.password, // Mantener contraseña original
                fechaRegistro: usuarioActual.fechaRegistro // Mantener fecha original
            };
        }
    } else {
        // Nuevo - verificar que la casa no esté ocupada
        const casaOcupada = usuarios.some(u => 
            u.pasaje && u.casa && u.pasaje === residente.pasaje && u.casa === residente.casa
        );
        
        if (casaOcupada) {
            window.validacionesComunes.mostrarAlerta('danger', 
                'Esta casa ya está ocupada por otro residente', 'main');
            return;
        }
        
        usuarios.push(residente);
    }
    
    window.validacionesComunes.guardarEnStorage('usuarios', usuarios);
    window.validacionesComunes.mostrarAlerta('success', 
        emailOriginal ? '✅ Residente actualizado correctamente' : '✅ Residente agregado correctamente', 'main');
    
    bootstrap.Modal.getInstance(document.getElementById('modalNuevoResidente')).hide();
    cargarResidentes();
    cargarEstadisticas();
}

function editarResidente(email) {
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const residente = usuarios.find(u => u.email === email);
    if (!residente) return;
    
    document.getElementById('residenteEmail').value = email;
    document.getElementById('nombre').value = residente.nombre;
    document.getElementById('rut').value = residente.rut;
    document.getElementById('email').value = residente.email;
    document.getElementById('telefono').value = residente.telefono;
    document.getElementById('pasaje').value = residente.pasaje;
    document.getElementById('rol').value = residente.rol || 'residente';
    
    actualizarSelectCasa();
    document.getElementById('casa').value = residente.casa;
    document.getElementById('tituloModal').textContent = 'Editar Residente';
    
    new bootstrap.Modal(document.getElementById('modalNuevoResidente')).show();
}

function verResidente(email) {
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const residente = usuarios.find(u => u.email === email);
    if (!residente) return;
    
    const contenido = `
        <div class="mb-3">
            <strong><i class="bi bi-person"></i> Nombre:</strong><br>
            ${residente.nombre}
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-card-text"></i> RUT:</strong><br>
            ${residente.rut}
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-envelope"></i> Email:</strong><br>
            ${residente.email}
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-phone"></i> Teléfono:</strong><br>
            +56 ${residente.telefono}
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-house-door"></i> Vivienda:</strong><br>
            Pasaje ${residente.pasaje}, Casa ${residente.casa}
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-shield-check"></i> Rol:</strong><br>
            <span class="badge bg-${residente.rol === 'administrador' ? 'danger' : 'primary'}">
                ${residente.rol === 'administrador' ? 'Administrador' : 'Residente'}
            </span>
        </div>
        ${residente.fechaRegistro ? `
        <div class="mb-0">
            <strong><i class="bi bi-calendar"></i> Fecha de Registro:</strong><br>
            ${new Date(residente.fechaRegistro).toLocaleDateString('es-CL', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            })}
        </div>
        ` : ''}
    `;
    
    document.getElementById('contenidoVerResidente').innerHTML = contenido;
    new bootstrap.Modal(document.getElementById('modalVerResidente')).show();
}

function eliminarResidente(email, nombre) {
    document.getElementById('emailEliminar').value = email;
    document.getElementById('nombreEliminar').textContent = nombre;
    new bootstrap.Modal(document.getElementById('modalEliminar')).show();
}

function confirmarEliminar() {
    const email = document.getElementById('emailEliminar').value;
    let usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    usuarios = usuarios.filter(u => u.email !== email);
    
    window.validacionesComunes.guardarEnStorage('usuarios', usuarios);
    bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
    window.validacionesComunes.mostrarAlerta('success', '✅ Residente eliminado', 'main');
    
    cargarResidentes();
    cargarEstadisticas();
}

function aplicarFiltros() {
    const buscar = document.getElementById('inputBuscar').value.toLowerCase();
    const pasaje = document.getElementById('selectPasaje').value;
    const casa = document.getElementById('selectCasa').value;
    
    const filtrados = residentes.filter(r => {
        const coincideBuscar = r.nombre.toLowerCase().includes(buscar) || 
                              r.rut.includes(buscar) || 
                              r.email.toLowerCase().includes(buscar);
        const coincidePasaje = !pasaje || r.pasaje === pasaje;
        const coincideCasa = !casa || r.casa === casa;
        
        return coincideBuscar && coincidePasaje && coincideCasa;
    });
    
    mostrarResidentes(filtrados);
}

function limpiarFiltros() {
    document.getElementById('inputBuscar').value = '';
    document.getElementById('selectPasaje').value = '';
    document.getElementById('selectCasa').innerHTML = '<option value="">Todas</option>';
    mostrarResidentes(residentes);
}

function actualizarSelectCasa() {
    const pasaje = document.getElementById('pasaje').value;
    const selectCasa = document.getElementById('casa');
    
    selectCasa.innerHTML = '<option value="">Selecciona casa</option>';
    selectCasa.disabled = !pasaje;
    
    if (pasaje) {
        const casas = pasaje === '8651' ? window.validacionesComunes.CASAS_8651 : window.validacionesComunes.CASAS_8707;
        casas.forEach(c => {
            selectCasa.innerHTML += `<option value="${c}">Casa ${c}</option>`;
        });
    }
}

function actualizarSelectCasaFiltro() {
    const pasaje = document.getElementById('selectPasaje').value;
    const selectCasa = document.getElementById('selectCasa');
    
    selectCasa.innerHTML = '<option value="">Todas</option>';
    
    if (pasaje) {
        const casas = pasaje === '8651' ? window.validacionesComunes.CASAS_8651 : window.validacionesComunes.CASAS_8707;
        casas.forEach(c => {
            selectCasa.innerHTML += `<option value="${c}">Casa ${c}</option>`;
        });
    }
}

function limpiarFormulario() {
    document.getElementById('formResidente').reset();
    document.getElementById('residenteEmail').value = '';
    document.getElementById('tituloModal').textContent = 'Nuevo Residente';
    document.getElementById('casa').disabled = true;
    document.getElementById('casa').innerHTML = '<option value="">Primero selecciona pasaje</option>';
    
    ['nombre', 'rut', 'email', 'telefono', 'pasaje', 'casa'].forEach(id => {
        window.validacionesComunes.limpiarValidacion(id);
    });
}

function validarFormulario() {
    let valido = true;
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const emailOriginal = document.getElementById('residenteEmail').value;
    
    const nombre = document.getElementById('nombre').value.trim();
    if (!nombre || !window.validacionesComunes.validarNombre(nombre)) {
        window.validacionesComunes.mostrarError('nombre', 'Nombre inválido');
        valido = false;
    } else {
        window.validacionesComunes.mostrarExito('nombre');
    }
    
    // CORREGIDO: Validar RUT excluyendo el usuario actual en edición
    const rut = document.getElementById('rut').value.trim();
    if (!rut || !window.validacionesComunes.validarRUT(rut)) {
        window.validacionesComunes.mostrarError('rut', 'RUT inválido');
        valido = false;
    } else {
        // Verificar si el RUT ya existe, excluyendo el usuario actual
        const rutExistente = usuarios.find(u => 
            u.rut === rut && u.email !== emailOriginal
        );
        
        if (rutExistente) {
            window.validacionesComunes.mostrarError('rut', 'Este RUT ya está registrado por otro usuario');
            valido = false;
        } else {
            window.validacionesComunes.mostrarExito('rut');
        }
    }
    
    // CORREGIDO: Validar email excluyendo el usuario actual en edición
    const email = document.getElementById('email').value.trim();
    if (!email || !window.validacionesComunes.validarEmail(email)) {
        window.validacionesComunes.mostrarError('email', 'Email inválido');
        valido = false;
    } else {
        // Verificar si el email ya existe, excluyendo el usuario actual
        const emailExistente = usuarios.find(u => 
            u.email === email && u.email !== emailOriginal
        );
        
        if (emailExistente) {
            window.validacionesComunes.mostrarError('email', 'Este email ya está registrado por otro usuario');
            valido = false;
        } else {
            window.validacionesComunes.mostrarExito('email');
        }
    }
    
    const telefono = document.getElementById('telefono').value.trim();
    if (!telefono || !window.validacionesComunes.validarTelefono(telefono)) {
        window.validacionesComunes.mostrarError('telefono', 'Teléfono inválido');
        valido = false;
    } else {
        window.validacionesComunes.mostrarExito('telefono');
    }
    
    const pasaje = document.getElementById('pasaje').value;
    if (!pasaje) {
        window.validacionesComunes.mostrarError('pasaje', 'Selecciona un pasaje');
        valido = false;
    } else {
        window.validacionesComunes.mostrarExito('pasaje');
    }
    
    const casa = document.getElementById('casa').value;
    if (!casa) {
        window.validacionesComunes.mostrarError('casa', 'Selecciona una casa');
        valido = false;
    } else {
        window.validacionesComunes.mostrarExito('casa');
    }
    
    return valido;
}
