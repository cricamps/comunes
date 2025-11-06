// ===================================
// VALIDACIONES - SOLICITAR CUENTA
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para el formulario de solicitud
    const btnEnviarSolicitud = document.getElementById('btnEnviarSolicitud');
    if (btnEnviarSolicitud) {
        btnEnviarSolicitud.addEventListener('click', enviarSolicitud);
    }
    
    // Validaciones en tiempo real
    const nombreSolicitud = document.getElementById('nombreSolicitud');
    if (nombreSolicitud) {
        nombreSolicitud.addEventListener('blur', validarNombreSolicitud);
        nombreSolicitud.addEventListener('input', function() {
            if (this.value.length > 0) validarNombreSolicitud();
        });
    }
    
    const rutSolicitud = document.getElementById('rutSolicitud');
    if (rutSolicitud) {
        rutSolicitud.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9kK]/g, '');
            if (this.value.length > 1) {
                this.value = window.validacionesComunes.formatearRUT(this.value);
            }
        });
        rutSolicitud.addEventListener('blur', validarRutSolicitud);
    }
    
    const emailSolicitud = document.getElementById('emailSolicitud');
    if (emailSolicitud) {
        emailSolicitud.addEventListener('blur', validarEmailSolicitud);
        emailSolicitud.addEventListener('input', function() {
            if (this.value.length > 0) validarEmailSolicitud();
        });
    }
    
    const telefonoSolicitud = document.getElementById('telefonoSolicitud');
    if (telefonoSolicitud) {
        telefonoSolicitud.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        telefonoSolicitud.addEventListener('blur', validarTelefonoSolicitud);
    }
    
    const pasajeSolicitud = document.getElementById('pasajeSolicitud');
    if (pasajeSolicitud) {
        pasajeSolicitud.addEventListener('change', function() {
            actualizarSelectCasaSolicitud();
            validarPasajeSolicitud();
        });
    }
    
    const casaSolicitud = document.getElementById('casaSolicitud');
    if (casaSolicitud) {
        casaSolicitud.addEventListener('change', validarCasaSolicitud);
    }
    
    // Limpiar formulario al cerrar modal
    const modalSolicitarCuenta = document.getElementById('modalSolicitarCuenta');
    if (modalSolicitarCuenta) {
        modalSolicitarCuenta.addEventListener('hidden.bs.modal', limpiarFormularioSolicitud);
    }
});

/**
 * Valida el nombre completo
 */
function validarNombreSolicitud() {
    const nombre = document.getElementById('nombreSolicitud').value.trim();
    
    if (nombre === '') {
        mostrarErrorSolicitud('nombreSolicitud', 'El nombre es obligatorio');
        return false;
    }
    
    if (!window.validacionesComunes.validarNombre(nombre)) {
        mostrarErrorSolicitud('nombreSolicitud', 'Ingresa un nombre válido (solo letras y espacios, mínimo 2 caracteres)');
        return false;
    }
    
    mostrarExitoSolicitud('nombreSolicitud');
    return true;
}

/**
 * Valida el RUT
 */
function validarRutSolicitud() {
    const rut = document.getElementById('rutSolicitud').value.trim();
    
    if (rut === '') {
        mostrarErrorSolicitud('rutSolicitud', 'El RUT es obligatorio');
        return false;
    }
    
    if (!window.validacionesComunes.validarRUT(rut)) {
        mostrarErrorSolicitud('rutSolicitud', 'Ingresa un RUT válido (Ej: 12.345.678-9)');
        return false;
    }
    
    mostrarExitoSolicitud('rutSolicitud');
    return true;
}

/**
 * Valida el email
 */
function validarEmailSolicitud() {
    const email = document.getElementById('emailSolicitud').value.trim();
    
    if (email === '') {
        mostrarErrorSolicitud('emailSolicitud', 'El correo electrónico es obligatorio');
        return false;
    }
    
    if (!window.validacionesComunes.validarEmail(email)) {
        mostrarErrorSolicitud('emailSolicitud', 'Ingresa un correo electrónico válido (Ej: usuario@correo.com)');
        return false;
    }
    
    // Verificar si el email ya existe
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const emailExiste = usuarios.some(u => u.email === email);
    
    if (emailExiste) {
        mostrarErrorSolicitud('emailSolicitud', 'Este correo ya está registrado en el sistema');
        return false;
    }
    
    mostrarExitoSolicitud('emailSolicitud');
    return true;
}

/**
 * Valida el teléfono
 */
function validarTelefonoSolicitud() {
    const telefono = document.getElementById('telefonoSolicitud').value.trim();
    
    if (telefono === '') {
        mostrarErrorSolicitud('telefonoSolicitud', 'El teléfono es obligatorio');
        return false;
    }
    
    if (!window.validacionesComunes.validarTelefono(telefono)) {
        mostrarErrorSolicitud('telefonoSolicitud', 'Ingresa un teléfono válido de 9 dígitos que comience con 9');
        return false;
    }
    
    mostrarExitoSolicitud('telefonoSolicitud');
    return true;
}

/**
 * Valida el pasaje
 */
function validarPasajeSolicitud() {
    const pasaje = document.getElementById('pasajeSolicitud').value;
    
    if (pasaje === '') {
        mostrarErrorSolicitud('pasajeSolicitud', 'Debes seleccionar un pasaje');
        return false;
    }
    
    mostrarExitoSolicitud('pasajeSolicitud');
    return true;
}

/**
 * Valida la casa
 */
