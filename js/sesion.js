// ===================================
// SESION.JS - Control de sesión y roles
// ===================================

/**
 * Módulo de gestión de sesiones
 * Maneja el inicio, cierre y verificación de sesiones de usuario
 */

const SesionManager = {
    /**
     * Verifica si hay una sesión activa
     * @returns {Object|null} Datos de la sesión actual o null
     */
    obtenerSesionActual() {
        return window.validacionesComunes.obtenerDeStorage('sesionActual');
    },

    /**
     * Verifica si el usuario actual es administrador
     * @returns {boolean}
     */
    esAdministrador() {
        const sesion = this.obtenerSesionActual();
        return sesion && (sesion.tipo === 'administrador' || sesion.rol === 'administrador');
    },

    /**
     * Verifica si el usuario actual es residente
     * @returns {boolean}
     */
    esResidente() {
        const sesion = this.obtenerSesionActual();
        return sesion && (sesion.tipo === 'residente' || sesion.rol === 'residente');
    },

    /**
     * Obtiene el rol del usuario actual
     * @returns {string} 'administrador', 'residente' o null
     */
    obtenerRol() {
        const sesion = this.obtenerSesionActual();
        if (!sesion) return null;
        return sesion.tipo || sesion.rol;
    },

    /**
     * Verifica si hay una sesión activa, si no redirige al login
     * @param {boolean} requiereAdmin - Si es true, solo permite administradores
     */
    verificarSesion(requiereAdmin = false) {
        const sesion = this.obtenerSesionActual();
        
        if (!sesion) {
            console.log('No hay sesión activa, redirigiendo al login...');
            window.location.href = '../login.html';
            return false;
        }

        if (requiereAdmin && !this.esAdministrador()) {
            console.log('Acceso denegado: se requiere rol de administrador');
            alert('No tienes permisos para acceder a esta sección');
            window.location.href = 'dashboard-admin.html';
            return false;
        }

        console.log('Sesión verificada:', sesion);
        console.log('Rol del usuario:', this.obtenerRol());
        return true;
    },

    /**
     * Cierra la sesión actual
     */
    cerrarSesion() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            window.validacionesComunes.eliminarDeStorage('sesionActual');
            window.validacionesComunes.eliminarDeStorage('recordarSesion');
            console.log('Sesión cerrada correctamente');
            window.location.href = '../login.html';
        }
    },

    /**
     * Obtiene información del usuario actual
     * @returns {Object|null}
     */
    obtenerInfoUsuario() {
        const sesion = this.obtenerSesionActual();
        if (!sesion) return null;

        const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
        return usuarios.find(u => u.email === sesion.email);
    },

    /**
     * Muestra/oculta elementos según el rol del usuario
     * Elementos con clase 'solo-admin' solo se muestran a administradores
     * Elementos con clase 'solo-residente' solo se muestran a residentes
     */
    aplicarPermisosUI() {
        const esAdmin = this.esAdministrador();

        // Ocultar elementos solo-admin si no es admin
        const elementosAdmin = document.querySelectorAll('.solo-admin');
        elementosAdmin.forEach(elemento => {
            if (esAdmin) {
                elemento.style.display = '';
                elemento.classList.remove('d-none');
            } else {
                elemento.style.display = 'none';
                elemento.classList.add('d-none');
            }
        });

        // Ocultar elementos solo-residente si es admin
        const elementosResidente = document.querySelectorAll('.solo-residente');
        elementosResidente.forEach(elemento => {
            if (!esAdmin) {
                elemento.style.display = '';
                elemento.classList.remove('d-none');
            } else {
                elemento.style.display = 'none';
                elemento.classList.add('d-none');
            }
        });

        console.log('Permisos UI aplicados. Es admin:', esAdmin);
    },

    /**
     * Inicializa el botón de cerrar sesión
     */
    inicializarBotonCerrarSesion() {
        const btnCerrarSesion = document.getElementById('btnCerrarSesion');
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener('click', (e) => {
                e.preventDefault();
                this.cerrarSesion();
            });
        }
    },

    /**
     * Actualiza el nombre del usuario en el navbar
     */
    actualizarNombreNavbar() {
        const sesion = this.obtenerSesionActual();
        if (!sesion) return;

        const nombreElementos = [
            document.getElementById('nombreAdmin'),
            document.getElementById('nombreUsuario'),
            document.querySelector('.navbar-nav .dropdown-toggle span')
        ];

        nombreElementos.forEach(elemento => {
            if (elemento) {
                elemento.textContent = sesion.nombre || 'Usuario';
            }
        });
    },

    /**
     * Inicialización completa del módulo de sesión
     */
    inicializar() {
        console.log('=== Inicializando SesionManager ===');
        this.verificarSesion();
        this.aplicarPermisosUI();
        this.inicializarBotonCerrarSesion();
        this.actualizarNombreNavbar();
        console.log('=== SesionManager inicializado ===');
    }
};

// Exportar para uso global
window.SesionManager = SesionManager;

console.log('✅ Módulo sesion.js cargado correctamente');
