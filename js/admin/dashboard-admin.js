// ===================================
// DASHBOARD ADMINISTRADOR
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('\n============================================');
    console.log('     DASHBOARD CARGADO - INICIO');
    console.log('============================================\n');
    
    // Verificar sesión usando SesionManager
    if (window.SesionManager) {
        window.SesionManager.verificarSesion();
        window.SesionManager.actualizarNombreNavbar();
    }
    
    // Mostrar fecha actual
    mostrarFechaActual();
    
    // Cargar información personal (TODOS los usuarios)
    cargarMiInformacion();
    
    // OBTENER LA SESIÓN DIRECTAMENTE
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    console.log('\n=== INFORMACIÓN DE SESIÓN ===');
    console.log('Sesión completa:', sesion);
    
    if (sesion) {
        console.log('Email:', sesion.email);
        console.log('Nombre:', sesion.nombre);
        console.log('Tipo:', sesion.tipo);
        console.log('Rol:', sesion.rol);
        console.log('Casa:', sesion.pasaje, '-', sesion.casa);
    }
    
    // VERIFICAR SI ES ADMINISTRADOR - MÚLTIPLES MÉTODOS
    const esAdminMetodo1 = sesion && sesion.tipo === 'administrador';
    const esAdminMetodo2 = sesion && sesion.rol === 'administrador';
    const esAdminMetodo3 = window.SesionManager ? window.SesionManager.esAdministrador() : false;
    
    console.log('\n=== VERIFICACIÓN DE ROL ===');
    console.log('¿Es Admin? (tipo === "administrador"):', esAdminMetodo1);
    console.log('¿Es Admin? (rol === "administrador"):', esAdminMetodo2);
    console.log('¿Es Admin? (SesionManager):', esAdminMetodo3);
    
    // USAR CUALQUIER MÉTODO QUE RETORNE TRUE
    const esAdmin = esAdminMetodo1 || esAdminMetodo2 || esAdminMetodo3;
    
    console.log('\n=== DECISIÓN FINAL ===');
    console.log('✅ Usuario ES ADMINISTRADOR:', esAdmin);
    console.log('============================================\n');
    
    // MOSTRAR/OCULTAR SECCIÓN ADMINISTRATIVA
    const seccionAdmin = document.getElementById('seccionAdmin');
    
    if (!seccionAdmin) {
        console.error('❌ ERROR: No se encontró el elemento #seccionAdmin');
    } else {
        console.log('✅ Elemento #seccionAdmin encontrado');
    }
    
    if (esAdmin) {
        // ADMINISTRADOR: Ver TODO (personal + administrativa)
        console.log('\n👑 MODO ADMINISTRADOR ACTIVADO');
        console.log('   - Mostrando sección personal');
        console.log('   - Mostrando sección administrativa');
        
        if (seccionAdmin) {
            seccionAdmin.style.display = 'block';
            seccionAdmin.style.visibility = 'visible';
            seccionAdmin.classList.remove('d-none');
            console.log('   ✅ Sección administrativa VISIBLE');
        }
        
        // Cargar estadísticas administrativas
        console.log('   - Cargando estadísticas...');
        cargarEstadisticas();
        cargarGastosRecientes();
        cargarPagosRecientes();
        cargarDistribucionPasajes();
        console.log('   ✅ Estadísticas cargadas\n');
    } else {
        // RESIDENTE: Solo ver información personal
        console.log('\n👤 MODO RESIDENTE ACTIVADO');
        console.log('   - Mostrando sección personal');
        console.log('   - Ocultando sección administrativa');
        
        if (seccionAdmin) {
            seccionAdmin.style.display = 'none';
            seccionAdmin.style.visibility = 'hidden';
            seccionAdmin.classList.add('d-none');
            console.log('   ✅ Sección administrativa OCULTA\n');
        }
    }
    
    // Inicializar botón de cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion && window.SesionManager) {
        btnCerrarSesion.addEventListener('click', function(e) {
            e.preventDefault();
            window.SesionManager.cerrarSesion();
        });
    }
    
    // Inicializar datos de prueba si no existen
    inicializarDatosPrueba();
    
    console.log('============================================');
    console.log('     DASHBOARD CARGADO - FIN');
    console.log('============================================\n');
});

// ===================================
// VERIFICACIÓN DE SESIÓN
// ===================================

function verificarSesion() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    if (!sesion) {
        window.location.href = '../login.html';
        return;
    }
    
    console.log('Sesión activa:', sesion);
    console.log('Tipo de usuario:', sesion.tipo);
}