function validarCasaSolicitud() {
    const casa = document.getElementById('casaSolicitud').value;
    
    if (casa === '') {
        mostrarErrorSolicitud('casaSolicitud', 'Debes seleccionar una casa');
        return false;
    }
    
    // Verificar si la casa ya está ocupada
    const pasaje = document.getElementById('pasajeSolicitud').value;
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const casaOcupada = usuarios.some(u => u.pasaje === pasaje && u.casa === casa);
    
    if (casaOcupada) {
        mostrarErrorSolicitud('casaSolicitud', 'Esta casa ya está ocupada. Por favor selecciona otra.');
        return false;
    }
    
    mostrarExitoSolicitud('casaSolicitud');
    return true;
}

/**
 * Actualiza el select de casas según el pasaje seleccionado
 */
function actualizarSelectCasaSolicitud() {
    const pasaje = document.getElementById('pasajeSolicitud').value;
    const selectCasa = document.getElementById('casaSolicitud');
    
    selectCasa.innerHTML = '<option value="">Seleccione una casa...</option>';
    selectCasa.disabled = !pasaje;
    
    if (pasaje) {
        const casas = pasaje === '8651' ? 
            window.validacionesComunes.CASAS_8651 : 
            window.validacionesComunes.CASAS_8707;
        
        casas.forEach(casa => {
            selectCasa.innerHTML += `<option value="${casa}">Casa ${casa}</option>`;
        });
    }
}

/**
 * Muestra error en un campo de solicitud
 */
function mostrarErrorSolicitud(campoId, mensaje) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(`${campoId}Error`);
    
    if (campo && errorDiv) {
        campo.classList.add('is-invalid');
        campo.classList.remove('is-valid');
        errorDiv.textContent = mensaje;
    }
}

/**
 * Muestra éxito en un campo de solicitud
 */
function mostrarExitoSolicitud(campoId) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(`${campoId}Error`);
    
    if (campo) {
        campo.classList.add('is-valid');
        campo.classList.remove('is-invalid');
        if (errorDiv) errorDiv.textContent = '';
    }
}

/**
 * Valida todo el formulario de solicitud
 */
function validarFormularioSolicitud() {
    const nombreValido = validarNombreSolicitud();
    const rutValido = validarRutSolicitud();
    const emailValido = validarEmailSolicitud();
    const telefonoValido = validarTelefonoSolicitud();
    const pasajeValido = validarPasajeSolicitud();
    const casaValida = validarCasaSolicitud();
    
    return nombreValido && rutValido && emailValido && telefonoValido && pasajeValido && casaValida;
}

/**
 * Envía la solicitud de cuenta
 */
function enviarSolicitud() {
    // Validar formulario
    if (!validarFormularioSolicitud()) {
        window.validacionesComunes.mostrarAlerta('danger', 
            'Por favor corrige los errores en el formulario antes de enviar', 
            'main');
        return;
    }
    
    // Obtener datos del formulario
    const solicitud = {
        nombre: document.getElementById('nombreSolicitud').value.trim(),
        rut: document.getElementById('rutSolicitud').value.trim(),
        email: document.getElementById('emailSolicitud').value.trim(),
        telefono: document.getElementById('telefonoSolicitud').value.trim(),
        pasaje: document.getElementById('pasajeSolicitud').value,
        casa: document.getElementById('casaSolicitud').value,
        mensaje: document.getElementById('mensajeSolicitud').value.trim(),
        fechaSolicitud: new Date().toISOString(),
        estado: 'pendiente'
    };
    
    // Guardar solicitud en localStorage
    const solicitudes = window.validacionesComunes.obtenerDeStorage('solicitudes') || [];
    solicitudes.push(solicitud);
    window.validacionesComunes.guardarEnStorage('solicitudes', solicitudes);
    
    // Mostrar mensaje de éxito
    const btnEnviar = document.getElementById('btnEnviarSolicitud');
    const textoOriginal = btnEnviar.innerHTML;
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
    
    setTimeout(() => {
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalSolicitarCuenta'));
        modal.hide();
        
        // Mostrar mensaje de éxito
        window.validacionesComunes.mostrarAlerta('success', 
            `<strong>¡Solicitud enviada con éxito!</strong><br>
            Hemos recibido tu solicitud para la casa <strong>${solicitud.pasaje}-${solicitud.casa}</strong>.<br>
            Un administrador revisará tu información y te contactará pronto al correo <strong>${solicitud.email}</strong> o al teléfono <strong>+56 ${solicitud.telefono}</strong>.`, 
            'main');
        
        // Limpiar formulario
        limpiarFormularioSolicitud();
        
        // Restaurar botón
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = textoOriginal;
        
        console.log('✅ Solicitud guardada:', solicitud);
    }, 1500);
}

/**
 * Limpia el formulario de solicitud
 */
function limpiarFormularioSolicitud() {
    document.getElementById('formSolicitarCuenta').reset();
    document.getElementById('casaSolicitud').disabled = true;
    document.getElementById('casaSolicitud').innerHTML = '<option value="">Primero seleccione pasaje</option>';
    
    // Limpiar validaciones
    ['nombreSolicitud', 'rutSolicitud', 'emailSolicitud', 'telefonoSolicitud', 'pasajeSolicitud', 'casaSolicitud'].forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.classList.remove('is-valid', 'is-invalid');
            const errorDiv = document.getElementById(`${id}Error`);
            if (errorDiv) errorDiv.textContent = '';
        }
    });
}

// Exportar funciones si es necesario
window.solicitudCuenta = {
    enviarSolicitud,
    validarFormularioSolicitud
};
