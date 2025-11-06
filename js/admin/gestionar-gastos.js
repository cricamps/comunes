// ===================================
// GESTIONAR GASTOS
// ===================================

let gastos = [];
let gastoEditando = null;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    verificarSesionAdmin();
    cargarNombreAdmin();
    
    // Cargar gastos
    cargarGastos();
    
    // Event listeners
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    document.getElementById('btnGuardarGasto').addEventListener('click', guardarGasto);
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminarGasto);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Filtros
    document.getElementById('inputBuscar').addEventListener('input', aplicarFiltros);
    document.getElementById('selectCategoria').addEventListener('change', aplicarFiltros);
    document.getElementById('selectEstado').addEventListener('change', aplicarFiltros);
    
    // Calcular monto por casa automáticamente
    document.getElementById('monto').addEventListener('input', calcularMontoPorCasa);
    
    // Establecer fecha actual por defecto
    document.getElementById('fecha').valueAsDate = new Date();
    
    // Limpiar formulario al cerrar modal
    document.getElementById('modalNuevoGasto').addEventListener('hidden.bs.modal', limpiarFormulario);
});

function verificarSesionAdmin() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    if (!sesion || sesion.tipo !== 'administrador') {
        window.location.href = '../login.html';
    }
}

function cargarNombreAdmin() {
    const sesion = window.validacionesComunes.obtenerDeStorage('sesionActual');
    if (sesion) document.getElementById('nombreAdmin').textContent = sesion.nombre || 'Admin';
}

function cerrarSesion(e) {
    e.preventDefault();
    if (confirm('¿Cerrar sesión?')) {
        window.validacionesComunes.eliminarDeStorage('sesionActual');
        window.location.href = '../login.html';
    }
}

function cargarGastos() {
    gastos = window.validacionesComunes.obtenerDeStorage('gastos') || [];
    mostrarGastos(gastos);
}

