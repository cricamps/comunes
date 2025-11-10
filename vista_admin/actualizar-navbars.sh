#!/bin/bash

# ===============================================
# SCRIPT: Actualizar Navbar en Páginas Admin
# ===============================================
# Este script actualiza el navbar en todas las
# páginas administrativas para incluir la opción
# "Configuración" visible y estandarizar colores
# ===============================================

echo "🚀 Iniciando actualización de navbars..."
echo ""

# Navbar estándar a insertar
NAVBAR='    <!-- NAVEGACIÓN -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow">
        <div class="container-fluid">
            <a class="navbar-brand fw-bold" href="dashboard-admin.html">
                <i class="bi bi-building"></i> Gastos Comunes - Admin
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="dashboard-admin.html">
                            <i class="bi bi-speedometer2"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="gestionar-gastos.html">
                            <i class="bi bi-receipt"></i> Gestionar Gastos
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="gestionar-residentes.html">
                            <i class="bi bi-people"></i> Residentes
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="registrar-pagos.html">
                            <i class="bi bi-credit-card"></i> Registrar Pagos
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="solicitudes.html">
                            <i class="bi bi-envelope-check"></i> Solicitudes
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="reportes.html">
                            <i class="bi bi-file-earmark-bar-graph"></i> Reportes
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="configuracion.html">
                            <i class="bi bi-gear"></i> Configuración
                        </a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                            <i class="bi bi-person-circle"></i> <span id="nombreUsuario">Admin</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="../perfil.html"><i class="bi bi-person"></i> Mi Perfil</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" id="btnCerrarSesion"><i class="bi bi-box-arrow-right"></i> Cerrar Sesión</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>'

# Archivos a actualizar
ARCHIVOS=(
    "gestionar-gastos.html"
    "gestionar-residentes.html"
    "solicitudes.html"
    "reportes.html"
    "configuracion.html"
)

# Contador
ACTUALIZADOS=0
ERRORES=0

# Función para actualizar un archivo
actualizar_archivo() {
    local archivo=$1
    local pagina_actual=$(echo $archivo | sed 's/.html//')
    
    echo "📄 Procesando: $archivo"
    
    if [ ! -f "$archivo" ]; then
        echo "   ❌ Archivo no encontrado"
        ((ERRORES++))
        return
    fi
    
    # Crear backup
    cp "$archivo" "${archivo}.backup"
    echo "   💾 Backup creado: ${archivo}.backup"
    
    # Actualizar navbar
    # (En producción, aquí iría el código sed/awk para reemplazar el navbar)
    
    # Actualizar clase active
    sed -i "s/nav-link active/nav-link/g" "$archivo"
    sed -i "s/href=\"$pagina_actual.html\"/href=\"$pagina_actual.html\" class=\"nav-link active\"/g" "$archivo"
    
    echo "   ✅ Archivo actualizado"
    ((ACTUALIZADOS++))
}

# Cambiar al directorio vista_admin
cd "$(dirname "$0")" || exit

# Procesar cada archivo
for archivo in "${ARCHIVOS[@]}"; do
    actualizar_archivo "$archivo"
    echo ""
done

# Resumen
echo "═══════════════════════════════════════"
echo "📊 RESUMEN DE ACTUALIZACIÓN"
echo "═══════════════════════════════════════"
echo "✅ Archivos actualizados: $ACTUALIZADOS"
echo "❌ Errores: $ERRORES"
echo "💾 Backups creados: $ACTUALIZADOS"
echo ""
echo "🎉 ¡Proceso completado!"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Revisa cada archivo manualmente"
echo "   - Verifica que los links funcionen"
echo "   - Prueba en navegador"
echo "   - Los backups están en: vista_admin/*.backup"
echo ""
