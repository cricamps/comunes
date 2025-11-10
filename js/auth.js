// ===================================
// AUTH.JS - Autenticación (login y logout)
// ===================================

/**
 * Módulo de autenticación
 * Maneja el login y logout de usuarios
 */

const AuthManager = {
    /**
     * Procesa el login del usuario
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @param {boolean} rememberMe - Recordar sesión
     * @returns {Promise<Object>} Resultado del login
     */
    async procesarLogin(email, password, rememberMe = false) {
        return new Promise((resolve, reject) => {
            // Simular proceso de autenticación
            setTimeout(() => {
                // Buscar usuario en localStorage
                const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
                const usuario = usuarios.find(u => u.email === email);
                
                // Verificar si existe el usuario
                if (!usuario) {
                    reject({
                        tipo: 'error',
                        mensaje: 'No existe una cuenta con este correo electrónico.',
                        detalles: 'Usuarios de prueba:<br>Admin: admin@comunes.cl / Admin123!<br>Usuario: usuario@comunes.cl / User123!'
                    });
                    return;
                }
                
                // Verificar contraseña
                if (usuario.password !== password) {
                    reject({
                        tipo: 'error',
                        mensaje: 'Contraseña incorrecta. Por favor verifica tus credenciales.'
                    });
                    return;
                }
                
                // Determinar tipo de usuario según el rol
                let tipoUsuario = 'residente';
                
                if (usuario.rol) {
                    tipoUsuario = usuario.rol;
                } else if (usuario.tipo) {
                    tipoUsuario = usuario.tipo;
                }
                
                console.log('Usuario encontrado:', usuario.nombre);
                console.log('Rol del usuario:', usuario.rol);
                console.log('Tipo asignado:', tipoUsuario);
                
                // Crear sesión
                const sesion = {
                    email: email,
                    tipo: tipoUsuario,
                    rol: tipoUsuario,
                    nombre: usuario.nombre,
                    casa: usuario.casa || null,
                    pasaje: usuario.pasaje || null,
                    fechaLogin: new Date().toISOString()
                };
                
                console.log('Sesión creada:', sesion);
                
                // Guardar sesión
                window.validacionesComunes.guardarEnStorage('sesionActual', sesion);
                
                if (rememberMe) {
                    window.validacionesComunes.guardarEnStorage('recordarSesion', true);
                }
                
                resolve({
                    tipo: 'success',
                    mensaje: `✅ ¡Bienvenido/a ${usuario.nombre}!`,
                    usuario: sesion
                });
                
            }, 1000);
        });
    },

    /**
     * Cierra la sesión actual
     */
    logout() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            window.validacionesComunes.eliminarDeStorage('sesionActual');
            window.validacionesComunes.eliminarDeStorage('recordarSesion');
            console.log('Sesión cerrada correctamente');
            
            // Redirigir al login
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 500);
        }
    },

    /**
     * Verifica si ya hay una sesión activa al cargar la página
     */
    verificarSesionActiva() {
        const sesionActual = window.validacionesComunes.obtenerDeStorage('sesionActual');
        
        if (sesionActual) {
            console.log('Sesión activa detectada:', sesionActual);
            console.log('Tipo de usuario:', sesionActual.tipo);
            console.log('Redirigiendo a dashboard correspondiente...');
            
            // Redirigir según el tipo de usuario
            if (sesionActual.tipo === 'administrador') {
                window.location.href = 'vista_admin/dashboard-admin.html';
            } else {
                window.location.href = 'vista_usuario/dashboard-usuario.html';
            }
            return true;
        }
        
        return false;
    },

    /**
     * Inicializa el formulario de login
     */
    inicializarFormularioLogin() {
        const formLogin = document.getElementById('formLogin');
        
        if (!formLogin) {
            console.warn('No se encontró el formulario de login');
            return;
        }

        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validar formulario
            if (!this.validarFormularioLogin()) {
                return;
            }

            // Obtener datos
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Mostrar loading
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerHTML;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';
            
            try {
                const resultado = await this.procesarLogin(email, password, rememberMe);
                
                // Mostrar mensaje de éxito
                window.validacionesComunes.mostrarAlerta('success', resultado.mensaje, 'main');
                
                // Redirigir según el tipo de usuario
                setTimeout(() => {
                    console.log('Redirigiendo a dashboard...');
                    console.log('Tipo de usuario:', resultado.usuario.tipo);
                    
                    if (resultado.usuario.tipo === 'administrador') {
                        console.log('→ Dashboard Administrador');
                        window.location.href = 'vista_admin/dashboard-admin.html';
                    } else {
                        console.log('→ Dashboard Usuario');
                        window.location.href = 'vista_usuario/dashboard-usuario.html';
                    }
                }, 1500);
                
            } catch (error) {
                // Restaurar botón
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = textoOriginal;
                
                // Mostrar error
                window.validacionesComunes.mostrarAlerta('danger', error.mensaje, 'main');
            }
        });
    },

    /**
     * Valida el formulario de login
     */
    validarFormularioLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        let esValido = true;

        // Validar email
        if (email === '') {
            window.validacionesComunes.mostrarError('email', 'El correo electrónico es obligatorio');
            esValido = false;
        } else if (!window.validacionesComunes.validarEmail(email)) {
            window.validacionesComunes.mostrarError('email', 'Ingresa un correo electrónico válido');
            esValido = false;
        } else {
            window.validacionesComunes.mostrarExito('email');
        }

        // Validar password
        if (password === '') {
            window.validacionesComunes.mostrarError('password', 'La contraseña es obligatoria');
            esValido = false;
        } else if (password.length < 4) {
            window.validacionesComunes.mostrarError('password', 'La contraseña debe tener al menos 4 caracteres');
            esValido = false;
        } else {
            window.validacionesComunes.mostrarExito('password');
        }

        return esValido;
    }
};

// Exportar para uso global
window.AuthManager = AuthManager;

console.log('✅ Módulo auth.js cargado correctamente - Versión con redirección por rol');
