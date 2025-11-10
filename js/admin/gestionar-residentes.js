// ===================================
// GESTIONAR RESIDENTES - VERSIÓN 3.0
// Con soporte COMPLETO para múltiples residentes por casa
// ===================================

let residentes = [];
let sesionActual = null;

document.addEventListener('DOMContentLoaded', function() {
    verificarSesionAdmin();
    cargarNombreAdmin();
    cargarResidentes();
    cargarEstadisticas();
    
    // Event listeners principales
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
    
    // Validación en tiempo real - Fecha de Nacimiento
    document.getElementById('fechaNacimiento').addEventListener('change', validarEdadTiempoReal);
    
    // Validación en tiempo real - RUT
    document.getElementById('rut').addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9kK-]/g, '');
    });
    
    document.getElementById('rut').addEventListener('blur', validarRutTiempoReal);
    
    // Validación en tiempo real - Teléfono
    document.getElementById('telefono').addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Cambio de pasaje/casa
    document.getElementById('pasaje').addEventListener('change', actualizarSelectCasa);
    document.getElementById('casa').addEventListener('change', mostrarResidentesExistentes);
    
    // NUEVO: Validación de checkbox titular
    document.getElementById('esTitular').addEventListener('change', validarCambioTitular);
    
    // NUEVO: Sincronizar checkbox titular con select de parentesco
    document.getElementById('parentesco').addEventListener('change', sincronizarParentescoTitular);
    
    // Limpiar formulario al cerrar modal
    document.getElementById('modalNuevoResidente').addEventListener('hidden.bs.modal', limpiarFormulario);
});

// ===================================
// NUEVAS FUNCIONES PARA TITULAR
// ===================================

/**
 * Valida el cambio del checkbox de titular y advierte si ya existe uno
 */
function validarCambioTitular() {
    const esTitular = this.checked;
    const pasaje = document.getElementById('pasaje').value;
    const casa = document.getElementById('casa').value;
    const emailActual = document.getElementById('residenteEmail').value;
    
    if (!pasaje || !casa) {
        ToastHelper.mostrarAdvertencia('⚠️ Primero seleccione pasaje y casa');
        this.checked = false;
        return;
    }
    
    if (esTitular) {
        const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
        const titularActual = usuarios.find(u => 
            u.pasaje === pasaje && 
            u.casa === casa && 
            u.esTitular === true &&
            u.email !== emailActual
        );
        
        if (titularActual) {
            const confirmar = confirm(
                `⚠️ ATENCIÓN: Ya existe un titular en esta casa:\n\n` +
                `${titularActual.nombre} (${titularActual.parentesco || 'Sin parentesco'})\n\n` +
                `Si continúa, ${titularActual.nombre} dejará de ser el titular principal.\n\n` +
                `¿Desea continuar?`
            );
            
            if (!confirmar) {
                this.checked = false;
                return;
            }
            
            ToastHelper.mostrarInfo(`ℹ️ ${titularActual.nombre} será reemplazado como titular`);
        } else {
            ToastHelper.mostrarExito('✅ Esta persona será el titular de la casa');
        }
        
        // Sugerir cambiar parentesco a "titular" si no está seleccionado
        const parentesco = document.getElementById('parentesco').value;
        if (parentesco !== 'titular') {
            const cambiarParentesco = confirm(
                '¿Desea cambiar también el parentesco a "Titular/Propietario"?'
            );
            if (cambiarParentesco) {
                document.getElementById('parentesco').value = 'titular';
            }
        }
    }
}

/**
 * Sincroniza el checkbox de titular cuando se selecciona "titular" en parentesco
 */
function sincronizarParentescoTitular() {
    const parentesco = this.value;
    const checkboxTitular = document.getElementById('esTitular');
    
    if (parentesco === 'titular' && !checkboxTitular.checked) {
        const marcarComoTitular = confirm(
            '¿Desea marcar también a esta persona como el titular principal de la casa?\n\n' +
            'Esto le dará prioridad en notificaciones y documentos oficiales.'
        );
        
        if (marcarComoTitular) {
            checkboxTitular.checked = true;
            // Disparar el evento change para ejecutar la validación
            checkboxTitular.dispatchEvent(new Event('change'));
        }
    }
}

