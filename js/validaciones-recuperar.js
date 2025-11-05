// ===================================
// VALIDACIONES - RECUPERAR CONTRASEÑA
// ===================================

let emailRecuperacion = '';
let countdownInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    
    // ===================================
    // PASO 1: SOLICITAR EMAIL
    // ===================================
    
    const formRecuperar = document.getElementById('formRecuperar');
    if (formRecuperar) {
        const emailInput = document.getElementById('email');
        
        emailInput.addEventListener('blur', function() {
            validarCampoEmail();
        });
        
        formRecuperar.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validarCampoEmail()) {
                enviarCodigoVerificacion();
            }
        });
    }
    
    // ===================================
    // PASO 2: VERIFICAR CÓDIGO
    // ===================================
    
    const formVerificarCodigo = document.getElementById('formVerificarCodigo');
    if (formVerificarCodigo) {
        const codigoInput = document.getElementById('codigo');
        
        // Solo permitir números
        codigoInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        
        codigoInput.addEventListener('blur', function() {
            validarCampoCodigo();
        });
        
        formVerificarCodigo.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validarCampoCodigo()) {
                verificarCodigo();
            }
        });
        
        // Botón volver al paso 1
        const btnVolverPaso1 = document.getElementById('btnVolverPaso1');
        btnVolverPaso1.addEventListener('click', function() {
            volverPaso1();
        });
        
        // Botón reenviar código
        const btnReenviar = document.getElementById('btnReenviar');
        btnReenviar.addEventListener('click', function() {
            reenviarCodigo();
        });
    }
    
    // ===================================
    // PASO 3: NUEVA CONTRASEÑA
    // ===================================
    
    const formNuevaPassword = document.getElementById('formNuevaPassword');
    if (formNuevaPassword) {
        const nuevaPasswordInput = document.getElementById('nuevaPassword');
        const confirmarPasswordInput = document.getElementById('confirmarPassword');
        
        // Validación en tiempo real
        nuevaPasswordInput.addEventListener('input', function() {
            actualizarRequisitosPassword();
            if (this.value.length > 0) {
                validarCampoNuevaPassword();
            }
            // Validar confirmación si ya tiene valor
            if (confirmarPasswordInput.value.length > 0) {
                validarCampoConfirmarPassword();
            }
        });
        
        nuevaPasswordInput.addEventListener('blur', function() {
            validarCampoNuevaPassword();
        });
        
        confirmarPasswordInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                validarCampoConfirmarPassword();
            }
        });
        
        confirmarPasswordInput.addEventListener('blur', function() {
            validarCampoConfirmarPassword();
        });
        
        // Toggle contraseñas
        document.getElementById('toggleNuevaPassword').addEventListener('click', function() {
            togglePasswordVisibility('nuevaPassword', 'eyeIconNueva');
        });
        
        document.getElementById('toggleConfirmarPassword').addEventListener('click', function() {
            togglePasswordVisibility('confirmarPassword', 'eyeIconConfirmar');
        });
        
        formNuevaPassword.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validarCampoNuevaPassword() && validarCampoConfirmarPassword()) {
                cambiarPassword();
            }
        });
    }
});

// ===================================
// VALIDACIONES
// ===================================

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
        window.validacionesComunes.mostrarError('email', 'Ingresa un correo electrónico válido');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('email');
    return true;
}

/**
 * Valida el campo de código
 */
