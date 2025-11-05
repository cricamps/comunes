// ===================================
// VALIDACIONES - PERFIL
// ===================================

let datosOriginales = {};

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay sesión activa
    verificarSesion();
    
    // Cargar datos del usuario
    cargarDatosUsuario();
    
    // ===================================
    // FORMULARIO DE PERFIL
    // ===================================
    
    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        // Validaciones en tiempo real
        const nombreInput = document.getElementById('nombre');
        nombreInput.addEventListener('blur', function() {
            validarCampoNombre();
        });
        
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', function() {
            validarCampoEmail();
        });
        
        const telefonoInput = document.getElementById('telefono');
        telefonoInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        
        telefonoInput.addEventListener('blur', function() {
            validarCampoTelefono();
        });
        
        // Submit del formulario
        formPerfil.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validarFormularioPerfil()) {
                guardarCambiosPerfil();
            }
        });
        
        // Botón cancelar
        document.getElementById('btnCancelar').addEventListener('click', function() {
            restaurarDatosOriginales();
        });
    }
    
    // ===================================
    // FORMULARIO CAMBIAR CONTRASEÑA
    // ===================================
    
    const formCambiarPassword = document.getElementById('formCambiarPassword');
    if (formCambiarPassword) {
        const passwordActualInput = document.getElementById('passwordActual');
        const passwordNuevaInput = document.getElementById('passwordNueva');
        const passwordConfirmarInput = document.getElementById('passwordConfirmar');
        
        passwordActualInput.addEventListener('blur', function() {
            validarCampoPasswordActual();
        });
        
        passwordNuevaInput.addEventListener('input', function() {
            actualizarRequisitosPassword();
            if (this.value.length > 0) {
                validarCampoPasswordNueva();
            }
            if (passwordConfirmarInput.value.length > 0) {
                validarCampoPasswordConfirmar();
            }
        });
        
        passwordNuevaInput.addEventListener('blur', function() {
            validarCampoPasswordNueva();
        });
        
        passwordConfirmarInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                validarCampoPasswordConfirmar();
            }
        });
        
        passwordConfirmarInput.addEventListener('blur', function() {
            validarCampoPasswordConfirmar();
        });
        
        // Toggle contraseñas
        document.getElementById('togglePasswordActual').addEventListener('click', function() {
            togglePasswordVisibility('passwordActual', 'eyeIconActual');
        });
        
        document.getElementById('togglePasswordNueva').addEventListener('click', function() {
            togglePasswordVisibility('passwordNueva', 'eyeIconNueva');
        });
        
        document.getElementById('togglePasswordConfirmar').addEventListener('click', function() {
            togglePasswordVisibility('passwordConfirmar', 'eyeIconConfirmar');
        });
        
        // Submit del formulario
        formCambiarPassword.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validarFormularioCambiarPassword()) {
                cambiarPassword();
            }
        });
    }
    
    // ===================================
    // ACCIONES
    // ===================================
    
    // Cerrar sesión
    document.getElementById('btnCerrarSesion').addEventListener('click', function(e) {
        e.preventDefault();
        cerrarSesion();
    });
    
    // Eliminar cuenta
    document.getElementById('btnEliminarCuenta').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('modalEliminarCuenta'));
        modal.show();
    });
    
    document.getElementById('btnConfirmarEliminar').addEventListener('click', function() {
        eliminarCuenta();
    });
});

// ===================================
// FUNCIONES DE SESIÓN
// ===================================

/**
 * Verifica si hay una sesión activa
 */
function verificarSesion() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    if (!sesion) {
        window.location.href = 'login.html';
        return;
    }
}

/**
 * Carga los datos del usuario actual
 */
function cargarDatosUsuario() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    if (!sesion) return;
    
    // Buscar usuario en la base de datos
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const usuario = usuarios.find(u => u.email === sesion.email);
    
    if (usuario) {
        // Guardar datos originales
        datosOriginales = { ...usuario };
        
        // Llenar formulario de perfil
        document.getElementById('nombre').value = usuario.nombre || '';
        document.getElementById('rut').value = usuario.rut || '';
        document.getElementById('email').value = usuario.email || '';
        document.getElementById('telefono').value = usuario.telefono || '';
        
        // Información de vivienda
        if (usuario.casa) {
            document.getElementById('pasajeDisplay').textContent = `Pasaje ${usuario.casa.pasaje}`;
            document.getElementById('casaDisplay').textContent = `Casa ${usuario.casa.letra}`;
        }
        
        // Información de cuenta
        document.getElementById('tipoUsuarioDisplay').textContent = 
            sesion.tipo === 'administrador' ? 'Administrador' : 'Residente';
        
        if (usuario.fechaRegistro) {
            const fecha = new Date(usuario.fechaRegistro);
            document.getElementById('fechaRegistroDisplay').textContent = 
                fecha.toLocaleDateString('es-CL', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
        }
    }
}