// ===================================
// FUNCIONES DE VALIDACIÓN EN TIEMPO REAL
// ===================================

function validarEdadTiempoReal() {
    const fechaNac = this.value;
    const infoEdad = document.getElementById('edadInfo');
    const errorEdad = document.getElementById('edadError');
    
    if (!fechaNac) {
        infoEdad.textContent = '';
        return;
    }
    
    const resultado = ValidacionesMejoradas.validarEdad(fechaNac);
    
    if (resultado.valido) {
        infoEdad.textContent = `✅ ${resultado.mensaje}`;
        infoEdad.className = 'text-success';
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
    } else {
        errorEdad.textContent = resultado.mensaje;
        infoEdad.textContent = '';
        infoEdad.className = '';
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
    }
}

function validarRutTiempoReal() {
    const rut = this.value.trim();
    const rutInfo = document.getElementById('rutInfo');
    const rutError = document.getElementById('rutError');
    
    if (!rut) {
        rutInfo.textContent = '';
        return;
    }
    
    const resultado = ValidacionesMejoradas.validarRutCompleto(rut);
    
    if (resultado.valido) {
        this.value = resultado.rutFormateado;
        rutInfo.textContent = '✅ RUT válido';
        rutInfo.className = 'text-success';
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
    } else {
        rutError.textContent = resultado.mensaje;
        rutInfo.textContent = '';
        rutInfo.className = '';
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
    }
}

function mostrarResidentesExistentes() {
    const pasaje = document.getElementById('pasaje').value;
    const casa = this.value;
    
    if (!pasaje || !casa) return;
    
    const residentes = ValidacionesMejoradas.obtenerResidentesPorCasa(pasaje, casa);
    const capacidad = ValidacionesMejoradas.verificarCapacidadCasa(pasaje, casa);
    const infoDiv = document.getElementById('infoResidentesExistentes');
    const listaDiv = document.getElementById('listaResidentesExistentes');
    const infoCasa = document.getElementById('infoCasa');
    
    if (residentes.length > 0) {
        let html = '<ul class="mb-2 small">';
        residentes.forEach((r) => {
            const titular = r.esTitular ? ' <i class="bi bi-star-fill text-warning" title="Titular principal"></i>' : '';
            const parentesco = r.parentesco ? ` (${r.parentesco})` : '';
            html += `<li><strong>${r.nombre}</strong>${parentesco}${titular}</li>`;
        });
        html += '</ul>';
        html += `<small class="text-muted"><i class="bi bi-info-circle"></i> Capacidad: ${capacidad.cantidad}/10 residentes</small>`;
        
        listaDiv.innerHTML = html;
        infoDiv.style.display = 'block';
        infoCasa.textContent = `${capacidad.cantidad} residente(s) ya registrado(s)`;
        infoCasa.className = 'text-info';
    } else {
        infoDiv.style.display = 'none';
        infoCasa.textContent = '✨ Primera persona en esta casa';
        infoCasa.className = 'text-success';
    }
    
    // Advertir si está llegando al límite
    if (capacidad.cantidad >= 8) {
        ToastHelper.mostrarAdvertencia(`⚠️ La casa está llegando a su capacidad máxima (${capacidad.cantidad}/10)`);
    }
}

// ===================================
// FUNCIONES PRINCIPALES
// ===================================

function verificarSesionAdmin() {
    sesionActual = window.validacionesComunes.obtenerDeStorage('sesionActual');
    if (!sesionActual || sesionActual.tipo !== 'administrador') {
        window.location.href = '../login.html';
    }
}

function cargarNombreAdmin() {
    if (sesionActual) {
        document.getElementById('nombreAdmin').textContent = sesionActual.nombre || 'Admin';
    }
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
    // Incluir TODOS los usuarios con casa (incluso admins)
    residentes = usuarios.filter(u => u.casa);
    mostrarResidentes(residentes);
}

