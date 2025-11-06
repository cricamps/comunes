// ===================================
// REGISTRAR PAGOS - ADMIN
// ===================================

let sesionActual = null;
let usuarios = [];
let gastos = [];
let pagos = [];

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    verificarAutenticacion();
    
    // Cargar datos
    cargarDatos();
    
    // Inicializar
    cargarResidentes();
    calcularMontoSugerido();
    cargarPagosRecientes();
    
    // Establecer fecha actual
    const ahora = new Date();
    document.getElementById('fechaPago').value = ahora.toISOString().slice(0, 16);
    
    // Establecer mes actual
    document.getElementById('mes').value = ahora.toISOString().slice(0, 7);
    
    // Event listeners
    document.getElementById('formRegistrarPago').addEventListener('submit', registrarPago);
    document.getElementById('mes').addEventListener('change', calcularMontoSugerido);
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    
    // Actualizar nombre de usuario
    if (sesionActual) {
        document.getElementById('nombreUsuario').textContent = sesionActual.nombre;
    }
});

/**
 * Verifica que el usuario esté autenticado y sea administrador
 */
function verificarAutenticacion() {
    sesionActual = window.validacionesComunes.obtenerDeStorage('sesionActual');
    
    if (!sesionActual) {
        window.location.href = '../login.html';
        return;
    }
    
    if (sesionActual.tipo !== 'administrador') {
        window.location.href = '../vista_usuario/dashboard-usuario.html';
        return;
    }
}

/**
 * Carga los datos desde localStorage
 */
function cargarDatos() {
    usuarios = window.validacionesComunes.obtenerDeStorage('usuarios') || [];
    gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
    pagos = window.validacionesComunes.obtenerDeStorage('pagos') || [];
}

/**
 * Carga los residentes en el select
 */
function cargarResidentes() {
    const selectResidente = document.getElementById('residente');
    selectResidente.innerHTML = '<option value="">Seleccione un residente...</option>';
    
    // Filtrar solo residentes (no administradores)
    const residentes = usuarios.filter(u => u.pasaje && u.casa);
    
    residentes.forEach(residente => {
        const option = document.createElement('option');
        option.value = residente.email;
        option.textContent = `${residente.nombre} - Pasaje ${residente.pasaje}, Casa ${residente.casa}`;
        option.dataset.pasaje = residente.pasaje;
        option.dataset.casa = residente.casa;
        selectResidente.appendChild(option);
    });
}

/**
 * Calcula el monto sugerido según el mes seleccionado
 */
function calcularMontoSugerido() {
    const mesSeleccionado = document.getElementById('mes').value;
    
    if (!mesSeleccionado) {
        document.getElementById('montoSugerido').textContent = '$0';
        document.getElementById('totalGastosMes').textContent = '$0';
        document.getElementById('montoPorCasa').textContent = '$0';
        return;
    }
    
    // Obtener gastos del mes seleccionado
    const [año, mes] = mesSeleccionado.split('-');
    
    const gastosDelMes = gastos.filter(g => {
        const fechaGasto = new Date(g.fecha);
        return fechaGasto.getFullYear() === parseInt(año) && 
               (fechaGasto.getMonth() + 1) === parseInt(mes);
    });
    
    const totalGastos = gastosDelMes.reduce((sum, g) => sum + g.monto, 0);
    const montoPorCasa = Math.round(totalGastos / 13); // 13 casas en total
    
    document.getElementById('totalGastosMes').textContent = `$${totalGastos.toLocaleString('es-CL')}`;
    document.getElementById('montoPorCasa').textContent = `$${montoPorCasa.toLocaleString('es-CL')}`;
    document.getElementById('montoSugerido').textContent = `$${montoPorCasa.toLocaleString('es-CL')}`;
    document.getElementById('monto').value = montoPorCasa;
    
    // Calcular total pagado y pendiente
    const pagosDelMes = pagos.filter(p => p.mes === mesSeleccionado && p.estado === 'confirmado');
    const totalPagado = pagosDelMes.reduce((sum, p) => sum + p.monto, 0);
    const pendiente = totalGastos - totalPagado;
    
    document.getElementById('totalPagado').textContent = `$${totalPagado.toLocaleString('es-CL')}`;
    document.getElementById('pendientePorCobrar').textContent = `$${pendiente.toLocaleString('es-CL')}`;
}

/**
 * Registra un nuevo pago
 */
