// ===================================
// SISTEMA DE GASTOS COMUNES - JS PRINCIPAL
// ===================================

// Configuración de casas disponibles
const CASAS_8651 = ['A', 'B', 'C', 'D', 'E', 'F'];
const CASAS_8707 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// ===================================
// FUNCIONES DE VALIDACIÓN
// ===================================

/**
 * Valida formato de email
 */
function validarEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

/**
 * Valida contraseña con múltiples criterios
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Máximo 20 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 */
function validarPassword(password) {
    const validaciones = {
        longitud: password.length >= 8 && password.length <= 20,
        mayuscula: /[A-Z]/.test(password),
        minuscula: /[a-z]/.test(password),
        numero: /[0-9]/.test(password),
        especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    return validaciones;
}

/**
 * Verifica si la contraseña cumple todos los requisitos
 */
function passwordEsValida(password) {
    const validaciones = validarPassword(password);
    return Object.values(validaciones).every(v => v === true);
}

/**
 * Valida nombre (solo letras y espacios)
 */
function validarNombre(nombre) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    return regex.test(nombre);
}

/**
 * Valida RUT chileno
 */
function validarRUT(rut) {
    // Eliminar puntos y guión
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    
    if (rut.length < 2) return false;
    
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();
    
    // Validar que el cuerpo sean solo números
    if (!/^\d+$/.test(cuerpo)) return false;
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    return dv === dvCalculado;
}

/**
 * Formatea RUT con puntos y guión
 */
function formatearRUT(rut) {
    // Eliminar todo excepto números y K
    rut = rut.replace(/[^0-9kK]/g, '');
    
    if (rut.length <= 1) return rut;
    
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    // Agregar puntos al cuerpo
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${cuerpoFormateado}-${dv}`;
}

/**
 * Valida teléfono chileno (9 dígitos que empieza con 9)
 */
function validarTelefono(telefono) {
    const regex = /^9\d{8}$/;
    return regex.test(telefono.replace(/\s/g, ''));
}

/**
 * Valida selección de casa
 */
function validarCasa(pasaje, casa) {
    if (pasaje === '8651') {
        return CASAS_8651.includes(casa);
    } else if (pasaje === '8707') {
        return CASAS_8707.includes(casa);
    }
    return false;
}

// ===================================
// FUNCIONES DE UI
// ===================================

/**
 * Muestra mensaje de error en un campo
 */
function mostrarError(campoId, mensaje) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(`${campoId}Error`);
    
    if (campo && errorDiv) {
        campo.classList.add('is-invalid');
        campo.classList.remove('is-valid');
        errorDiv.textContent = mensaje;
    }
}

/**
 * Muestra mensaje de éxito en un campo
 */
function mostrarExito(campoId) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(`${campoId}Error`);
    
    if (campo) {
        campo.classList.add('is-valid');
        campo.classList.remove('is-invalid');
        if (errorDiv) errorDiv.textContent = '';
    }
}

/**
 * Limpia validación de un campo
 */
function limpiarValidacion(campoId) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(`${campoId}Error`);
    
    if (campo) {
        campo.classList.remove('is-invalid', 'is-valid');
        if (errorDiv) errorDiv.textContent = '';
    }
}

/**
 * Muestra alerta de Bootstrap
 */
function mostrarAlerta(tipo, mensaje, contenedor = 'body') {
    const alertaHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            <i class="bi bi-${tipo === 'success' ? 'check-circle' : tipo === 'danger' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const contenedorElement = document.querySelector(contenedor);
    if (contenedorElement) {
        contenedorElement.insertAdjacentHTML('afterbegin', alertaHTML);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            const alerta = contenedorElement.querySelector('.alert');
            if (alerta) {
                alerta.classList.remove('show');
                setTimeout(() => alerta.remove(), 150);
            }
        }, 5000);
    }
}

/**
 * Toggle para mostrar/ocultar contraseña
 */
function initTogglePassword() {
    const toggleButtons = document.querySelectorAll('[id^="togglePassword"]');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    });
}

// ===================================
// FUNCIONES DE ALMACENAMIENTO
// ===================================

/**
 * Guarda datos en localStorage
 */
function guardarEnStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

/**
 * Obtiene datos de localStorage
 */
function obtenerDeStorage(clave) {
    try {
        const valor = localStorage.getItem(clave);
        return valor ? JSON.parse(valor) : null;
    } catch (error) {
        console.error('Error al obtener de localStorage:', error);
        return null;
    }
}

/**
 * Elimina datos de localStorage
 */
function eliminarDeStorage(clave) {
    try {
        localStorage.removeItem(clave);
        return true;
    } catch (error) {
        console.error('Error al eliminar de localStorage:', error);
        return false;
    }
}

// ===================================
// INICIALIZACIÓN
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar toggle de contraseñas
    initTogglePassword();
    
    // Inicializar tooltips de Bootstrap
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
    
    // Inicializar popovers de Bootstrap
    const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    popovers.forEach(popover => new bootstrap.Popover(popover));
    
    console.log('Sistema de Gastos Comunes - JS inicializado correctamente');
});

// Exportar funciones para uso global
window.validacionesComunes = {
    validarEmail,
    validarPassword,
    passwordEsValida,
    validarNombre,
    validarRUT,
    formatearRUT,
    validarTelefono,
    validarCasa,
    mostrarError,
    mostrarExito,
    limpiarValidacion,
    mostrarAlerta,
    guardarEnStorage,
    obtenerDeStorage,
    eliminarDeStorage,
    CASAS_8651,
    CASAS_8707
};