function cargarEstadisticas() {
    const totalCasas = 13;
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    
    // Contar residentes (incluyendo todos los que tienen casa)
    const residentesCasa = usuarios.filter(u => u.pasaje && u.casa);
    
    // Contar casas únicas ocupadas
    const casasUnicas = new Set(residentesCasa.map(r => `${r.pasaje}-${r.casa}`));
    const casasOcupadas = casasUnicas.size;
    const casasDisponibles = totalCasas - casasOcupadas;
    const porcentaje = ((casasOcupadas / totalCasas) * 100).toFixed(0);
    
    document.getElementById('totalResidentes').textContent = residentesCasa.length;
    document.getElementById('casasOcupadas').textContent = casasOcupadas;
    document.getElementById('casasDisponibles').textContent = casasDisponibles;
    document.getElementById('porcentajeOcupacion').textContent = porcentaje;
}

function mostrarResidentes(residentesAMostrar) {
    const tbody = document.getElementById('tablaResidentes');
    
    if (residentesAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8" class="text-center text-muted py-5">
                <i class="bi bi-inbox fs-3"></i>
                <p class="mt-3 mb-0">No hay residentes registrados</p>
                <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#modalNuevoResidente">
                    <i class="bi bi-person-plus"></i> Agregar Primer Residente
                </button>
            </td></tr>
        `;
        return;
    }
    
    tbody.innerHTML = residentesAMostrar.map(r => {
        const titular = r.esTitular ? ' <i class="bi bi-star-fill text-warning" title="Titular de la casa"></i>' : '';
        const parentescoTexto = r.parentesco ? r.parentesco.charAt(0).toUpperCase() + r.parentesco.slice(1) : '-';
        const edad = r.edad || (r.fechaNacimiento ? ValidacionesMejoradas.validarEdad(r.fechaNacimiento).edad : '-');
        const adminBadge = r.rol === 'administrador' ? '<span class="badge bg-danger ms-1"><i class="bi bi-shield-check"></i> Admin</span>' : '';
        
        // Contar cuántos residentes hay en la misma casa
        const residentesMismaCasa = residentes.filter(res => res.pasaje === r.pasaje && res.casa === r.casa);
        const badgeCasa = residentesMismaCasa.length > 1 
            ? `<span class="badge bg-secondary ms-1" title="${residentesMismaCasa.length} personas en esta casa">${residentesMismaCasa.length}</span>` 
            : '';
        
        return `
            <tr class="fade-in">
                <td><strong>${r.nombre}</strong>${titular}${adminBadge}</td>
                <td>${r.rut}</td>
                <td>${edad} años</td>
                <td>${r.email}</td>
                <td>+56 ${r.telefono}</td>
                <td>
                    <span class="badge bg-secondary">
                        ${r.pasaje}-${r.casa}
                    </span>
                    ${badgeCasa}
                </td>
                <td>
                    <span class="badge bg-info">
                        ${parentescoTexto}
                    </span>
                </td>
                <td class="text-nowrap">
                    <button class="btn btn-sm btn-info" onclick="verResidente('${r.email}')" title="Ver detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editarResidente('${r.email}')" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarResidente('${r.email}', '${r.nombre.replace(/'/g, "\\'")}')" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===================================
// GUARDAR RESIDENTE
// ===================================

function guardarResidente() {
    if (!validarFormularioCompleto()) return;
    
    const emailOriginal = document.getElementById('residenteEmail').value;
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const pasaje = document.getElementById('pasaje').value;
    const casa = document.getElementById('casa').value;
    
    // Validar edad
    const fechaNac = document.getElementById('fechaNacimiento').value;
    const validacionEdad = ValidacionesMejoradas.validarEdad(fechaNac);
    if (!validacionEdad.valido) {
        ToastHelper.mostrarError(validacionEdad.mensaje);
        return;
    }
    
    // Validar capacidad (solo para nuevos residentes o si cambió de casa)
    const residenteActual = emailOriginal ? usuarios.find(u => u.email === emailOriginal) : null;
    const cambióDeCasa = residenteActual && (residenteActual.pasaje !== pasaje || residenteActual.casa !== casa);
    
    if (!emailOriginal || cambióDeCasa) {
        const capacidad = ValidacionesMejoradas.verificarCapacidadCasa(pasaje, casa);
        if (!capacidad.disponible) {
            ToastHelper.mostrarError(capacidad.mensaje);
            return;
        }
    }
    
    // Validar RUT
    const rutValidacion = ValidacionesMejoradas.validarRutCompleto(document.getElementById('rut').value);
    if (!rutValidacion.valido) {
        ToastHelper.mostrarError(rutValidacion.mensaje);
        return;
    }
    
    // Validar email disponible
    const email = document.getElementById('email').value.trim();
    const emailValidacion = ValidacionesMejoradas.verificarEmailDisponible(email, emailOriginal);
    if (!emailValidacion.disponible) {
        ToastHelper.mostrarError(emailValidacion.mensaje);
        return;
    }
    
    const residente = {
        nombre: document.getElementById('nombre').value.trim(),
        rut: rutValidacion.rutFormateado,
        fechaNacimiento: fechaNac,
        edad: validacionEdad.edad,
        email: email,
        telefono: document.getElementById('telefono').value.trim(),
        pasaje: pasaje,
        casa: casa,
        parentesco: document.getElementById('parentesco').value,
        esTitular: document.getElementById('esTitular').checked,
        rol: document.getElementById('rol').value || 'residente',
        tipo: document.getElementById('rol').value || 'residente'
    };
    
    if (emailOriginal) {
        // Editar
        const index = usuarios.findIndex(u => u.email === emailOriginal);
        if (index !== -1) {
            const usuarioActual = usuarios[index];
            usuarios[index] = { 
                ...usuarioActual, 
                ...residente,
                password: usuarioActual.password,
                fechaRegistro: usuarioActual.fechaRegistro
            };
        }
    } else {
        // Nuevo
        residente.password = 'User123!';
        residente.fechaRegistro = new Date().toISOString();
        usuarios.push(residente);
    }
    
    // Si se marcó como titular, quitar el flag de otros residentes de la misma casa
    if (residente.esTitular) {
        usuarios.forEach(u => {
            if (u.pasaje === pasaje && u.casa === casa && u.email !== residente.email) {
                u.esTitular = false;
            }
        });
    }
    
    window.validacionesComunes.guardarEnStorage('usuarios', usuarios);
    
    // Mensaje más informativo
    const cantidadEnCasa = usuarios.filter(u => u.pasaje === pasaje && u.casa === casa).length;
    const mensajeExtra = cantidadEnCasa > 1 ? ` (${cantidadEnCasa} personas en esta casa)` : '';
    
    ToastHelper.mostrarExito(
        emailOriginal 
            ? `✅ ${residente.nombre} actualizado correctamente${mensajeExtra}` 
            : `✅ ${residente.nombre} agregado a ${pasaje}-${casa}${mensajeExtra}`
    );
    
    bootstrap.Modal.getInstance(document.getElementById('modalNuevoResidente')).hide();
    cargarResidentes();
    cargarEstadisticas();
}

// ===================================
// EDITAR RESIDENTE
// ===================================

function editarResidente(email) {
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const residente = usuarios.find(u => u.email === email);
    if (!residente) return;
    
    document.getElementById('residenteEmail').value = email;
    document.getElementById('nombre').value = residente.nombre;
    document.getElementById('rut').value = residente.rut;
    document.getElementById('fechaNacimiento').value = residente.fechaNacimiento || '';
    document.getElementById('email').value = residente.email;
    document.getElementById('telefono').value = residente.telefono;
    document.getElementById('pasaje').value = residente.pasaje;
    document.getElementById('parentesco').value = residente.parentesco || '';
    document.getElementById('esTitular').checked = residente.esTitular || false;
    document.getElementById('rol').value = residente.rol || 'residente';
    
    actualizarSelectCasa();
    document.getElementById('casa').value = residente.casa;
    
    // Mostrar residentes existentes
    mostrarResidentesExistentes.call(document.getElementById('casa'));
    
    // Validar edad si existe
    if (residente.fechaNacimiento) {
        validarEdadTiempoReal.call(document.getElementById('fechaNacimiento'));
    }
    
    document.getElementById('tituloModal').textContent = 'Editar Residente';
    new bootstrap.Modal(document.getElementById('modalNuevoResidente')).show();
}

// ===================================
// VER RESIDENTE
// ===================================

window.verResidente = function(email) {
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const residente = usuarios.find(u => u.email === email);
    if (!residente) return;
    
    const edad = residente.edad || (residente.fechaNacimiento ? ValidacionesMejoradas.validarEdad(residente.fechaNacimiento).edad : 'No especificada');
    const parentesco = residente.parentesco ? residente.parentesco.charAt(0).toUpperCase() + residente.parentesco.slice(1) : 'No especificado';
    const titular = residente.esTitular ? '<span class="badge bg-warning ms-2"><i class="bi bi-star-fill"></i> Titular Principal</span>' : '';
    
    // Obtener otros residentes de la misma casa
    const otrosResidentes = ValidacionesMejoradas.obtenerResidentesPorCasa(residente.pasaje, residente.casa)
        .filter(r => r.email !== email);
    
    const contenido = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary fw-bold mb-3"><i class="bi bi-person-badge"></i> Información Personal</h6>
                <div class="mb-3">
                    <strong><i class="bi bi-person"></i> Nombre:</strong><br>
                    ${residente.nombre} ${titular}
                </div>
                <div class="mb-3">
                    <strong><i class="bi bi-card-text"></i> RUT:</strong><br>
                    ${residente.rut}
                </div>
                <div class="mb-3">
                    <strong><i class="bi bi-calendar-heart"></i> Edad:</strong><br>
                    ${edad} años
                </div>
                <div class="mb-3">
                    <strong><i class="bi bi-envelope"></i> Email:</strong><br>
                    ${residente.email}
                </div>
                <div class="mb-3">
                    <strong><i class="bi bi-phone"></i> Teléfono:</strong><br>
                    +56 ${residente.telefono}
                </div>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary fw-bold mb-3"><i class="bi bi-house-door"></i> Información de Vivienda</h6>
                <div class="mb-3">
                    <strong><i class="bi bi-geo-alt"></i> Dirección:</strong><br>
                    Pasaje ${residente.pasaje}, Casa ${residente.casa}
                </div>
                <div class="mb-3">
                    <strong><i class="bi bi-people"></i> Parentesco:</strong><br>
                    <span class="badge bg-info">${parentesco}</span>
                </div>
                <div class="mb-3">
                    <strong><i class="bi bi-shield-check"></i> Rol:</strong><br>
                    <span class="badge bg-${residente.rol === 'administrador' ? 'danger' : 'primary'}">
                        ${residente.rol === 'administrador' ? 'Administrador' : 'Residente'}
                    </span>
                </div>
                ${otrosResidentes.length > 0 ? `
                <div class="alert alert-info mb-0">
                    <strong><i class="bi bi-people-fill"></i> Otros residentes en esta casa (${otrosResidentes.length}):</strong>
                    <ul class="mb-0 mt-2">
                        ${otrosResidentes.map(r => {
                            const esTitular = r.esTitular ? ' <i class="bi bi-star-fill text-warning" title="Titular principal"></i>' : '';
                            const parentescoR = r.parentesco ? ` (${r.parentesco})` : '';
                            return `<li>${r.nombre}${parentescoR}${esTitular}</li>`;
                        }).join('')}
                    </ul>
                </div>
                ` : '<div class="alert alert-success mb-0"><i class="bi bi-house-check"></i> Único residente en esta casa</div>'}
            </div>
        </div>
        ${residente.fechaRegistro ? `
        <hr>
        <div class="text-muted small">
            <i class="bi bi-calendar"></i> Registrado el: ${new Date(residente.fechaRegistro).toLocaleDateString('es-CL', { 
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
        </div>
        ` : ''}
    `;
    
    document.getElementById('contenidoVerResidente').innerHTML = contenido;
    new bootstrap.Modal(document.getElementById('modalVerResidente')).show();
};

// ===================================
// ELIMINAR RESIDENTE
// ===================================

window.eliminarResidente = function(email, nombre) {
    document.getElementById('emailEliminar').value = email;
    document.getElementById('nombreEliminar').textContent = nombre;
    new bootstrap.Modal(document.getElementById('modalEliminar')).show();
};

function confirmarEliminar() {
    const email = document.getElementById('emailEliminar').value;
    let usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    
    // Buscar el residente a eliminar
    const residente = usuarios.find(u => u.email === email);
    
    // Si era titular, avisar que hay que asignar uno nuevo
    if (residente && residente.esTitular) {
        const otrosEnCasa = usuarios.filter(u => 
            u.pasaje === residente.pasaje && 
            u.casa === residente.casa && 
            u.email !== email
        );
        
        if (otrosEnCasa.length > 0) {
            ToastHelper.mostrarAdvertencia(
                `⚠️ ${residente.nombre} era el titular. Recuerde asignar un nuevo titular para esta casa.`
            );
        }
    }
    
    usuarios = usuarios.filter(u => u.email !== email);
    
    window.validacionesComunes.guardarEnStorage('usuarios', usuarios);
    bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
    
    ToastHelper.mostrarExito(`✅ ${residente ? residente.nombre : 'Residente'} eliminado correctamente`);
    
    cargarResidentes();
    cargarEstadisticas();
}

// ===================================
// FILTROS
// ===================================

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

// ===================================
// SELECT DE CASAS
// ===================================

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

// ===================================
// LIMPIAR FORMULARIO
// ===================================

function limpiarFormulario() {
    document.getElementById('formResidente').reset();
    document.getElementById('residenteEmail').value = '';
    document.getElementById('tituloModal').textContent = 'Nuevo Residente';
    document.getElementById('casa').disabled = true;
    document.getElementById('casa').innerHTML = '<option value="">Primero selecciona pasaje</option>';
    document.getElementById('infoResidentesExistentes').style.display = 'none';
    document.getElementById('edadInfo').textContent = '';
    document.getElementById('rutInfo').textContent = '';
    document.getElementById('infoCasa').textContent = '';
    
    // Limpiar clases de validación
    ['nombre', 'rut', 'fechaNacimiento', 'email', 'telefono', 'pasaje', 'casa', 'parentesco'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('is-valid', 'is-invalid');
        }
    });
}

// ===================================
// VALIDACIÓN COMPLETA
// ===================================

function validarFormularioCompleto() {
    let valido = true;
    
    // Validar nombre
    const nombre = document.getElementById('nombre').value.trim();
    if (!nombre || nombre.length < 3) {
        ToastHelper.mostrarError('El nombre debe tener al menos 3 caracteres');
        valido = false;
    }
    
    // Validar RUT
    const rut = document.getElementById('rut').value.trim();
    const rutValidacion = ValidacionesMejoradas.validarRutCompleto(rut);
    if (!rutValidacion.valido) {
        ToastHelper.mostrarError(rutValidacion.mensaje);
        valido = false;
    }
    
    // Validar fecha de nacimiento
    const fechaNac = document.getElementById('fechaNacimiento').value;
    if (!fechaNac) {
        ToastHelper.mostrarError('Debe ingresar la fecha de nacimiento');
        valido = false;
    }
    
    // Validar email
    const email = document.getElementById('email').value.trim();
    if (!email || !email.includes('@')) {
        ToastHelper.mostrarError('Debe ingresar un email válido');
        valido = false;
    }
    
    // Validar teléfono
    const telefono = document.getElementById('telefono').value.trim();
    if (!telefono || telefono.length !== 9) {
        ToastHelper.mostrarError('El teléfono debe tener 9 dígitos');
        valido = false;
    }
    
    // Validar pasaje y casa
    const pasaje = document.getElementById('pasaje').value;
    const casa = document.getElementById('casa').value;
    if (!pasaje || !casa) {
        ToastHelper.mostrarError('Debe seleccionar pasaje y casa');
        valido = false;
    }
    
    // Validar parentesco
    const parentesco = document.getElementById('parentesco').value;
    if (!parentesco) {
        ToastHelper.mostrarError('Debe seleccionar el parentesco');
        valido = false;
    }
    
    return valido;
}

console.log('✅ Gestionar Residentes v3.0 cargado correctamente - Funcionalidad completa de múltiples residentes');
