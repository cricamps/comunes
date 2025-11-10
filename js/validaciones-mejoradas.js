// ===================================
// VALIDACIONES Y UTILIDADES - VERSIÓN 2.0
// ===================================
// Sistema mejorado con soporte para múltiples residentes por casa

/**
 * Validaciones mejoradas para el sistema
 */
const ValidacionesMejoradas = {
    
    /**
     * Valida fecha de nacimiento y calcula edad
     * @param {string} fechaNacimiento - Fecha en formato YYYY-MM-DD
     * @returns {Object} - {valido: boolean, edad: number, mensaje: string}
     */
    validarEdad(fechaNacimiento) {
        if (!fechaNacimiento) {
            return {
                valido: false,
                edad: 0,
                mensaje: 'Debe ingresar la fecha de nacimiento'
            };
        }
        
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        
        // Validar que la fecha no sea futura
        if (nacimiento > hoy) {
            return {
                valido: false,
                edad: 0,
                mensaje: 'La fecha de nacimiento no puede ser futura'
            };
        }
        
        // Calcular edad
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        
        // Validar edad mínima de 18 años
        if (edad < 18) {
            return {
                valido: false,
                edad: edad,
                mensaje: `El residente debe ser mayor de 18 años (tiene ${edad} años)`
            };
        }
        
        // Validar edad máxima razonable (120 años)
        if (edad > 120) {
            return {
                valido: false,
                edad: edad,
                mensaje: 'Por favor verifique la fecha de nacimiento'
            };
        }
        
        return {
            valido: true,
            edad: edad,
            mensaje: `Edad válida: ${edad} años`
        };
    },
    
    /**
     * Verifica si ya existe un residente con el mismo email
     * @param {string} email - Email a verificar
     * @param {string} emailActual - Email actual (para edición)
     * @returns {Object} - {disponible: boolean, mensaje: string}
     */
    verificarEmailDisponible(email, emailActual = null) {
        const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
        
        const existe = usuarios.find(u => {
            // Si estamos editando, excluir el email actual
            if (emailActual && u.email === emailActual) {
                return false;
            }
            return u.email === email;
        });
        
        if (existe) {
            return {
                disponible: false,
                mensaje: 'Este email ya está registrado en el sistema'
            };
        }
        
        return {
            disponible: true,
            mensaje: 'Email disponible'
        };
    },
    
    /**
     * Obtiene todos los residentes de una casa específica
     * @param {string} pasaje - Número de pasaje
     * @param {string} casa - Letra de la casa
     * @returns {Array} - Array de residentes en esa casa
     */
    obtenerResidentesPorCasa(pasaje, casa) {
        const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
        
        return usuarios.filter(u => 
            u.pasaje === pasaje && 
            u.casa === casa &&
            u.rol !== 'administrador' // Excluir admins
        );
    },
    
    /**
     * Verifica si una casa tiene capacidad para más residentes
     * @param {string} pasaje - Número de pasaje
     * @param {string} casa - Letra de la casa
     * @param {number} maxResidentes - Máximo de residentes permitidos (default: 10)
     * @returns {Object} - {disponible: boolean, cantidad: number, mensaje: string}
     */
    verificarCapacidadCasa(pasaje, casa, maxResidentes = 10) {
        const residentes = this.obtenerResidentesPorCasa(pasaje, casa);
        const cantidad = residentes.length;
        
        if (cantidad >= maxResidentes) {
            return {
                disponible: false,
                cantidad: cantidad,
                mensaje: `La casa ${pasaje}-${casa} ya tiene el máximo de ${maxResidentes} residentes registrados`
            };
        }
        
        return {
            disponible: true,
            cantidad: cantidad,
            mensaje: `Casa ${pasaje}-${casa} tiene ${cantidad} residente(s) registrado(s)`
        };
    },
    
    /**
     * Obtiene el titular principal de una casa (el primero registrado)
     * @param {string} pasaje - Número de pasaje
     * @param {string} casa - Letra de la casa
     * @returns {Object|null} - Usuario titular o null
     */
    obtenerTitularCasa(pasaje, casa) {
        const residentes = this.obtenerResidentesPorCasa(pasaje, casa);
        
        if (residentes.length === 0) {
            return null;
        }
        
        // El titular es el primero en registrarse (o el marcado como titular)
        return residentes.find(r => r.esTitular === true) || residentes[0];
    },
    
    /**
     * Valida un RUT chileno completo
     * @param {string} rut - RUT en formato XX.XXX.XXX-X o XXXXXXXX-X
     * @returns {Object} - {valido: boolean, mensaje: string, rutFormateado: string}
     */
    validarRutCompleto(rut) {
        // Limpiar RUT
        const rutLimpio = rut.replace(/[.-]/g, '');
        
        // Validar formato básico
        if (!/^[0-9]{7,8}[0-9Kk]$/.test(rutLimpio)) {
            return {
                valido: false,
                mensaje: 'Formato de RUT inválido. Use: 12345678-9',
                rutFormateado: rut
            };
        }
        
        // Separar cuerpo y dígito verificador
        const cuerpo = rutLimpio.slice(0, -1);
        const dv = rutLimpio.slice(-1).toUpperCase();
        
        // Calcular dígito verificador
        let suma = 0;
        let multiplicador = 2;
        
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo.charAt(i)) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }
        
        const dvEsperado = 11 - (suma % 11);
        let dvCalculado;
        
        if (dvEsperado === 11) {
            dvCalculado = '0';
        } else if (dvEsperado === 10) {
            dvCalculado = 'K';
        } else {
            dvCalculado = dvEsperado.toString();
        }
        
        // Validar
        if (dv !== dvCalculado) {
            return {
                valido: false,
                mensaje: `Dígito verificador incorrecto. Debería ser: ${dvCalculado}`,
                rutFormateado: rut
            };
        }
        
        // Formatear RUT
        const rutFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
        
        return {
            valido: true,
            mensaje: 'RUT válido',
            rutFormateado: rutFormateado
        };
    },
    
    /**
     * Genera un comprobante único para pagos
     * @param {string} metodoPago - Método de pago utilizado
     * @returns {string} - Código de comprobante
     */
    generarComprobante(metodoPago) {
        const prefijos = {
            'efectivo': 'EFE',
            'transferencia': 'TRF',
            'deposito': 'DEP',
            'cheque': 'CHQ'
        };
        
        const prefijo = prefijos[metodoPago] || 'PAG';
        const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        return `${prefijo}-${fecha}-${random}`;
    },
    
    /**
     * Formatea un número como moneda chilena
     * @param {number} monto - Monto a formatear
     * @returns {string} - Monto formateado
     */
    formatearMoneda(monto) {
        return '$' + monto.toLocaleString('es-CL');
    },
    
    /**
     * Calcula el gasto común por casa
     * @param {number} totalGastos - Total de gastos del mes
     * @param {number} numeroCasas - Número de casas (default: 13)
     * @returns {number} - Monto por casa redondeado
     */
    calcularGastoPorCasa(totalGastos, numeroCasas = 13) {
        return Math.round(totalGastos / numeroCasas);
    }
};

