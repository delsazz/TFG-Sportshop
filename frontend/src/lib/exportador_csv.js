/**
 * Exporta datos a archivo CSV
 * @param data - Array de objetos a exportar
 * @param filename - Nombre del archivo (sin extension)
 * @param columns - Columnas opcionales a incluir
 */
export function exportToCSV(data, filename, columns) {
    if (data.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    const cols = columns || Object.keys(data[0]);
    const delimiter = ';';
    const header = cols.map((col) => `"${String(col)}"`).join(delimiter);
    const rows = data.map((row) => cols
        .map((col) => {
        const value = row[col];
        if (value === null || value === undefined) {
            return '""';
        }
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
    })
        .join(delimiter));
    const csv = ['sep=;', header, ...rows].join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
export function exportUsersToCSV(users) {
    const data = users.map((user) => ({
        ID: user.idUsuario,
        Nombre: user.nombre,
        Apellidos: user.apellidos,
        Email: user.email,
        Telefono: user.telefono || '-',
        Direccion: user.direccion || '-',
        Rol: user.roles?.map((r) => r.nombre).join('; ') || '-',
    }));
    exportToCSV(data, 'alumnos');
}
export function exportOrdersToCSV(orders) {
    const data = orders.map((order) => ({
        'ID Pedido': order.idPedido,
        Fecha: new Date(order.fechaPedido).toLocaleDateString('es-ES'),
        Cliente: order.usuario ? `${order.usuario.nombre} ${order.usuario.apellidos}` : 'Sin usuario',
        Email: order.usuario?.email || '-',
        Estado: order.estado,
        'Cantidad Articulos': order.totalLineas,
        'Total EUR': order.total.toFixed(2),
    }));
    exportToCSV(data, 'pedidos');
}
export function exportSalesStatsToCSV(stats) {
    const data = [
        { Metrica: 'Total de Ventas', Valor: `$${stats.totalVentas?.toFixed(2) || '0.00'}` },
        { Metrica: 'Total de Pedidos', Valor: stats.totalPedidos || 0 },
        { Metrica: 'Ticket Promedio', Valor: `$${stats.ticketPromedio?.toFixed(2) || '0.00'}` },
        { Metrica: 'Productos Vendidos', Valor: stats.productosVendidos || 0 },
        { Metrica: 'Clientes Activos', Valor: stats.clientesActivos || 0 },
        {
            Metrica: 'Distribucion por Estado',
            Valor: stats.distribucionEstado ? Object.entries(stats.distribucionEstado).map(([k, v]) => `${k}: ${v}`).join('; ') : '-',
        },
    ];
    exportToCSV(data, 'estadisticas_ventas', ['Metrica', 'Valor']);
}
export function exportInventoryToCSV(products) {
    const data = products.map((product) => ({
        'ID Producto': product.idProducto,
        Nombre: product.nombre,
        Categoria: product.categoria?.nombre || '-',
        Precio: `$${product.precio.toFixed(2)}`,
        Stock: product.stock || 0,
        Estado: product.stock > 0 ? 'En stock' : 'Sin stock',
    }));
    exportToCSV(data, 'inventario');
}