function cargarNombreUsuario() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    if (sesion) {
        const nombreElemento = document.getElementById('nombreAdmin');
        if (nombreElemento) {
            nombreElemento.textContent = sesion.nombre || 'Usuario';
        }
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        window.validacionesComunes.eliminarDeStorage('sesionActual');
        window.location.href = '../login.html';
    }
}

// ===================================
// INFORMACIÓN PERSONAL (TODOS)
// ===================================

function cargarMiInformacion() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    if (!sesion) return;
    
    // Buscar información del usuario
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const usuario = usuarios.find(u => u.email === sesion.email);
    
    if (usuario) {
        // Mostrar mi casa
        const miCasaElemento = document.getElementById('miCasa');
        if (miCasaElemento) {
            miCasaElemento.textContent = `Pasaje ${usuario.pasaje} - Casa ${usuario.casa}`;
        }
        
        // Calcular mi deuda
        const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
        const gastosAprobados = gastos.filter(g => g.estado === 'Activo' || g.estado === 'aprobado');
        const totalGastos = gastosAprobados.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        const montoPorCasa = Math.round(totalGastos / 13);
        
        const miDeudaElemento = document.getElementById('miDeuda');
        if (miDeudaElemento) {
            miDeudaElemento.textContent = formatearMoneda(montoPorCasa);
        }
        
        // Verificar último pago
        const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
        const misPagos = pagos.filter(p => p.email === sesion.email || 
                                            (p.pasaje === usuario.pasaje && p.casa === usuario.casa));
        
        const ultimoPagoElemento = document.getElementById('ultimoPago');
        const estadoPagoElemento = document.getElementById('estadoPago');
        
        if (misPagos.length > 0) {
            const ultimoPago = misPagos[misPagos.length - 1];
            const fecha = new Date(ultimoPago.fecha);
            if (ultimoPagoElemento) {
                ultimoPagoElemento.textContent = fecha.toLocaleDateString('es-CL');
            }
            if (estadoPagoElemento) {
                estadoPagoElemento.textContent = 'Al día';
                estadoPagoElemento.className = 'fs-5 text-success';
            }
        } else {
            if (ultimoPagoElemento) {
                ultimoPagoElemento.textContent = 'Sin pagos';
            }
            if (estadoPagoElemento) {
                estadoPagoElemento.textContent = 'Pendiente';
                estadoPagoElemento.className = 'fs-5 text-warning';
            }
        }
    }
}

// ===================================
// FUNCIONES DE CARGA DE DATOS
// ===================================

function mostrarFechaActual() {
    const fecha = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fecha.toLocaleDateString('es-CL', opciones);
    document.getElementById('fechaActual').textContent = fechaFormateada;
}

function cargarEstadisticas() {
    // Obtener datos de localStorage
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
    const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
    
    // Filtrar solo residentes (no administradores)
    const residentes = usuarios.filter(u => u.casa);
    
    // Total de residentes
    document.getElementById('totalResidentes').textContent = residentes.length;
    
    // Gastos del mes actual
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();
    
    const gastosMes = gastos.filter(g => {
        const fechaGasto = new Date(g.fecha);
        return fechaGasto.getMonth() === mesActual && fechaGasto.getFullYear() === añoActual;
    });
    
    const totalGastosMes = gastosMes.reduce((sum, g) => sum + parseFloat(g.monto), 0);
    document.getElementById('gastosMes').textContent = formatearMoneda(totalGastosMes);
    
    // Calcular pagos pendientes y realizados
    const totalCasas = 13;
    const gastosMesActual = gastosMes.length;
    const pagosMesActual = pagos.filter(p => {
        const fechaPago = new Date(p.fecha);
        return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === añoActual;
    }).length;
    
    const pagosPendientes = gastosMesActual > 0 ? totalCasas - pagosMesActual : 0;
    const pagosRealizados = pagosMesActual;
    
    document.getElementById('pagosPendientes').textContent = pagosPendientes;
    document.getElementById('pagosRealizados').textContent = pagosRealizados;
    
    // Actualizar badges de estado de pagos
    document.getElementById('badgePagosAlDia').textContent = pagosRealizados;
    document.getElementById('badgePagosPendientes').textContent = pagosPendientes;
    document.getElementById('badgePagosAtrasados').textContent = 0; // Implementar lógica de atrasos
}

