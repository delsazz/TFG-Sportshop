const placeholderProducts = [
  { id: 1, nombre: 'Polo Protección Civil', talla: 'S-XXL', precio: 25 },
  { id: 2, nombre: 'Pantalón intervención', talla: 'S-XXL', precio: 45 },
  { id: 3, nombre: 'Chaleco reflectante', talla: 'Única', precio: 18.5 },
  { id: 4, nombre: 'Botas de seguridad', talla: '36-46', precio: 65 },
  { id: 5, nombre: 'Chubasquero', talla: 'S-XXL', precio: 35 },
  { id: 6, nombre: 'Gorra Emergencias', talla: 'Única', precio: 12 },
];

function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = placeholderProducts.map(product => `
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div class="bg-gray-100 h-48 flex items-center justify-center">
                <span class="text-6xl">👕</span>
            </div>
            <div class="p-6">
                <h3 class="text-lg font-semibold text-gray-900">${product.nombre}</h3>
                <p class="text-sm text-gray-500 mt-1">Tallas: ${product.talla}</p>
                <div class="flex justify-between items-center mt-4">
                    <span class="text-2xl font-bold text-blue-600">${product.precio.toFixed(2)} €</span>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors cursor-pointer">Añadir</button>
                </div>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderProducts);