function validarCampoCodigo() {
    const codigoInput = document.getElementById('codigo');
    const codigo = codigoInput.value.trim();
    
    if (codigo === '') {
        window.validacionesComunes.mostrarError('codigo', 'El código de verificación es obligatorio');
        return false;
    }
    
    if (codigo.length !== 6) {
        window.validacionesComunes.mostrarError('codigo', 'El código debe tener 6 dígitos');
        return false;
    }
    
    if (!/^\d{6}$/.test(codigo)) {
        window.validacionesComunes.mostrarError('codigo', 'El código solo debe contener números');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('codigo');
    return true;
}

/**
 * Valida el campo de nueva contraseña
 */
function validarCampoNuevaPassword() {
    const passwordInput = document.getElementById('nuevaPassword');
    const password = passwordInput.value;
    
    if (password === '') {
        window.validacionesComunes.mostrarError('nuevaPassword', 'La contraseña es obligatoria');
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
        errores.push('debe contener al menos un carácter especial');
    }
    
    if (errores.length > 0) {
        window.validacionesComunes.mostrarError('nuevaPassword', 'La contraseña ' + errores.join(', '));
        return false;
    }
    
    window.validacionesComunes.mostrarExito('nuevaPassword');
    return true;
}

/**
 * Valida el campo de confirmar contraseña
 */
function validarCampoConfirmarPassword() {
    const passwordInput = document.getElementById('nuevaPassword');
    const confirmarPasswordInput = document.getElementById('confirmarPassword');
    const password = passwordInput.value;
    const confirmarPassword = confirmarPasswordInput.value;
    
    if (confirmarPassword === '') {
        window.validacionesComunes.mostrarError('confirmarPassword', 'Debes confirmar tu contraseña');
        return false;
    }
    
    if (password !== confirmarPassword) {
        window.validacionesComunes.mostrarError('confirmarPassword', 'Las contraseñas no coinciden');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('confirmarPassword');
    return true;
}

// ===================================
// PROCESOS
// ===================================

/**
 * Envía el código de verificación al email
 */
function enviarCodigoVerificacion() {
    const email = document.getElementById('email').value.trim();
    emailRecuperacion = email;
    
    // Mostrar loading
    const btnSubmit = document.querySelector('#formRecuperar button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando código...';
    
    // Simular envío de código (aquí iría la llamada al backend)
    setTimeout(() => {
        // Verificar si el email existe
        const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
        const usuarioExiste = usuarios.some(u => u.email === email);
        
        if (!usuarioExiste) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            window.validacionesComunes.mostrarAlerta('danger', 
                'No existe una cuenta asociada a este correo electrónico.', 
                'main');
            return;
        }
        
        // Generar código aleatorio (en producción vendría del backend)
        const codigoGenerado = '123456'; // Para pruebas siempre es este
        window.validacionesComunes.guardarEnStorage('codigoRecuperacion', {
            email: email,
            codigo: codigoGenerado,
            timestamp: new Date().getTime()
        });
        
        // Mostrar paso 2
        mostrarPaso2();
        
        window.validacionesComunes.mostrarAlerta('success', 
            `Código de verificación enviado a ${email}`, 
            'main');
        
    }, 1500);
}

/**
 * Verifica el código ingresado
 */
function verificarCodigo() {
    const codigo = document.getElementById('codigo').value.trim();
    
    // Mostrar loading
    const btnSubmit = document.querySelector('#formVerificarCodigo button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verificando...';
    
    // Simular verificación (aquí iría la llamada al backend)
    setTimeout(() => {
        const datosRecuperacion = window.validacionesComunes.obtenerDeStorage('codigoRecuperacion');
        
        if (!datosRecuperacion) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            window.validacionesComunes.mostrarAlerta('danger', 
                'Sesión expirada. Por favor, solicita un nuevo código.', 
                'main');
            volverPaso1();
            return;
        }
        
        // Verificar si el código es correcto
        if (codigo !== datosRecuperacion.codigo) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            window.validacionesComunes.mostrarError('codigo', 'Código incorrecto. Intenta nuevamente.');
            return;
        }
        
        // Verificar si el código no ha expirado (15 minutos)
        const tiempoTranscurrido = new Date().getTime() - datosRecuperacion.timestamp;
        const minutos = Math.floor(tiempoTranscurrido / 60000);
        
        if (minutos > 15) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            window.validacionesComunes.mostrarAlerta('danger', 
                'El código ha expirado. Por favor, solicita uno nuevo.', 
                'main');
            volverPaso1();
            return;
        }
        
        // Código correcto, mostrar paso 3
        mostrarPaso3();
        
        window.validacionesComunes.mostrarAlerta('success', 
            '¡Código verificado correctamente!', 
            'main');
        
    }, 1000);
}

/**
 * Cambia la contraseña del usuario
 */
