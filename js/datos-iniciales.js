// ===================================
// DATOS INICIALES DEL SISTEMA
// ===================================

/**
 * Inicializa los datos de prueba del sistema
 */
function inicializarDatosPrueba() {
    // Verificar si ya existen datos
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios');
    
    // Solo inicializar si no hay datos
    if (!usuarios || usuarios.length === 0) {
        console.log('Inicializando datos de prueba...');
        
        // USUARIOS DE PRUEBA - AHORA CON SISTEMA DE ROLES
        const usuariosPrueba = [
            {
                // ADMINISTRADOR - TAMBIÉN tiene casa asignada
                email: 'admin@comunes.cl',
                password: 'Admin123!',
                nombre: 'Administrador Principal',
                rut: '12345678-9',
                telefono: '987654321',
                pasaje: '8651',
                casa: 'A',  // Admin también tiene casa
                rol: 'administrador', // ROL define si es admin o residente
                tipo: 'administrador', // TIPO también debe ser administrador
                fechaRegistro: new Date().toISOString()
            },
            {
                // RESIDENTE NORMAL
                email: 'usuario@comunes.cl',
                password: 'User123!',
                nombre: 'Juan Pérez Soto',
                rut: '98765432-1',
                telefono: '912345678',
                pasaje: '8651',
                casa: 'B',
                rol: 'residente', // ROL residente
                tipo: 'residente', // TIPO residente
                fechaRegistro: new Date().toISOString()
            },
            {
                // RESIDENTE 2
                email: 'maria@comunes.cl',
                password: 'Maria123!',
                nombre: 'María González López',
                rut: '11222333-4',
                telefono: '923456789',
                pasaje: '8651',
                casa: 'C',
                rol: 'residente',
                tipo: 'residente',
                fechaRegistro: new Date().toISOString()
            },
            {
                // RESIDENTE 3
                email: 'pedro@comunes.cl',
                password: 'Pedro123!',
                nombre: 'Pedro Ramírez Castro',
                rut: '22333444-5',
                telefono: '934567890',
                pasaje: '8707',
                casa: 'A',
                rol: 'residente',
                tipo: 'residente',
                fechaRegistro: new Date().toISOString()
            },
            {
                // RESIDENTE 4
                email: 'ana@comunes.cl',
                password: 'Ana123!',
                nombre: 'Ana Martínez Silva',
                rut: '33444555-6',
                telefono: '945678901',
                pasaje: '8707',
                casa: 'B',
                rol: 'residente',
                tipo: 'residente',
                fechaRegistro: new Date().toISOString()
            }
        ];
        
        // Guardar usuarios
        window.validacionesComunes.guardarEnStorage('usuarios', usuariosPrueba);
        console.log('Usuarios de prueba creados:', usuariosPrueba.length);
        
        // GASTOS COMUNES DE PRUEBA
        const gastosPrueba = [
            {
                id: 1,
                concepto: 'Mantención de Áreas Verdes',
                categoria: 'Jardinería',
                monto: 65000,
                fecha: '2025-11-01',
                descripcion: 'Poda y mantención mensual de jardines comunes',
                estado: 'aprobado',
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 2,
                concepto: 'Luz de Áreas Comunes',
                categoria: 'Servicios Básicos',
                monto: 48000,
                fecha: '2025-11-01',
                descripcion: 'Consumo eléctrico de pasillos y zonas comunes',
                estado: 'aprobado',
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 3,
                concepto: 'Agua Potable',
                categoria: 'Servicios Básicos',
                monto: 32000,
                fecha: '2025-11-01',
                descripcion: 'Consumo de agua de áreas comunes',
                estado: 'aprobado',
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 4,
                concepto: 'Seguridad',
                categoria: 'Seguridad',
                monto: 120000,
                fecha: '2025-11-01',
                descripcion: 'Servicio de vigilancia nocturna',
                estado: 'aprobado',
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 5,
                concepto: 'Limpieza de Áreas Comunes',
                categoria: 'Limpieza',
                monto: 75000,
                fecha: '2025-11-01',
                descripcion: 'Servicio de aseo de pasillos y estacionamientos',
                estado: 'aprobado',
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 6,
                concepto: 'Gas Común',
                categoria: 'Servicios Básicos',
                monto: 28000,
                fecha: '2025-11-01',
                descripcion: 'Consumo de gas de áreas comunes',
                estado: 'aprobado',
                fechaCreacion: new Date().toISOString()
            }
        ];
        
        window.validacionesComunes.guardarEnStorage('gastos', gastosPrueba);
        console.log('Gastos de prueba creados:', gastosPrueba.length);
        
        // PAGOS DE PRUEBA (algunos residentes ya pagaron)
        const pagosPrueba = [
            {
                id: 1,
                email: 'maria@comunes.cl',
                pasaje: '8651',
                casa: 'C',
                monto: 28308, // Total dividido por 13 casas
                mes: '2025-10',
                fechaPago: '2025-10-15T14:30:00',
                metodoPago: 'transferencia',
                comprobante: 'TRF-20251015-001',
                estado: 'confirmado',
                registradoPor: 'admin@comunes.cl'
            },
            {
                id: 2,
                email: 'pedro@comunes.cl',
                pasaje: '8707',
                casa: 'A',
                monto: 28308,
                mes: '2025-10',
                fechaPago: '2025-10-20T10:15:00',
                metodoPago: 'efectivo',
                comprobante: 'EFE-20251020-001',
                estado: 'confirmado',
                registradoPor: 'admin@comunes.cl'
            }
        ];
        
        window.validacionesComunes.guardarEnStorage('pagos', pagosPrueba);
        console.log('Pagos de prueba creados:', pagosPrueba.length);
        
        console.log('✅ Datos de prueba inicializados correctamente');
        console.log('👤 Usuarios:', usuariosPrueba.length);
        console.log('💰 Gastos:', gastosPrueba.length);
        console.log('💳 Pagos:', pagosPrueba.length);
        console.log('\n📋 CREDENCIALES DE PRUEBA:');
        console.log('👨‍💼 Admin: admin@comunes.cl / Admin123! (Casa 8651-A)');
        console.log('👤 Usuario: usuario@comunes.cl / User123! (Casa 8651-B)');
    } else {
        console.log('✓ Los datos ya existen. No se sobrescriben.');
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarDatosPrueba();
});

// Función para resetear datos (útil para pruebas)
window.resetearDatosPrueba = function() {
    if (confirm('¿Estás seguro de que deseas ELIMINAR todos los datos y reiniciar?\n\nEsto cerrará tu sesión actual.')) {
        localStorage.clear();
        alert('✅ Datos eliminados. La página se recargará.');
        window.location.reload();
    }
};

// Función para ver datos actuales (debugging)
window.verDatos = function() {
    const usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    const gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
    const pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    console.log('=== DATOS ACTUALES DEL SISTEMA ===');
    console.log('👥 Usuarios:', usuarios);
    console.log('💰 Gastos:', gastos);
    console.log('💳 Pagos:', pagos);
    console.log('🔐 Sesión actual:', sesion);
    console.log('==================================');
    
    return {
        usuarios,
        gastos,
        pagos,
        sesion
    };
};
