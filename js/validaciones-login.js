// ===================================
// VALIDACIONES - LOGIN (Simplificado)
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const formLogin = document.getElementById('formLogin');
    
    if (formLogin) {
        // Verificar si ya hay sesión activa
        if (window.AuthManager) {
            window.AuthManager.verificarSesionActiva();
        }

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
        
        // Manejar envío del formulario usando AuthManager
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validarFormularioLogin()) {
                return;
            }

            // Obtener datos
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Mostrar loading
            const btnSubmit = this.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerHTML;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';
            
            try {
                // Usar AuthManager para procesar el login
                const resultado = await window.AuthManager.procesarLogin(email, password, rememberMe);
                
                // Mostrar mensaje de éxito
                window.validacionesComunes.mostrarAlerta('success', resultado.mensaje, 'main');
                
                // Redirigir al dashboard
                setTimeout(() => {
                    console.log('Redirigiendo a dashboard...');
                    window.location.href = 'vista_admin/dashboard-admin.html';
                }, 1500);
                
            } catch (error) {
                // Restaurar botón
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = textoOriginal;
                
                // Mostrar error
                window.validacionesComunes.mostrarAlerta('danger', error.mensaje, 'main');
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
