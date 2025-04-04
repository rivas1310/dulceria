"use client";
import { useState } from 'react';

export default function BusquedaFacturas() {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    rfc: '',
    estado: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de búsqueda
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md mb-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      
      {/* Fecha Inicio */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Fecha Inicio
        </label>
        <input
          type="date"
          required
          className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm px-3 py-2 text-gray-900"
          value={filtros.fechaInicio}
          onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
        />
      </div>
  
      {/* Fecha Fin */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Fecha Fin
        </label>
        <input
          type="date"
          required
          className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm px-3 py-2 text-gray-900"
          value={filtros.fechaFin}
          onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
        />
      </div>
  
      {/* RFC Cliente */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          RFC Cliente
        </label>
        <input
          type="text"
          placeholder="Ej. ABC123456789"
          className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm px-3 py-2 text-gray-900 uppercase"
          value={filtros.rfc}
          maxLength={13}
          onChange={(e) =>
            setFiltros({ ...filtros, rfc: e.target.value.toUpperCase() })
          }
        />
      </div>
  
      {/* Estado */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Estado
        </label>
        <input
          type="text"
          placeholder="Ej. Jalisco"
          className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm px-3 py-2 text-gray-900"
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
        />
      </div>
    </div>
  
    {/* Botón de enviar */}
    <div className="mt-6 text-right">
      <button
        type="submit"
        className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
      >
        Buscar
      </button>
    </div>
  </form>
  
  );
}