/**
 * Cierra la sesión del usuario
 */
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        window.validacionesComunes.eliminarDeStorage('sesionActual');
        window.validacionesComunes.eliminarDeStorage('recordarSesion');
        
        window.validacionesComunes.mostrarAlerta('info', 
            'Sesión cerrada correctamente', 
            'main');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

/**
 * Elimina la cuenta del usuario
 */
function eliminarCuenta() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    if (!sesion) return;
    
    // Eliminar usuario de la base de datos
    let usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    usuarios = usuarios.filter(u => u.email !== sesion.email);
    window.validacionesComunes.guardarEnStorage('usuarios', usuarios);
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminarCuenta'));
    modal.hide();
    
    // Cerrar sesión
    window.validacionesComunes.eliminarDeStorage('sesionActual');
    window.validacionesComunes.eliminarDeStorage('recordarSesion');
    
    window.validacionesComunes.mostrarAlerta('success', 
        'Tu cuenta ha sido eliminada correctamente', 
        'main');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// ===================================
// VALIDACIONES - PERFIL
// ===================================

function validarCampoNombre() {
    const nombreInput = document.getElementById('nombre');
    const nombre = nombreInput.value.trim();
    
    if (nombre === '') {
        window.validacionesComunes.mostrarError('nombre', 'El nombre completo es obligatorio');
        return false;
    }
    
    if (!window.validacionesComunes.validarNombre(nombre)) {
        window.validacionesComunes.mostrarError('nombre', 'El nombre solo debe contener letras y espacios');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('nombre');
    return true;
}

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

function validarFormularioPerfil() {
    const nombreValido = validarCampoNombre();
    const emailValido = validarCampoEmail();
    const telefonoValido = validarCampoTelefono();
    
    return nombreValido && emailValido && telefonoValido;
}

// ===================================
// VALIDACIONES - CONTRASEÑA
// ===================================

function validarCampoPasswordActual() {
    const passwordInput = document.getElementById('passwordActual');
    const password = passwordInput.value;
    
    if (password === '') {
        window.validacionesComunes.mostrarError('passwordActual', 'Debes ingresar tu contraseña actual');
        return false;
    }
    
    // Verificar si la contraseña actual es correcta
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const usuario = usuarios.find(u => u.email === sesion.email);
    
    if (usuario && usuario.password !== password) {
        window.validacionesComunes.mostrarError('passwordActual', 'La contraseña actual es incorrecta');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('passwordActual');
    return true;
}

function validarCampoPasswordNueva() {
    const passwordInput = document.getElementById('passwordNueva');
    const password = passwordInput.value;
    
    if (password === '') {
        window.validacionesComunes.mostrarError('passwordNueva', 'La nueva contraseña es obligatoria');
        return false;
    }
    
    const validaciones = window.validacionesComunes.validarPassword(password);
    const errores = [];
    
    if (!validaciones.longitud) errores.push('debe tener entre 8 y 20 caracteres');
    if (!validaciones.mayuscula) errores.push('debe contener al menos una mayúscula');
    if (!validaciones.minuscula) errores.push('debe contener al menos una minúscula');
    if (!validaciones.numero) errores.push('debe contener al menos un número');
    if (!validaciones.especial) errores.push('debe contener al menos un carácter especial');
    
    if (errores.length > 0) {
        window.validacionesComunes.mostrarError('passwordNueva', 'La contraseña ' + errores.join(', '));
        return false;
    }
    
    window.validacionesComunes.mostrarExito('passwordNueva');
    return true;
}

function validarCampoPasswordConfirmar() {
    const passwordNueva = document.getElementById('passwordNueva').value;
    const passwordConfirmar = document.getElementById('passwordConfirmar').value;
    
    if (passwordConfirmar === '') {
        window.validacionesComunes.mostrarError('passwordConfirmar', 'Debes confirmar tu nueva contraseña');
        return false;
    }
    
    if (passwordNueva !== passwordConfirmar) {
        window.validacionesComunes.mostrarError('passwordConfirmar', 'Las contraseñas no coinciden');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('passwordConfirmar');
    return true;
}

function validarFormularioCambiarPassword() {
    const actualValida = validarCampoPasswordActual();
    const nuevaValida = validarCampoPasswordNueva();
    const confirmarValida = validarCampoPasswordConfirmar();
    
    return actualValida && nuevaValida && confirmarValida;
}

// ===================================
// PROCESOS
// ===================================

/**
 * Guarda los cambios en el perfil
 */
function guardarCambiosPerfil() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    const datosActualizados = {
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim()
    };
    
    // Mostrar loading
    const btnSubmit = document.querySelector('#formPerfil button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    
    setTimeout(() => {
        // Actualizar usuario en la base de datos
        let usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
        const indice = usuarios.findIndex(u => u.email === sesion.email);
        
        if (indice !== -1) {
            usuarios[indice].nombre = datosActualizados.nombre;
            usuarios[indice].email = datosActualizados.email;
            usuarios[indice].telefono = datosActualizados.telefono;
            
            window.validacionesComunes.guardarEnStorage('usuarios', usuarios);
            
            // Actualizar sesión si cambió el email
            if (sesion.email !== datosActualizados.email) {
                sesion.email = datosActualizados.email;
                sesion.nombre = datosActualizados.nombre;
                window.validacionesComunes.guardarEnStorage('sesionActual', sesion);
            }
            
            // Actualizar datos originales
            datosOriginales = { ...usuarios[indice] };
            
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            
            window.validacionesComunes.mostrarAlerta('success', 
                'Perfil actualizado correctamente', 
                'main');
        }
    }, 1000);
}

/**
 * Cambia la contraseña del usuario
 */
function cambiarPassword() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    const nuevaPassword = document.getElementById('passwordNueva').value;
    
    // Mostrar loading
    const btnSubmit = document.querySelector('#formCambiarPassword button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cambiando contraseña...';
    
    setTimeout(() => {
        // Actualizar contraseña en la base de datos
        let usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
        const indice = usuarios.findIndex(u => u.email === sesion.email);
        
        if (indice !== -1) {
            usuarios[indice].password = nuevaPassword;
            window.validacionesComunes.guardarEnStorage('usuarios', usuarios);
            
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            
            // Limpiar formulario
            document.getElementById('formCambiarPassword').reset();
            window.validacionesComunes.limpiarValidacion('passwordActual');
            window.validacionesComunes.limpiarValidacion('passwordNueva');
            window.validacionesComunes.limpiarValidacion('passwordConfirmar');
            
            // Resetear requisitos
            resetearRequisitos();
            
            window.validacionesComunes.mostrarAlerta('success', 
                'Contraseña cambiada correctamente', 
                'main');
        }
    }, 1000);
}

/**
 * Restaura los datos originales del formulario
 */
function restaurarDatosOriginales() {
    if (datosOriginales) {
        document.getElementById('nombre').value = datosOriginales.nombre || '';
        document.getElementById('email').value = datosOriginales.email || '';
        document.getElementById('telefono').value = datosOriginales.telefono || '';
        
        // Limpiar validaciones
        window.validacionesComunes.limpiarValidacion('nombre');
        window.validacionesComunes.limpiarValidacion('email');
        window.validacionesComunes.limpiarValidacion('telefono');
        
        window.validacionesComunes.mostrarAlerta('info', 
            'Cambios cancelados', 
            'main');
    }
}

// ===================================
// FUNCIONES DE UI
// ===================================

function actualizarRequisitosPassword() {
    const password = document.getElementById('passwordNueva').value;
    const validaciones = window.validacionesComunes.validarPassword(password);
    
    actualizarRequisito('req-longitud', validaciones.longitud);
    actualizarRequisito('req-mayuscula', validaciones.mayuscula);
    actualizarRequisito('req-minuscula', validaciones.minuscula);
    actualizarRequisito('req-numero', validaciones.numero);
    actualizarRequisito('req-especial', validaciones.especial);
}

function actualizarRequisito(id, cumplido) {
    const elemento = document.getElementById(id);
    const icono = elemento.querySelector('i');
    
    if (cumplido) {
        elemento.classList.remove('text-muted');
        elemento.classList.add('text-success');
        icono.classList.remove('bi-circle');
        icono.classList.add('bi-check-circle-fill');
    } else {
        elemento.classList.remove('text-success');
        elemento.classList.add('text-muted');
        icono.classList.remove('bi-check-circle-fill');
        icono.classList.add('bi-circle');
    }
}

function resetearRequisitos() {
    ['req-longitud', 'req-mayuscula', 'req-minuscula', 'req-numero', 'req-especial'].forEach(id => {
        actualizarRequisito(id, false);
    });
}

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
