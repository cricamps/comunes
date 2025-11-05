// ===================================
// VALIDACIONES - REGISTRO
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const formRegistro = document.getElementById('formRegistro');
    
    if (formRegistro) {
        // ===================================
        // CONFIGURACIÓN DE INPUTS
        // ===================================
        
        // Campo RUT - Formateo automático
        const rutInput = document.getElementById('rut');
        rutInput.addEventListener('input', function() {
            let valor = this.value.replace(/[^0-9kK]/g, '');
            if (valor.length > 1) {
                this.value = window.validacionesComunes.formatearRUT(valor);
            } else {
                this.value = valor;
            }
        });
        
        rutInput.addEventListener('blur', function() {
            validarCampoRUT();
        });
        
        // Campo Teléfono - Solo números
        const telefonoInput = document.getElementById('telefono');
        telefonoInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        
        telefonoInput.addEventListener('blur', function() {
            validarCampoTelefono();
        });
        
        // Campo Nombre
        const nombreInput = document.getElementById('nombre');
        nombreInput.addEventListener('blur', function() {
            validarCampoNombre();
        });
        
        // Campo Email
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', function() {
            validarCampoEmail();
        });
        
        // Campo Pasaje - Actualizar opciones de casa
        const pasajeSelect = document.getElementById('pasaje');
        const casaSelect = document.getElementById('casa');
        
        pasajeSelect.addEventListener('change', function() {
            actualizarOpcionesCasa();
            validarCampoPasaje();
        });
        
        casaSelect.addEventListener('change', function() {
            validarCampoCasa();
            actualizarDireccionPreview();
        });
        
        // Campo Contraseña - Validación en tiempo real
        const passwordInput = document.getElementById('password');
        passwordInput.addEventListener('input', function() {
            actualizarRequisitosPas sword();
            if (this.value.length > 0) {
                validarCampoPassword();
            }
            // Validar confirmación si ya tiene valor
            const confirmPassword = document.getElementById('confirmPassword');
            if (confirmPassword.value.length > 0) {
                validarCampoConfirmPassword();
            }
        });
        
        passwordInput.addEventListener('blur', function() {
            validarCampoPassword();
        });
        
        // Campo Confirmar Contraseña
        const confirmPasswordInput = document.getElementById('confirmPassword');
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                validarCampoConfirmPassword();
            }
        });
        
        confirmPasswordInput.addEventListener('blur', function() {
            validarCampoConfirmPassword();
        });
        
        // Términos y condiciones
        const terminosCheck = document.getElementById('terminos');
        terminosCheck.addEventListener('change', function() {
            validarCampoTerminos();
        });
        
        // Toggle contraseñas
        document.getElementById('togglePassword').addEventListener('click', function() {
            togglePasswordVisibility('password', 'eyeIcon');
        });
        
        document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
            togglePasswordVisibility('confirmPassword', 'eyeIconConfirm');
        });
        
        // ===================================
        // SUBMIT DEL FORMULARIO
        // ===================================
        
        formRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validarFormularioCompleto()) {
                procesarRegistro();
            }
        });
    }
});

// ===================================
// FUNCIONES DE VALIDACIÓN
// ===================================

/**
 * Valida el campo de nombre
 */
