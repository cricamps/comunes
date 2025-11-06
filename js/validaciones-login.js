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
        
        // Toggle password visibility - CORREGIDO
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', function(e) {
                e.preventDefault(); // Prevenir comportamiento por defecto
                const passwordInput = document.getElementById('password');
                const eyeIcon = document.getElementById('eyeIcon');
                
                if (passwordInput && eyeIcon) {
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        eyeIcon.classList.remove('bi-eye');
                        eyeIcon.classList.add('bi-eye-slash');
                    } else {
                        passwordInput.type = 'password';
                        eyeIcon.classList.remove('bi-eye-slash');
                        eyeIcon.classList.add('bi-eye');
                    }
                }
            });
        }
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
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Mostrar loading
    const btnSubmit = document.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';
    
    // Simular proceso de autenticación
    setTimeout(() => {
        // Buscar usuario en localStorage
        const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
        const usuario = usuarios.find(u => u.email === email);
        
        // Verificar si existe el usuario y la contraseña es correcta
        if (!usuario) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            window.validacionesComunes.mostrarAlerta('danger', 
                'No existe una cuenta con este correo electrónico.<br><small>Usuarios de prueba:<br>Admin: admin@gastos.cl / Admin123!<br>Usuario: usuario@gastos.cl / User123!</small>', 
                'main');
            return;
        }
        
        if (usuario.password !== password) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            window.validacionesComunes.mostrarAlerta('danger', 
                'Contraseña incorrecta. Por favor verifica tus credenciales.', 
                'main');
            return;
        }
        
        // Determinar tipo de usuario automáticamente según el rol
        // Prioridad: rol > tipo > por defecto 'residente'
        let tipoUsuario = 'residente'; // valor por defecto
        
        if (usuario.rol) {
            tipoUsuario = usuario.rol;
        } else if (usuario.tipo) {
            tipoUsuario = usuario.tipo;
        }
        
        console.log('Usuario encontrado:', usuario.nombre);
        console.log('Rol del usuario:', usuario.rol);
        console.log('Tipo asignado:', tipoUsuario);
        
        // Guardar sesión
        const sesion = {
            email: email,
            tipo: tipoUsuario,
            nombre: usuario.nombre,
            casa: usuario.casa || null,
            pasaje: usuario.pasaje || null,
            fechaLogin: new Date().toISOString()
        };
        
        console.log('Sesión creada:', sesion);
        
        window.validacionesComunes.guardarEnStorage('sesionActual', sesion);
        
        if (rememberMe) {
            window.validacionesComunes.guardarEnStorage('recordarSesion', true);
        }
        
        // Mostrar mensaje de éxito
        window.validacionesComunes.mostrarAlerta('success', 
            `¡Bienvenido/a ${usuario.nombre}!`, 
            'main');
        
        // TODOS van al mismo dashboard unificado
        setTimeout(() => {
            console.log('Redirigiendo a dashboard unificado...');
            window.location.href = 'vista_admin/dashboard-admin.html';
        }, 1500);
        
    }, 1500);
}

// Verificar si ya hay una sesión activa
window.addEventListener('load', function() {
    const sesionActual = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    if (sesionActual) {
        console.log('Sesión activa detectada:', sesionActual);
        // Redirigir al dashboard unificado
        console.log('Redirigiendo a dashboard unificado...');
        window.location.href = 'vista_admin/dashboard-admin.html';
    }
});
