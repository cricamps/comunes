// ===================================
// REPORTES Y ESTADÍSTICAS - ADMIN
// ===================================

let sesionActual = null;
let usuarios = [];
let gastos = [];
let pagos = [];
let graficoTorta = null;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    verificarAutenticacion();
    
    // Cargar datos
    cargarDatos();
    
    // Cargar resumen financiero
    cargarResumenFinanciero();
    
    // Crear gráfico de torta
    crearGraficoTorta();
    
    // Event listeners
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    
    // Actualizar nombre de usuario
    if (sesionActual) {
        document.getElementById('nombreAdmin').textContent = sesionActual.nombre;
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
 * Carga el resumen financiero
 */
function cargarResumenFinanciero() {
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
    
    // Calcular total de gastos del mes
    const gastosDelMes = gastos.filter(g => {
        const fechaGasto = new Date(g.fecha);
        const mesGasto = `${fechaGasto.getFullYear()}-${String(fechaGasto.getMonth() + 1).padStart(2, '0')}`;
        return mesGasto === mesActual;
    });
    
    const totalGastos = gastosDelMes.reduce((sum, g) => sum + g.monto, 0);
    
    // Calcular total recaudado del mes
    const pagosDelMes = pagos.filter(p => p.mes === mesActual && p.estado === 'confirmado');
    const totalRecaudado = pagosDelMes.reduce((sum, p) => sum + p.monto, 0);
    
    // Calcular pendiente
    const pendiente = totalGastos - totalRecaudado;
    
    // Calcular balance
    const balance = totalRecaudado - totalGastos;
    
    // Actualizar UI
    document.getElementById('totalGastosMes').textContent = `$${totalGastos.toLocaleString('es-CL')}`;
    document.getElementById('totalRecaudado').textContent = `$${totalRecaudado.toLocaleString('es-CL')}`;
    document.getElementById('pendienteCobrar').textContent = `$${pendiente.toLocaleString('es-CL')}`;
    
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = `$${Math.abs(balance).toLocaleString('es-CL')}`;
    balanceElement.className = balance >= 0 ? 'fw-bold text-success' : 'fw-bold text-danger';
    
    // Calcular tasa de pago
    const totalResidentes = usuarios.filter(u => u.rol === 'residente').length;
    const residentesQuePagaron = pagosDelMes.length;
    const tasaPago = totalResidentes > 0 ? Math.round((residentesQuePagaron / totalResidentes) * 100) : 0;
    
    document.getElementById('tasaPago').textContent = `${tasaPago}%`;
    const progressBar = document.getElementById('progressTasaPago');
    progressBar.style.width = `${tasaPago}%`;
    progressBar.textContent = `${tasaPago}%`;
    
    // Cambiar color según el porcentaje
    progressBar.className = 'progress-bar';
    if (tasaPago >= 80) {
        progressBar.classList.add('bg-success');
    } else if (tasaPago >= 50) {
        progressBar.classList.add('bg-warning');
    } else {
        progressBar.classList.add('bg-danger');
    }
}

/**
 * Crea el gráfico de torta con gastos por categoría
 */
function crearGraficoTorta() {
    const ctx = document.getElementById('graficoGastos');
    
    // Agrupar gastos por categoría
    const gastosPorCategoria = {};
    
    gastos.forEach(gasto => {
        if (gastosPorCategoria[gasto.categoria]) {
            gastosPorCategoria[gasto.categoria] += gasto.monto;
        } else {
            gastosPorCategoria[gasto.categoria] = gasto.monto;
        }
    });
    
    // Preparar datos para el gráfico
    const categorias = Object.keys(gastosPorCategoria);
    const montos = Object.values(gastosPorCategoria);
    
    // Colores para el gráfico
    const colores = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#C9CBCF'
    ];
    
    // Crear gráfico
    if (graficoTorta) {
        graficoTorta.destroy();
    }
    
    graficoTorta = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categorias,
            datasets: [{
                data: montos,
                backgroundColor: colores.slice(0, categorias.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Distribución de Gastos por Categoría',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toLocaleString('es-CL')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ===================================
// FUNCIONES DE GENERACIÓN DE PDFs
// ===================================

/**
 * Genera el reporte de gastos en PDF
 */
window.generarReporteGastos = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('REPORTE DE GASTOS COMUNES', 105, 20, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const fecha = new Date().toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Fecha de generación: ${fecha}`, 105, 28, { align: 'center' });
    
    // Línea
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    // Resumen
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
    const gastosDelMes = gastos.filter(g => {
        const fechaGasto = new Date(g.fecha);
        const mesGasto = `${fechaGasto.getFullYear()}-${String(fechaGasto.getMonth() + 1).padStart(2, '0')}`;
        return mesGasto === mesActual;
    });
    
    const totalGastos = gastosDelMes.reduce((sum, g) => sum + g.monto, 0);
    const montoPorCasa = Math.round(totalGastos / 13);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN', 20, 42);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total de Gastos: $${totalGastos.toLocaleString('es-CL')}`, 20, 50);
    doc.text(`Cantidad de Gastos: ${gastosDelMes.length}`, 20, 56);
    doc.text(`Monto por Casa: $${montoPorCasa.toLocaleString('es-CL')}`, 20, 62);
    
    // Tabla de gastos
    const tablaDatos = gastosDelMes.map(g => [
        g.id,
        g.concepto,
        g.categoria,
        `$${g.monto.toLocaleString('es-CL')}`,
        new Date(g.fecha).toLocaleDateString('es-CL'),
        g.estado
    ]);
    
    doc.autoTable({
        startY: 70,
        head: [['ID', 'Concepto', 'Categoría', 'Monto', 'Fecha', 'Estado']],
        body: tablaDatos,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 50 },
            2: { cellWidth: 35 },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30 },
            5: { cellWidth: 25 }
        }
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
        doc.text('Sistema de Gastos Comunes', 105, 290, { align: 'center' });
    }
    
    // Descargar
    doc.save(`Reporte_Gastos_${mesActual}.pdf`);
    
    window.validacionesComunes.mostrarAlerta('success', 
        '✅ Reporte de Gastos generado correctamente', 
        'main');
};

/**
 * Genera el reporte de pagos en PDF
 */
window.generarReportePagos = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('REPORTE DE PAGOS', 105, 20, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const fecha = new Date().toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Fecha de generación: ${fecha}`, 105, 28, { align: 'center' });
    
    // Línea
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    // Resumen
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
    const pagosDelMes = pagos.filter(p => p.mes === mesActual && p.estado === 'confirmado');
    const totalRecaudado = pagosDelMes.reduce((sum, p) => sum + p.monto, 0);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN', 20, 42);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total Recaudado: $${totalRecaudado.toLocaleString('es-CL')}`, 20, 50);
    doc.text(`Cantidad de Pagos: ${pagosDelMes.length}`, 20, 56);
    
    // Tabla de pagos
    const tablaDatos = pagosDelMes.map(p => {
        const residente = usuarios.find(u => u.email === p.email);
        return [
            residente ? residente.nombre : p.email,
            `${p.pasaje}-${p.casa}`,
            `$${p.monto.toLocaleString('es-CL')}`,
            p.metodoPago,
            new Date(p.fechaPago).toLocaleDateString('es-CL'),
            p.comprobante || '-'
        ];
    });
    
    doc.autoTable({
        startY: 65,
        head: [['Residente', 'Casa', 'Monto', 'Método', 'Fecha Pago', 'Comprobante']],
        body: tablaDatos,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [46, 204, 113], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 20 },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 30 },
            4: { cellWidth: 30 },
            5: { cellWidth: 35 }
        }
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
        doc.text('Sistema de Gastos Comunes', 105, 290, { align: 'center' });
    }
    
    // Descargar
    doc.save(`Reporte_Pagos_${mesActual}.pdf`);
    
    window.validacionesComunes.mostrarAlerta('success', 
        '✅ Reporte de Pagos generado correctamente', 
        'main');
};