function cambiarPassword() {
    const nuevaPassword = document.getElementById('nuevaPassword').value;
    
    // Mostrar loading
    const btnSubmit = document.querySelector('#formNuevaPassword button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cambiando contraseña...';
    
    // Simular cambio de contraseña (aquí iría la llamada al backend)
    setTimeout(() => {
        const datosRecuperacion = window.validacionesComunes.obtenerDeStorage('codigoRecuperacion');
        
        if (!datosRecuperacion) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            window.validacionesComunes.mostrarAlerta('danger', 
                'Sesión expirada. Por favor, inicia el proceso nuevamente.', 
                'main');
            volverPaso1();
            return;
        }
        
        // Actualizar contraseña en localStorage
        const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
        const indiceUsuario = usuarios.findIndex(u => u.email === datosRecuperacion.email);
        
        if (indiceUsuario !== -1) {
            usuarios[indiceUsuario].password = nuevaPassword;
            window.validacionesComunes.guardarEnStorage('usuarios', usuarios);
        }
        
        // Limpiar datos de recuperación
        window.validacionesComunes.eliminarDeStorage('codigoRecuperacion');
        
        // Mostrar mensaje de éxito
        window.validacionesComunes.mostrarAlerta('success', 
            '¡Contraseña cambiada exitosamente! Redirigiendo al inicio de sesión...', 
            'main');
        
        // Redirigir al login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    }, 1500);
}

/**
 * Reenvía el código de verificación
 */
function reenviarCodigo() {
    // Mostrar loading
    const btnReenviar = document.getElementById('btnReenviar');
    btnReenviar.disabled = true;
    btnReenviar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span><small>Reenviando...</small>';
    
    setTimeout(() => {
        // Generar nuevo código
        const codigoGenerado = '123456';
        window.validacionesComunes.guardarEnStorage('codigoRecuperacion', {
            email: emailRecuperacion,
            codigo: codigoGenerado,
            timestamp: new Date().getTime()
        });
        
        window.validacionesComunes.mostrarAlerta('success', 
            'Código reenviado exitosamente', 
            'main');
        
        // Reiniciar countdown
        iniciarCountdown();
    }, 1000);
}

// ===================================
// FUNCIONES DE UI
// ===================================

/**
 * Muestra el paso 2 (verificar código)
 */
function mostrarPaso2() {
    document.getElementById('paso1').classList.add('d-none');
    document.getElementById('paso2').classList.remove('d-none');
    document.getElementById('paso3').classList.add('d-none');
    
    // Mostrar email
    document.getElementById('emailMostrado').textContent = emailRecuperacion;
    
    // Iniciar countdown
    iniciarCountdown();
    
    // Focus en el input de código
    setTimeout(() => {
        document.getElementById('codigo').focus();
    }, 300);
}

/**
 * Muestra el paso 3 (nueva contraseña)
 */
function mostrarPaso3() {
    document.getElementById('paso1').classList.add('d-none');
    document.getElementById('paso2').classList.add('d-none');
    document.getElementById('paso3').classList.remove('d-none');
    
    // Detener countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Focus en el input de nueva contraseña
    setTimeout(() => {
        document.getElementById('nuevaPassword').focus();
    }, 300);
}

/**
 * Vuelve al paso 1
 */
function volverPaso1() {
    document.getElementById('paso1').classList.remove('d-none');
    document.getElementById('paso2').classList.add('d-none');
    document.getElementById('paso3').classList.add('d-none');
    
    // Detener countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Limpiar formularios
    document.getElementById('formRecuperar').reset();
    document.getElementById('formVerificarCodigo').reset();
    window.validacionesComunes.limpiarValidacion('email');
    window.validacionesComunes.limpiarValidacion('codigo');
}

/**
 * Inicia el countdown para reenviar código
 */
function iniciarCountdown() {
    let segundos = 60;
    const btnReenviar = document.getElementById('btnReenviar');
    const countdownSpan = document.getElementById('countdown');
    
    btnReenviar.disabled = true;
    
    countdownInterval = setInterval(() => {
        segundos--;
        countdownSpan.textContent = segundos;
        
        if (segundos <= 0) {
            clearInterval(countdownInterval);
            btnReenviar.disabled = false;
            btnReenviar.innerHTML = '<small><i class="bi bi-arrow-repeat"></i> Reenviar código</small>';
        }
    }, 1000);
}

/**
 * Actualiza visualmente los requisitos de contraseña
 */
function actualizarRequisitosPassword() {
    const password = document.getElementById('nuevaPassword').value;
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