// Hacer disponible globalmente
window.ValidacionesMejoradas = ValidacionesMejoradas;

/**
 * Utilidad para mostrar toasts de Bootstrap
 */
const ToastHelper = {
    
    /**
     * Muestra un toast de éxito
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en ms (default: 5000)
     */
    mostrarExito(mensaje, duracion = 5000) {
        this._mostrarToast(mensaje, 'success', duracion);
    },
    
    /**
     * Muestra un toast de error
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en ms (default: 5000)
     */
    mostrarError(mensaje, duracion = 5000) {
        this._mostrarToast(mensaje, 'danger', duracion);
    },
    
    /**
     * Muestra un toast de advertencia
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en ms (default: 5000)
     */
    mostrarAdvertencia(mensaje, duracion = 5000) {
        this._mostrarToast(mensaje, 'warning', duracion);
    },
    
    /**
     * Muestra un toast de información
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en ms (default: 5000)
     */
    mostrarInfo(mensaje, duracion = 5000) {
        this._mostrarToast(mensaje, 'info', duracion);
    },
    
    /**
     * Método interno para crear y mostrar toast
     * @private
     */
    _mostrarToast(mensaje, tipo, duracion) {
        // Buscar contenedor de toast
        let toastContainer = document.getElementById('toastContainer');
        
        // Crear contenedor si no existe
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '11';
            document.body.appendChild(toastContainer);
        }
        
        // Colores según tipo
        const colores = {
            'success': 'bg-success',
            'danger': 'bg-danger',
            'warning': 'bg-warning',
            'info': 'bg-info'
        };
        
        // Iconos según tipo
        const iconos = {
            'success': 'bi-check-circle-fill',
            'danger': 'bi-x-circle-fill',
            'warning': 'bi-exclamation-triangle-fill',
            'info': 'bi-info-circle-fill'
        };
        
        // Títulos según tipo
        const titulos = {
            'success': '¡Éxito!',
            'danger': 'Error',
            'warning': 'Advertencia',
            'info': 'Información'
        };
        
        // Crear toast
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header ${colores[tipo]} text-white">
                    <i class="bi ${iconos[tipo]} me-2"></i>
                    <strong class="me-auto">${titulos[tipo]}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${mensaje}
                </div>
            </div>
        `;
        
        // Agregar al contenedor
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        // Obtener elemento y mostrar
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            animation: true,
            autohide: true,
            delay: duracion
        });
        
        toast.show();
        
        // Eliminar del DOM después de ocultarse
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
    }
};

// Hacer disponible globalmente
window.ToastHelper = ToastHelper;

console.log('✅ Validaciones mejoradas cargadas');
console.log('✅ Toast Helper cargado');