/**
 * Genera el reporte de residentes en PDF
 */
window.generarReporteResidentes = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('LISTA DE RESIDENTES', 105, 20, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const fecha = new Date().toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Fecha de generación: ${fecha}`, 105, 28, { align: 'center' });
    
    // Línea
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    // Resumen
    const residentes = usuarios.filter(u => u.pasaje && u.casa);
    const totalResidentes = residentes.length;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN', 20, 42);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total de Residentes: ${totalResidentes}`, 20, 50);
    doc.text(`Pasaje 8651: ${residentes.filter(r => r.pasaje === '8651').length} casas`, 20, 56);
    doc.text(`Pasaje 8707: ${residentes.filter(r => r.pasaje === '8707').length} casas`, 20, 62);
    
    // Tabla de residentes
    const tablaDatos = residentes.map(r => [
        r.nombre,
        r.rut,
        `${r.pasaje}-${r.casa}`,
        r.telefono,
        r.email,
        r.rol === 'administrador' ? 'Admin' : 'Residente'
    ]);
    
    doc.autoTable({
        startY: 70,
        head: [['Nombre', 'RUT', 'Casa', 'Teléfono', 'Email', 'Rol']],
        body: tablaDatos,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [52, 73, 94], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 25 },
            4: { cellWidth: 50 },
            5: { cellWidth: 25 }
        }
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
        doc.text('Sistema de Gastos Comunes', 105, 290, { align: 'center' });
    }
    
    // Descargar
    const fechaArchivo = new Date().toISOString().slice(0, 10);
    doc.save(`Lista_Residentes_${fechaArchivo}.pdf`);
    
    window.validacionesComunes.mostrarAlerta('success', 
        '✅ Lista de Residentes generada correctamente', 
        'main');
};

