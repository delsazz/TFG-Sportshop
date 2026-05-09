
import React from 'react'

const placeholderProducts = [
  { id: 1, nombre: 'Polo Protección Civil', talla: 'S-XXL', precio: 25 },
  { id: 2, nombre: 'Pantalón intervención', talla: 'S-XXL', precio: 45 },
  { id: 3, nombre: 'Chaleco reflectante', talla: 'Única', precio: 18.5 },
  { id: 4, nombre: 'Botas de seguridad', talla: '36-46', precio: 65 },
  { id: 5, nombre: 'Chubasquero', talla: 'S-XXL', precio: 35 },
  { id: 6, nombre: 'Gorra Emergencias', talla: 'Única', precio: 12 },
]

export default function Catalog() {
  // TODO: Reemplazar placeholderProducts con llamada a /api/catalogo
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de uniformes</h1>
        <p className="text-gray-600 mt-2">Selecciona las prendas que necesitas para tu ciclo formativo.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {placeholderProducts.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gray-100 h-48 flex items-center justify-center">
              <span className="text-6xl">👕</span>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">{product.nombre}</h3>
              <p className="text-sm text-gray-500 mt-1">Tallas: {product.talla}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-2xl font-bold text-blue-600">{product.precio.toFixed(2)} €</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors cursor-pointer">Añadir</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}