function cargarGastosRecientes() {
    const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
    const tbody = document.getElementById('tablaGastosRecientes');
    
    if (gastos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-3"></i>
                    <p class="mb-0">No hay gastos registrados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Ordenar por fecha descendente y tomar los últimos 5
    const gastosRecientes = gastos
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);
    
    tbody.innerHTML = gastosRecientes.map(gasto => `
        <tr class="fade-in">
            <td><strong>${gasto.concepto}</strong></td>
            <td class="text-success fw-bold">${formatearMoneda(gasto.monto)}</td>
            <td>${formatearFecha(gasto.fecha)}</td>
            <td>
                <span class="badge ${obtenerClaseEstado(gasto.estado)}">
                    ${gasto.estado || 'Activo'}
                </span>
            </td>
        </tr>
    `).join('');
}

function cargarPagosRecientes() {
    const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const tbody = document.getElementById('tablaPagosRecientes');
    
    if (pagos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-3"></i>
                    <p class="mb-0">No hay pagos registrados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Ordenar por fecha descendente y tomar los últimos 5
    const pagosRecientes = pagos
        .sort((a, b) => new Date(b.fechaPago || b.fecha) - new Date(a.fechaPago || a.fecha))
        .slice(0, 5);
    
    tbody.innerHTML = pagosRecientes.map(pago => {
        // CORREGIDO: Buscar el nombre del residente de múltiples formas
        let nombreResidente = 'Residente';
        
        // Intento 1: Usar nombreResidente si existe en el pago
        if (pago.nombreResidente) {
            nombreResidente = pago.nombreResidente;
        } 
        // Intento 2: Buscar por email (más confiable)
        else if (pago.email) {
            const usuario = usuarios.find(u => u.email === pago.email);
            if (usuario && usuario.nombre) {
                nombreResidente = usuario.nombre;
            }
        }
        // Intento 3: Buscar por pasaje y casa como último recurso
        if (nombreResidente === 'Residente' && pago.pasaje && pago.casa) {
            const usuario = usuarios.find(u => 
                u.pasaje && u.casa && 
                u.pasaje === pago.pasaje && u.casa === pago.casa
            );
            if (usuario && usuario.nombre) {
                nombreResidente = usuario.nombre;
            }
        }
        
        return `
            <tr class="fade-in">
                <td><strong>${nombreResidente}</strong></td>
                <td>
                    <span class="badge bg-secondary">
                        Pasaje ${pago.pasaje}, Casa ${pago.casa}
                    </span>
                </td>
                <td class="text-success fw-bold">${formatearMoneda(pago.monto)}</td>
                <td>${formatearFecha(pago.fechaPago || pago.fecha)}</td>
            </tr>
        `;
    }).join('');
}

function cargarDistribucionPasajes() {
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const residentes = usuarios.filter(u => u.casa);
    
    // Contar residentes por pasaje
    const residentesPasaje8651 = residentes.filter(r => r.casa.pasaje === '8651').length;
    const residentesPasaje8707 = residentes.filter(r => r.casa.pasaje === '8707').length;
    const totalResidentes = residentes.length;
    
    // Actualizar números
    document.getElementById('residentesPasaje8651').textContent = residentesPasaje8651;
    document.getElementById('residentesPasaje8707').textContent = residentesPasaje8707;
    
    // Calcular porcentajes
    const porcentaje8651 = totalResidentes > 0 ? (residentesPasaje8651 / totalResidentes * 100).toFixed(0) : 0;
    const porcentaje8707 = totalResidentes > 0 ? (residentesPasaje8707 / totalResidentes * 100).toFixed(0) : 0;
    
    // Actualizar barras de progreso
    const progress8651 = document.getElementById('progressPasaje8651');
    const progress8707 = document.getElementById('progressPasaje8707');
    
    progress8651.style.width = porcentaje8651 + '%';
    progress8651.textContent = porcentaje8651 + '%';
    
    progress8707.style.width = porcentaje8707 + '%';
    progress8707.textContent = porcentaje8707 + '%';
}

// ===================================
// FUNCIONES DE UTILIDAD
// ===================================

function formatearMoneda(monto) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(monto);
}

function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function obtenerClaseEstado(estado) {
    const clases = {
        'Activo': 'bg-success',
        'Pendiente': 'bg-warning',
        'Pagado': 'bg-info',
        'Vencido': 'bg-danger'
    };
    return clases[estado] || 'bg-secondary';
}

// ===================================
// INICIALIZAR DATOS DE PRUEBA
// ===================================

