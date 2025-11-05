// ===================================
// VALIDACIONES - LOGIN
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const formLogin = document.getElementById('formLogin');
    
    if (formLogin) {
        // Validación en tiempo real de email
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', function() {
            validarCampoEmail();
        });
        
        emailInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                validarCampoEmail();
            }
        });
        
        // Validación en tiempo real de contraseña
        const passwordInput = document.getElementById('password');
        passwordInput.addEventListener('blur', function() {
            validarCampoPassword();
        });
        
        // Manejar envío del formulario
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validarFormularioLogin()) {
                procesarLogin();
            }
        });
    }
});

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
 * Valida el campo de contraseña
 */
function validarCampoPassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    if (password === '') {
        window.validacionesComunes.mostrarError('password', 'La contraseña es obligatoria');
        return false;
    }
    
    if (password.length < 4) {
        window.validacionesComunes.mostrarError('password', 'La contraseña debe tener al menos 4 caracteres');
        return false;
    }
    
    window.validacionesComunes.mostrarExito('password');
    return true;
}

/**
 * Valida todo el formulario de login
 */
function validarFormularioLogin() {
    const emailValido = validarCampoEmail();
    const passwordValido = validarCampoPassword();
    
    return emailValido && passwordValido;
}

/**
 * Procesa el login del usuario
 */
function procesarLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Mostrar loading
    const btnSubmit = document.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';
    
    // Simular proceso de autenticación (aquí iría la llamada al backend)
    setTimeout(() => {
        // Usuarios de prueba
        const usuariosDemo = {
            'admin@gastos.cl': {
                password: 'Admin123!',
                tipo: 'administrador',
                nombre: 'Administrador Principal',
                casa: null
            },
            'usuario@gastos.cl': {
                password: 'User123!',
                tipo: 'residente',
                nombre: 'Usuario Demo',
                casa: {
                    pasaje: '8651',
                    letra: 'A'
                }
            }
        };
        
        // Verificar credenciales
        if (usuariosDemo[email] && usuariosDemo[email].password === password) {
            const usuario = usuariosDemo[email];
            
            // Verificar que el tipo coincida
            if (usuario.tipo !== tipoUsuario) {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = textoOriginal;
                window.validacionesComunes.mostrarAlerta('danger', 
                    `Este usuario es de tipo "${usuario.tipo}". Por favor selecciona el tipo de usuario correcto.`, 
                    'main');
                return;
            }
            
            // Guardar sesión
            const sesion = {
                email: email,
                tipo: tipoUsuario,
                nombre: usuario.nombre,
                casa: usuario.casa,
                fechaLogin: new Date().toISOString()
            };
            
            window.validacionesComunes.guardarEnStorage('sesionActual', sesion);
            
            if (rememberMe) {
                window.validacionesComunes.guardarEnStorage('recordarSesion', true);
            }
            
            // Mostrar mensaje de éxito
            window.validacionesComunes.mostrarAlerta('success', 
                `¡Bienvenido/a ${usuario.nombre}!`, 
                'main');
            
            // Redirigir según el tipo de usuario
            setTimeout(() => {
                if (tipoUsuario === 'administrador') {
                    window.location.href = 'vista_admin/dashboard-admin.html';
                } else {
                    window.location.href = 'vista_usuario/dashboard-usuario.html';
                }
            }, 1500);
            
        } else {
            // Credenciales incorrectas
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            
            window.validacionesComunes.mostrarAlerta('danger', 
                'Correo o contraseña incorrectos. <br><small><strong>Usuarios de prueba:</strong><br>Admin: admin@gastos.cl / Admin123!<br>Usuario: usuario@gastos.cl / User123!</small>', 
                'main');
        }
    }, 1500);
}

// Verificar si ya hay una sesión activa
window.addEventListener('load', function() {
    const sesionActual = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    if (sesionActual) {
        // Ya hay una sesión activa, redirigir
        const tipoUsuario = sesionActual.tipo;
        
        if (tipoUsuario === 'administrador') {
            window.location.href = 'vista_admin/dashboard-admin.html';
        } else {
            window.location.href = 'vista_usuario/dashboard-usuario.html';
        }
    }
});
