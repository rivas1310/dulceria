"use client";

interface ResumenFacturaProps {
  datosReceptor: {
    rfc: string;
    nombre: string;
    codigoPostal: string;
    regimenFiscal: string;
    usoCFDI: string;
  };
  conceptos: Array<{
    descripcion: string;
    cantidad: number;
    valorUnitario: number;
  }>;
  onBack: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export default function ResumenFactura({
  datosReceptor,
  conceptos,
  onBack,
  onSubmit,
  isLoading = false,
}: ResumenFacturaProps) {
  const subtotal = conceptos.reduce(
    (total, concepto) => total + concepto.cantidad * concepto.valorUnitario,
    0
  );
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return (
    <div className="space-y-6 text-red-500">
      <div className="bg-gray-50 p-4 text-red-500 rounded-lg">
        <h3 className="text-lg font-medium text-red-500 mb-4">Datos del Receptor</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">RFC</p>
            <p className="font-medium text-red-500">{datosReceptor.rfc}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="font-medium text-red-500">{datosReceptor.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Código Postal</p>
            <p className="font-medium text-red-500">{datosReceptor.codigoPostal}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Régimen Fiscal</p>
            <p className="font-medium text-red-500">{datosReceptor.regimenFiscal}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Uso CFDI</p>
            <p className="font-medium text-red-500">{datosReceptor.usoCFDI}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-red-500 mb-4">Conceptos</h3>
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="pb-2">Descripción</th>
              <th className="pb-2">Cantidad</th>
              <th className="pb-2">Precio Unitario</th>
              <th className="pb-2">Importe</th>
            </tr>
          </thead>
          <tbody>
            {conceptos.map((concepto, index) => (
              <tr key={index}>
                <td className="py-2 text-red-500">{concepto.descripcion}</td>
                <td className="py-2 text-red-500">{concepto.cantidad}</td>
                <td className="py-2 text-red-500">${concepto.valorUnitario.toFixed(2)}</td>
                <td className="py-2 text-red-500">
                  ${(concepto.cantidad * concepto.valorUnitario).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-red-500 mb-4">Totales</h3>
        <div className="space-y-2">
          <div className="flex text-red-500 justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex text-red-500 justify-between">
            <span>IVA (16%):</span>
            <span>${iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-500 text-lg font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Generando...' : 'Generar Factura'}
        </button>
      </div>
    </div>
  );
}