function validarCampoNombre() {
    const nombreInput = document.getElementById('nombre');
    const nombre = nombreInput.value.trim();
    
    if (nombre === '') {
        window.validacionesComunes.mostrarError('nombre', 'El nombre completo es obligatorio');
        return false;
    }
    
    if (!window.validacionesComunes.validarNombre(nombre)) {
        window.validacionesComunes.mostrarError('nombre', 'El nombre solo debe contener letras y espacios (2-50 caracteres)');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('nombre');
    return true;
}

/**
 * Valida el campo de RUT
 */
function validarCampoRUT() {
    const rutInput = document.getElementById('rut');
    const rut = rutInput.value.trim();
    
    if (rut === '') {
        window.validacionesComunes.mostrarError('rut', 'El RUT es obligatorio');
        return false;
    }
    
    if (!window.validacionesComunes.validarRUT(rut)) {
        window.validacionesComunes.mostrarError('rut', 'El RUT ingresado no es válido. Verifica el número y el dígito verificador');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('rut');
    return true;
}

/**
 * Valida el campo de email
 */
function validarCampoEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    if (email === '') {
        window.validacionesComunes.mostrarError('email', 'El correo electrónico es obligatorio');
        return false;
    }
    
    if (!window.validacionesComunes.validarEmail(email)) {
        window.validacionesComunes.mostrarError('email', 'Ingresa un correo electrónico válido (ejemplo: usuario@correo.com)');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('email');
    return true;
}

/**
 * Valida el campo de teléfono
 */
function validarCampoTelefono() {
    const telefonoInput = document.getElementById('telefono');
    const telefono = telefonoInput.value.trim();
    
    if (telefono === '') {
        window.validacionesComunes.mostrarError('telefono', 'El teléfono es obligatorio');
        return false;
    }
    
    if (!window.validacionesComunes.validarTelefono(telefono)) {
        window.validacionesComunes.mostrarError('telefono', 'El teléfono debe tener 9 dígitos y empezar con 9');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('telefono');
    return true;
}

/**
 * Valida el campo de pasaje
 */
function validarCampoPasaje() {
    const pasajeSelect = document.getElementById('pasaje');
    const pasaje = pasajeSelect.value;
    
    if (pasaje === '') {
        window.validacionesComunes.mostrarError('pasaje', 'Debes seleccionar un pasaje');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('pasaje');
    return true;
}

/**
 * Valida el campo de casa
 */
function validarCampoCasa() {
    const casaSelect = document.getElementById('casa');
    const casa = casaSelect.value;
    const pasaje = document.getElementById('pasaje').value;
    
    if (casa === '') {
        window.validacionesComunes.mostrarError('casa', 'Debes seleccionar una casa');
        return false;
    }
    
    if (!window.validacionesComunes.validarCasa(pasaje, casa)) {
        window.validacionesComunes.mostrarError('casa', 'La casa seleccionada no es válida para este pasaje');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('casa');
    return true;
}

/**
 * Valida el campo de contraseña
 */
function validarCampoPassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    if (password === '') {
        window.validacionesComunes.mostrarError('password', 'La contraseña es obligatoria');
        return false;
    }
    
    const validaciones = window.validacionesComunes.validarPassword(password);
    const errores = [];
    
    if (!validaciones.longitud) {
        errores.push('debe tener entre 8 y 20 caracteres');
    }
    if (!validaciones.mayuscula) {
        errores.push('debe contener al menos una letra mayúscula');
    }
    if (!validaciones.minuscula) {
        errores.push('debe contener al menos una letra minúscula');
    }
    if (!validaciones.numero) {
        errores.push('debe contener al menos un número');
    }
    if (!validaciones.especial) {
        errores.push('debe contener al menos un carácter especial (!@#$%^&*)');
    }
    
    if (errores.length > 0) {
        window.validacionesComunes.mostrarError('password', 'La contraseña ' + errores.join(', '));
        return false;
    }
    
    window.validacionesComunes.mostrarExito('password');
    return true;
}

/**
 * Valida el campo de confirmar contraseña
 */
function validarCampoConfirmPassword() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword === '') {
        window.validacionesComunes.mostrarError('confirmPassword', 'Debes confirmar tu contraseña');
        return false;
    }
    
    if (password !== confirmPassword) {
        window.validacionesComunes.mostrarError('confirmPassword', 'Las contraseñas no coinciden');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('confirmPassword');
    return true;
}

/**
 * Valida el campo de términos
 */
function validarCampoTerminos() {
    const terminosCheck = document.getElementById('terminos');
    
    if (!terminosCheck.checked) {
        window.validacionesComunes.mostrarError('terminos', 'Debes aceptar los términos y condiciones');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('terminos');
    return true;
}

/**
 * Valida todo el formulario
 */
function validarFormularioCompleto() {
    const nombreValido = validarCampoNombre();
    const rutValido = validarCampoRUT();
    const emailValido = validarCampoEmail();
    const telefonoValido = validarCampoTelefono();
    const pasajeValido = validarCampoPasaje();
    const casaValida = validarCampoCasa();
    const passwordValido = validarCampoPassword();
    const confirmPasswordValido = validarCampoConfirmPassword();
    const terminosValidos = validarCampoTerminos();
    
    return nombreValido && rutValido && emailValido && telefonoValido && 
           pasajeValido && casaValida && passwordValido && 
           confirmPasswordValido && terminosValidos;
}

// ===================================
// FUNCIONES DE UI
// ===================================

/**
 * Actualiza las opciones de casa según el pasaje seleccionado
 */
function actualizarOpcionesCasa() {
    const pasajeSelect = document.getElementById('pasaje');
    const casaSelect = document.getElementById('casa');
    const pasaje = pasajeSelect.value;
    
    // Limpiar opciones actuales
    casaSelect.innerHTML = '<option value="">Selecciona una casa</option>';
    
    if (pasaje === '') {
        casaSelect.disabled = true;
        casaSelect.innerHTML = '<option value="">Primero selecciona un pasaje</option>';
        return;
    }
    
    casaSelect.disabled = false;
    
    let casas = [];
    if (pasaje === '8651') {
        casas = window.validacionesComunes.CASAS_8651;
    } else if (pasaje === '8707') {
        casas = window.validacionesComunes.CASAS_8707;
    }
    
    casas.forEach(casa => {
        const option = document.createElement('option');
        option.value = casa;
        option.textContent = `Casa ${casa}`;
        casaSelect.appendChild(option);
    });
}

/**
 * Actualiza la vista previa de la dirección
 */
function actualizarDireccionPreview() {
    const pasaje = document.getElementById('pasaje').value;
    const casa = document.getElementById('casa').value;
    const preview = document.getElementById('direccionPreview');
    const direccionCompleta = document.getElementById('direccionCompleta');
    
    if (pasaje && casa) {
        direccionCompleta.textContent = `Pasaje ${pasaje}, Casa ${casa}`;
        preview.classList.remove('d-none');
    } else {
        preview.classList.add('d-none');
    }
}

/**
 * Actualiza visualmente los requisitos de contraseña
 */
function actualizarRequisitosPasword() {
    const password = document.getElementById('password').value;
    const validaciones = window.validacionesComunes.validarPassword(password);
    
    actualizarRequisito('req-longitud', validaciones.longitud);
    actualizarRequisito('req-mayuscula', validaciones.mayuscula);
    actualizarRequisito('req-minuscula', validaciones.minuscula);
    actualizarRequisito('req-numero', validaciones.numero);
    actualizarRequisito('req-especial', validaciones.especial);
}

/**
 * Actualiza el estado visual de un requisito
 */
function actualizarRequisito(id, cumplido) {
    const elemento = document.getElementById(id);
    const icono = elemento.querySelector('i');
    
    if (cumplido) {
        elemento.classList.remove('text-muted', 'text-danger');
        elemento.classList.add('text-success');
        icono.classList.remove('bi-circle', 'bi-x-circle');
        icono.classList.add('bi-check-circle-fill');
    } else {
        elemento.classList.remove('text-success');
        elemento.classList.add('text-muted');
        icono.classList.remove('bi-check-circle-fill', 'bi-x-circle');
        icono.classList.add('bi-circle');
    }
}

/**
 * Toggle de visibilidad de contraseña
 */
function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}

// ===================================
// PROCESO DE REGISTRO
// ===================================

/**
 * Procesa el registro del usuario
 */
function procesarRegistro() {
    const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        rut: document.getElementById('rut').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        pasaje: document.getElementById('pasaje').value,
        casa: document.getElementById('casa').value,
        password: document.getElementById('password').value,
        fechaRegistro: new Date().toISOString()
    };
    
    // Mostrar loading
    const btnSubmit = document.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando cuenta...';
    
    // Simular proceso de registro (aquí iría la llamada al backend)
    setTimeout(() => {
        // Verificar si el email ya existe (simulado)
        const usuariosRegistrados = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
        const emailExiste = usuariosRegistrados.some(u => u.email === formData.email);
        
        if (emailExiste) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            window.validacionesComunes.mostrarAlerta('danger', 
                'El correo electrónico ya está registrado. Por favor usa otro correo o inicia sesión.', 
                'main');
            return;
        }
        
        // Guardar usuario
        usuariosRegistrados.push(formData);
        window.validacionesComunes.guardarEnStorage('usuarios', usuariosRegistrados);
        
        // Mostrar mensaje de éxito
        window.validacionesComunes.mostrarAlerta('success', 
            `¡Cuenta creada exitosamente, ${formData.nombre}! Redirigiendo al inicio de sesión...`, 
            'main');
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    }, 1500);
}