function registrarPago(e) {
    e.preventDefault();
    
    // Obtener valores
    const residenteEmail = document.getElementById('residente').value;
    const mes = document.getElementById('mes').value;
    const monto = parseInt(document.getElementById('monto').value);
    const fechaPago = document.getElementById('fechaPago').value;
    const metodoPago = document.getElementById('metodoPago').value;
    const comprobante = document.getElementById('comprobante').value.trim();
    const observaciones = document.getElementById('observaciones').value.trim();
    
    // Validaciones
    if (!residenteEmail) {
        mostrarError('residente', 'Debe seleccionar un residente');
        return;
    }
    
    if (!mes) {
        mostrarError('mes', 'Debe seleccionar el mes de pago');
        return;
    }
    
    if (!monto || monto <= 0) {
        mostrarError('monto', 'El monto debe ser mayor a 0');
        return;
    }
    
    if (!fechaPago) {
        mostrarError('fechaPago', 'Debe ingresar la fecha de pago');
        return;
    }
    
    if (!metodoPago) {
        mostrarError('metodoPago', 'Debe seleccionar el método de pago');
        return;
    }
    
    // Verificar si ya existe un pago para este residente en este mes
    const pagoExistente = pagos.find(p => 
        p.email === residenteEmail && 
        p.mes === mes && 
        p.estado === 'confirmado'
    );
    
    if (pagoExistente) {
        if (!confirm(`Ya existe un pago registrado para este residente en ${mes}.\n¿Desea registrar un pago adicional?`)) {
            return;
        }
    }
    
    // Obtener datos del residente
    const residente = usuarios.find(u => u.email === residenteEmail);
    
    // Crear nuevo pago
    const nuevoPago = {
        id: pagos.length > 0 ? Math.max(...pagos.map(p => p.id)) + 1 : 1,
        email: residenteEmail,
        pasaje: residente.pasaje,
        casa: residente.casa,
        monto: monto,
        mes: mes,
        fechaPago: fechaPago,
        metodoPago: metodoPago,
        comprobante: comprobante || `${metodoPago.toUpperCase().substring(0, 3)}-${Date.now()}`,
        observaciones: observaciones,
        estado: 'confirmado',
        registradoPor: sesionActual.email,
        fechaRegistro: new Date().toISOString()
    };
    
    // Guardar
    pagos.push(nuevoPago);
    window.validacionesComunes.guardarEnStorage('pagos', pagos);
    
    // Mostrar éxito
    window.validacionesComunes.mostrarAlerta('success', 
        `✅ Pago registrado exitosamente para ${residente.nombre}`, 
        'main');
    
    // Limpiar formulario
    document.getElementById('formRegistrarPago').reset();
    
    // Recargar datos
    cargarDatos();
    calcularMontoSugerido();
    cargarPagosRecientes();
}

/**
 * Carga los pagos recientes en la tabla
 */
function cargarPagosRecientes() {
    const tbody = document.getElementById('tablaPagos');
    
    if (pagos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    No hay pagos registrados
                </td>
            </tr>
        `;
        document.getElementById('cantidadPagos').textContent = '0';
        return;
    }
    
    // Ordenar por fecha de registro (más recientes primero)
    const pagosOrdenados = [...pagos].sort((a, b) => 
        new Date(b.fechaRegistro) - new Date(a.fechaRegistro)
    );
    
    tbody.innerHTML = '';
    
    pagosOrdenados.slice(0, 10).forEach(pago => {
        const residente = usuarios.find(u => u.email === pago.email);
        const nombreResidente = residente ? residente.nombre : pago.email;
        
        const fechaPago = new Date(pago.fechaPago);
        const fechaFormateada = fechaPago.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const metodoBadge = {
            'efectivo': 'success',
            'transferencia': 'primary',
            'deposito': 'info',
            'cheque': 'warning'
        };
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${nombreResidente}</td>
            <td><span class="badge bg-secondary">${pago.pasaje}-${pago.casa}</span></td>
            <td>${pago.mes}</td>
            <td class="fw-bold text-success">$${pago.monto.toLocaleString('es-CL')}</td>
            <td><span class="badge bg-${metodoBadge[pago.metodoPago] || 'secondary'}">${pago.metodoPago}</span></td>
            <td><small>${fechaFormateada}</small></td>
            <td><small>${pago.registradoPor}</small></td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="eliminarPago(${pago.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    document.getElementById('cantidadPagos').textContent = pagos.length;
}

/**
 * Elimina un pago
 */
window.eliminarPago = function(id) {
    if (!confirm('¿Está seguro de eliminar este pago?\n\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    const index = pagos.findIndex(p => p.id === id);
    
    if (index !== -1) {
        pagos.splice(index, 1);
        window.validacionesComunes.guardarEnStorage('pagos', pagos);
        
        window.validacionesComunes.mostrarAlerta('success', 
            '✅ Pago eliminado correctamente', 
            'main');
        
        cargarDatos();
        calcularMontoSugerido();
        cargarPagosRecientes();
    }
};

/**
 * Muestra error en un campo
 */
function mostrarError(campoId, mensaje) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(`${campoId}Error`);
    
    if (campo && errorDiv) {
        campo.classList.add('is-invalid');
        errorDiv.textContent = mensaje;
    }
}

/**
 * Cierra la sesión
 */
function cerrarSesion(e) {
    e.preventDefault();
    
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        window.validacionesComunes.eliminarDeStorage('sesionActual');
        window.location.href = '../login.html';
    }
}
