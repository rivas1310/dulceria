"use client";
import { REGIMENES_FISCALES, USOS_CFDI } from '@/lib/constants';

interface ReceptorFormProps {
  datos: {
    rfc: string;
    nombre: string;
    codigoPostal: string;
    regimenFiscal: string;
    usoCFDI: string;
  };
  onChange: (datos: any) => void;
  onNext: () => void;
}

export default function ReceptorForm({ datos, onChange, onNext }: ReceptorFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            RFC
          </label>
          <input
            type="text"
            required
            placeholder="Ej. ABC123456XYZ"
            className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm px-4 py-2 text-gray-900 placeholder-gray-400 uppercase transition duration-150 ease-in-out"
            value={datos.rfc}
            onChange={(e) =>
              onChange({ ...datos, rfc: e.target.value.toUpperCase() })
            }
            maxLength={13}
          />
        </div>

      
                <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Nombre o Razón Social
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Pérez S.A. de C.V."
              className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm px-4 py-2 text-gray-900 placeholder-gray-400 transition duration-150 ease-in-out"
              value={datos.nombre}
              onChange={(e) => onChange({ ...datos, nombre: e.target.value })}
            />
            </div>

            <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Código Postal
            </label>
            <input
              type="text"
              required
              placeholder="Ej. 01000"
              className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm px-4 py-2 text-gray-900 placeholder-gray-400 transition duration-150 ease-in-out"
              value={datos.codigoPostal}
              onChange={(e) =>
                onChange({ ...datos, codigoPostal: e.target.value })
              }
              maxLength={5}
            />
          </div>

      
          <div className="mb-4">
  <label className="block text-sm font-semibold text-gray-800 mb-1">
    Régimen Fiscal
  </label>
  <select
    required
    className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm px-4 py-2 text-gray-900 bg-white transition duration-150 ease-in-out"
    value={datos.regimenFiscal}
    onChange={(e) => onChange({ ...datos, regimenFiscal: e.target.value })}
  >
    <option value="">Seleccione un régimen</option>
    {Object.entries(REGIMENES_FISCALES).map(([clave, descripcion]) => (
      <option key={clave} value={clave}>
        {clave} - {descripcion}
      </option>
    ))}
  </select>
</div>

<div className="mb-4">
  <label className="block text-sm font-semibold text-gray-800 mb-1">
    Uso del CFDI
  </label>
  <select
    required
    className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm px-4 py-2 text-gray-900 bg-white transition duration-150 ease-in-out"
    value={datos.usoCFDI}
    onChange={(e) => onChange({ ...datos, usoCfdi: e.target.value })}
  >
    <option value="">Seleccione un uso</option>
    {Object.entries(USOS_CFDI).map(([clave, descripcion]) => (
      <option key={clave} value={clave}>
        {clave} - {descripcion}
      </option>
    ))}
  </select>
</div>


      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Siguiente
        </button>
      </div>
    </form>
  );
}