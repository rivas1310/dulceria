"use client";
import { useState } from 'react';

interface Producto {
  id: number;
  name: string;
  price: number;
  claveSAT: string;
}

interface Concepto {
  productoId: number;
  cantidad: number;
  valorUnitario: number;
  descripcion: string;
  claveSAT: string;
}

interface ConceptosFormProps {
  productos: Producto[];
  conceptos: Concepto[];
  onChange: (conceptos: Concepto[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function ConceptosForm({
  productos,
  conceptos,
  onChange,
  onBack,
  onNext,
}: ConceptosFormProps) {
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);

  const agregarConcepto = () => {
    if (!productoSeleccionado) return;

    const producto = productos.find(p => p.id === Number(productoSeleccionado));
    if (!producto) return;

    const nuevoConcepto: Concepto = {
      productoId: producto.id,
      cantidad: cantidad,
      valorUnitario: producto.price,
      descripcion: producto.name,
      claveSAT: producto.claveSAT,
    };

    onChange([...conceptos, nuevoConcepto]);
    setProductoSeleccionado('');
    setCantidad(1);
  };

  const eliminarConcepto = (index: number) => {
    const nuevosConceptos = conceptos.filter((_, i) => i !== index);
    onChange(nuevosConceptos);
  };

  const calcularTotal = () => {
    return conceptos.reduce((total, concepto) => 
      total + (concepto.cantidad * concepto.valorUnitario), 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Producto
          </label>
          <select
            className="mt-1 block w-full rounded-md text-red-500 border-gray-300 shadow-sm"
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
          >
            <option value="">Seleccione un producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            className="mt-1 block w-full rounded-md text-red-500 border-gray-300 shadow-sm"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={agregarConcepto}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Lista de conceptos */}
      <div className="mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Precio Unitario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Importe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {conceptos.map((concepto, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-red-500 whitespace-nowrap">
                  {concepto.descripcion}
                </td>
                <td className="px-6 py-4 text-red-500 whitespace-nowrap">
                  {concepto.cantidad}
                </td>
                <td className="px-6 py-4 text-red-500 whitespace-nowrap">
                  ${concepto.valorUnitario.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-red-500 whitespace-nowrap">
                  ${(concepto.cantidad * concepto.valorUnitario).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-red-500 whitespace-nowrap">
                  <button
                    onClick={() => eliminarConcepto(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right text-red-500 font-medium">
                Total:
              </td>
              <td className="px-6 py-4 text-red-500 whitespace-nowrap font-medium">
                ${calcularTotal().toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={conceptos.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}