function inicializarDatosPrueba() {
    // Verificar si ya existen datos
    let gastos = window.validacionesComunes.obtenerDeStorage('gastos');
    let pagos = window.validacionesComunes.obtenerDeStorage('pagos');
    
    // Si no existen gastos, crear datos de prueba
    if (!gastos || gastos.length === 0) {
        gastos = [
            {
                id: 1,
                concepto: 'Mantención Áreas Verdes',
                descripcion: 'Poda de árboles y mantención de jardines',
                monto: 350000,
                fecha: new Date(2025, 10, 1).toISOString(),
                estado: 'Activo',
                categoria: 'Mantención'
            },
            {
                id: 2,
                concepto: 'Cuenta de Agua',
                descripcion: 'Consumo de agua mes de noviembre',
                monto: 125000,
                fecha: new Date(2025, 10, 5).toISOString(),
                estado: 'Activo',
                categoria: 'Servicios Básicos'
            },
            {
                id: 3,
                concepto: 'Cuenta de Luz',
                descripcion: 'Consumo de electricidad áreas comunes',
                monto: 85000,
                fecha: new Date(2025, 10, 5).toISOString(),
                estado: 'Activo',
                categoria: 'Servicios Básicos'
            },
            {
                id: 4,
                concepto: 'Servicio de Seguridad',
                descripcion: 'Pago mensual servicio de guardia',
                monto: 450000,
                fecha: new Date(2025, 10, 1).toISOString(),
                estado: 'Activo',
                categoria: 'Seguridad'
            },
            {
                id: 5,
                concepto: 'Mantención Alumbrado',
                descripcion: 'Reparación de farolas exteriores',
                monto: 180000,
                fecha: new Date(2025, 9, 28).toISOString(),
                estado: 'Pagado',
                categoria: 'Mantención'
            }
        ];
        window.validacionesComunes.guardarEnStorage('gastos', gastos);
    }
    
    // Si no existen pagos, crear datos de prueba
    if (!pagos || pagos.length === 0) {
        pagos = [
            {
                id: 1,
                nombreResidente: 'Juan Pérez',
                email: 'juan.perez@email.com',
                pasaje: '8651',
                casa: 'A',
                monto: 95000,
                fecha: new Date(2025, 10, 2).toISOString(),
                fechaPago: new Date(2025, 10, 2).toISOString(),
                estado: 'confirmado',
                metodoPago: 'Transferencia'
            },
            {
                id: 2,
                nombreResidente: 'María González',
                email: 'maria.gonzalez@email.com',
                pasaje: '8651',
                casa: 'B',
                monto: 95000,
                fecha: new Date(2025, 10, 3).toISOString(),
                fechaPago: new Date(2025, 10, 3).toISOString(),
                estado: 'confirmado',
                metodoPago: 'Efectivo'
            },
            {
                id: 3,
                nombreResidente: 'Carlos Rojas',
                email: 'carlos.rojas@email.com',
                pasaje: '8707',
                casa: 'C',
                monto: 95000,
                fecha: new Date(2025, 10, 4).toISOString(),
                fechaPago: new Date(2025, 10, 4).toISOString(),
                estado: 'confirmado',
                metodoPago: 'Transferencia'
            }
        ];
        window.validacionesComunes.guardarEnStorage('pagos', pagos);
    }
    
    // Crear algunos residentes de prueba si no existen
    let usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const residentesExistentes = usuarios.filter(u => u.casa);
    
    if (residentesExistentes.length === 0) {
        const residentesPrueba = [
            {
                nombre: 'Juan Pérez López',
                rut: '12.345.678-9',
                email: 'juan.perez@email.com',
                telefono: '912345678',
                password: 'User123!',
                pasaje: '8651',
                casa: 'A',
                rol: 'residente',
                fechaRegistro: new Date().toISOString()
            },
            {
                nombre: 'María González Silva',
                rut: '13.456.789-0',
                email: 'maria.gonzalez@email.com',
                telefono: '923456789',
                password: 'User123!',
                pasaje: '8651',
                casa: 'B',
                rol: 'residente',
                fechaRegistro: new Date().toISOString()
            },
            {
                nombre: 'Carlos Rojas Muñoz',
                rut: '14.567.890-1',
                email: 'carlos.rojas@email.com',
                telefono: '934567890',
                password: 'User123!',
                pasaje: '8707',
                casa: 'C',
                rol: 'residente',
                fechaRegistro: new Date().toISOString()
            },
            {
                nombre: 'Ana Torres Vega',
                rut: '15.678.901-2',
                email: 'ana.torres@email.com',
                telefono: '945678901',
                password: 'User123!',
                pasaje: '8707',
                casa: 'D',
                rol: 'residente',
                fechaRegistro: new Date().toISOString()
            }
        ];
        
        usuarios = usuarios.concat(residentesPrueba);
        window.validacionesComunes.guardarEnStorage('usuarios', usuarios);
    }
}
