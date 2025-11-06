# Script para actualizar menús de navegación en vista_admin
# Agrega el enlace "Registrar Pagos" entre Residentes y Reportes

# Archivos a actualizar
FILES=(
    "gestionar-gastos.html"
    "gestionar-residentes.html"
    "reportes.html"
)

MENU_ITEM='                    <li class="nav-item">
                        <a class="nav-link" href="registrar-pagos.html">
                            <i class="bi bi-credit-card"></i> Registrar Pagos
                        </a>
                    </li>'

for file in "${FILES[@]}"; do
    echo "Actualizando $file..."
done

echo "¡Listo!"