function mostrarGastos(gastosAMostrar) {
    const tbody = document.getElementById('tablaGastos');
    
    if (gastosAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" class="text-center text-muted py-5">
                <i class="bi bi-inbox fs-3"></i>
                <p class="mt-3 mb-0">No hay gastos registrados</p>
                <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#modalNuevoGasto">
                    <i class="bi bi-plus-circle"></i> Agregar Primer Gasto
                </button>
            </td></tr>
        `;
        return;
    }
    
    tbody.innerHTML = gastosAMostrar.map(gasto => `
        <tr class="fade-in">
            <td><strong>#${gasto.id}</strong></td>
            <td>
                <strong>${gasto.concepto}</strong>
                ${gasto.descripcion ? `<br><small class="text-muted">${gasto.descripcion}</small>` : ''}
            </td>
            <td><span class="badge bg-info">${gasto.categoria}</span></td>
            <td class="text-success fw-bold">${formatearMoneda(gasto.monto)}</td>
            <td>${formatearFecha(gasto.fecha)}</td>
            <td><span class="badge ${obtenerClaseEstado(gasto.estado)}">${gasto.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarGasto(${gasto.id})" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarGasto(${gasto.id}, '${gasto.concepto}')" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function guardarGasto() {
    if (!validarFormulario()) return;
    
    const id = document.getElementById('gastoId').value;
    const gasto = {
        id: id ? parseInt(id) : Date.now(),
        concepto: document.getElementById('concepto').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim(),
        categoria: document.getElementById('categoria').value,
        monto: parseFloat(document.getElementById('monto').value),
        fecha: document.getElementById('fecha').value,
        estado: document.getElementById('estado').value
    };
    
    if (id) {
        const index = gastos.findIndex(g => g.id == id);
        gastos[index] = gasto;
    } else {
        gastos.push(gasto);
    }
    
    window.validacionesComunes.guardarEnStorage('gastos', gastos);
    window.validacionesComunes.mostrarAlerta('success', 
        id ? 'Gasto actualizado correctamente' : 'Gasto creado correctamente', 
        'main');
    
    bootstrap.Modal.getInstance(document.getElementById('modalNuevoGasto')).hide();
    cargarGastos();
}

function editarGasto(id) {
    const gasto = gastos.find(g => g.id === id);
    if (!gasto) return;
    
    document.getElementById('gastoId').value = gasto.id;
    document.getElementById('concepto').value = gasto.concepto;
    document.getElementById('descripcion').value = gasto.descripcion || '';
    document.getElementById('categoria').value = gasto.categoria;
    document.getElementById('monto').value = gasto.monto;
    document.getElementById('fecha').value = gasto.fecha;
    document.getElementById('estado').value = gasto.estado;
    document.getElementById('tituloModal').textContent = 'Editar Gasto';
    
    calcularMontoPorCasa();
    new bootstrap.Modal(document.getElementById('modalNuevoGasto')).show();
}

function eliminarGasto(id, concepto) {
    document.getElementById('idGastoEliminar').value = id;
    document.getElementById('nombreGastoEliminar').textContent = concepto;
    new bootstrap.Modal(document.getElementById('modalEliminarGasto')).show();
}

function confirmarEliminarGasto() {
    const id = parseInt(document.getElementById('idGastoEliminar').value);
    gastos = gastos.filter(g => g.id !== id);
    window.validacionesComunes.guardarEnStorage('gastos', gastos);
    
    bootstrap.Modal.getInstance(document.getElementById('modalEliminarGasto')).hide();
    window.validacionesComunes.mostrarAlerta('success', 'Gasto eliminado correctamente', 'main');
    cargarGastos();
}

function aplicarFiltros() {
    const buscar = document.getElementById('inputBuscar').value.toLowerCase();
    const categoria = document.getElementById('selectCategoria').value;
    const estado = document.getElementById('selectEstado').value;
    
    const gastosFiltrados = gastos.filter(g => {
        const coincideBuscar = g.concepto.toLowerCase().includes(buscar) || 
                              (g.descripcion && g.descripcion.toLowerCase().includes(buscar));
        const coincideCategoria = !categoria || g.categoria === categoria;
        const coincideEstado = !estado || g.estado === estado;
        
        return coincideBuscar && coincideCategoria && coincideEstado;
    });
    
    mostrarGastos(gastosFiltrados);
}

function limpiarFiltros() {
    document.getElementById('inputBuscar').value = '';
    document.getElementById('selectCategoria').value = '';
    document.getElementById('selectEstado').value = '';
    mostrarGastos(gastos);
}

function limpiarFormulario() {
    document.getElementById('formGasto').reset();
    document.getElementById('gastoId').value = '';
    document.getElementById('tituloModal').textContent = 'Nuevo Gasto Común';
    document.getElementById('montoPorCasa').value = '';
    document.getElementById('fecha').valueAsDate = new Date();
    
    ['concepto', 'categoria', 'monto', 'fecha'].forEach(id => {
        window.validacionesComunes.limpiarValidacion(id);
    });
}

function validarFormulario() {
    let valido = true;
    
    const concepto = document.getElementById('concepto').value.trim();
    if (!concepto) {
        window.validacionesComunes.mostrarError('concepto', 'El concepto es obligatorio');
        valido = false;
    } else {
        window.validacionesComunes.mostrarExito('concepto');
    }
    
    const categoria = document.getElementById('categoria').value;
    if (!categoria) {
        window.validacionesComunes.mostrarError('categoria', 'La categoría es obligatoria');
        valido = false;
    } else {
        window.validacionesComunes.mostrarExito('categoria');
    }
    
    const monto = document.getElementById('monto').value;
    if (!monto || parseFloat(monto) <= 0) {
        window.validacionesComunes.mostrarError('monto', 'El monto debe ser mayor a 0');
        valido = false;
    } else {
        window.validacionesComunes.mostrarExito('monto');
    }
    
    const fecha = document.getElementById('fecha').value;
    if (!fecha) {
        window.validacionesComunes.mostrarError('fecha', 'La fecha es obligatoria');
        valido = false;
    } else {
        window.validacionesComunes.mostrarExito('fecha');
    }
    
    return valido;
}

function calcularMontoPorCasa() {
    const monto = parseFloat(document.getElementById('monto').value) || 0;
    const montoPorCasa = monto / 13;
    document.getElementById('montoPorCasa').value = formatearMoneda(montoPorCasa);
}

function formatearMoneda(monto) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
}

function obtenerClaseEstado(estado) {
    return { 'Activo': 'bg-success', 'Pendiente': 'bg-warning', 'Pagado': 'bg-info', 'Vencido': 'bg-danger' }[estado] || 'bg-secondary';
}