/**
 * Genera el reporte general en PDF
 */
window.generarReporteGeneral = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('REPORTE GENERAL', 105, 20, { align: 'center' });
    doc.text('Gastos Comunes', 105, 28, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const fecha = new Date().toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Fecha: ${fecha}`, 105, 36, { align: 'center' });
    
    // Línea
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    // Calcular datos
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
    
    const gastosDelMes = gastos.filter(g => {
        const fechaGasto = new Date(g.fecha);
        const mesGasto = `${fechaGasto.getFullYear()}-${String(fechaGasto.getMonth() + 1).padStart(2, '0')}`;
        return mesGasto === mesActual;
    });
    
    const totalGastos = gastosDelMes.reduce((sum, g) => sum + g.monto, 0);
    const pagosDelMes = pagos.filter(p => p.mes === mesActual && p.estado === 'confirmado');
    const totalRecaudado = pagosDelMes.reduce((sum, p) => sum + p.monto, 0);
    const pendiente = totalGastos - totalRecaudado;
    const residentes = usuarios.filter(u => u.pasaje && u.casa);
    const tasaPago = residentes.length > 0 ? Math.round((pagosDelMes.length / residentes.length) * 100) : 0;
    
    let yPos = 50;
    
    // Sección 1: Resumen Financiero
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('1. RESUMEN FINANCIERO', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Gastos del Mes: $${totalGastos.toLocaleString('es-CL')}`, 25, yPos);
    yPos += 6;
    doc.text(`Total Recaudado: $${totalRecaudado.toLocaleString('es-CL')}`, 25, yPos);
    yPos += 6;
    doc.text(`Pendiente por Cobrar: $${pendiente.toLocaleString('es-CL')}`, 25, yPos);
    yPos += 6;
    doc.text(`Tasa de Pago: ${tasaPago}%`, 25, yPos);
    yPos += 12;
    
    // Sección 2: Estadísticas Generales
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('2. ESTADÍSTICAS GENERALES', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total de Residentes: ${residentes.length}`, 25, yPos);
    yPos += 6;
    doc.text(`Cantidad de Gastos: ${gastosDelMes.length}`, 25, yPos);
    yPos += 6;
    doc.text(`Cantidad de Pagos: ${pagosDelMes.length}`, 25, yPos);
    yPos += 6;
    doc.text(`Monto por Casa: $${Math.round(totalGastos / 13).toLocaleString('es-CL')}`, 25, yPos);
    yPos += 12;
    
    // Sección 3: Gastos por Categoría
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('3. GASTOS POR CATEGORÍA', 20, yPos);
    yPos += 10;
    
    const gastosPorCategoria = {};
    gastosDelMes.forEach(g => {
        if (gastosPorCategoria[g.categoria]) {
            gastosPorCategoria[g.categoria] += g.monto;
        } else {
            gastosPorCategoria[g.categoria] = g.monto;
        }
    });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    Object.entries(gastosPorCategoria).forEach(([categoria, monto]) => {
        const porcentaje = ((monto / totalGastos) * 100).toFixed(1);
        doc.text(`${categoria}: $${monto.toLocaleString('es-CL')} (${porcentaje}%)`, 25, yPos);
        yPos += 6;
    });
    
    // Pie de página
    doc.setFontSize(8);
    doc.text('Sistema de Gastos Comunes - Reporte General', 105, 285, { align: 'center' });
    
    // Descargar
    doc.save(`Reporte_General_${mesActual}.pdf`);
    
    window.validacionesComunes.mostrarAlerta('success', 
        '✅ Reporte General generado correctamente', 
        'main');
};

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
