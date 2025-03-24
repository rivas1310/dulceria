// components/admin/facturacion/FacturaForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/src/lib/utils';

interface Cliente {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  nombre: string;
  precio: number;
}

interface FacturaItem {
  id?: string;
  productoId: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

interface FacturaData {
  id?: string;
  numero?: string;
  clienteId: string;
  ordenId?: string;
  items: FacturaItem[];
  notas: string;
  subtotal: number;
  impuesto: number;
  total: number;
}

export default function FacturaForm({ facturaId }: { facturaId?: string }) {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  
  const [factura, setFactura] = useState<FacturaData>({
    clienteId: '',
    items: [],
    notas: '',
    subtotal: 0,
    impuesto: 0,
    total: 0
  });

  // Configuración del impuesto (IVA)
  const TASA_IMPUESTO = 0.16; // 16% IVA

  // Cargar datos iniciales (clientes, productos, y factura si es edición)
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        // Cargar clientes
        const clientesResponse = await fetch('/api/clientes');
        const clientesData = await clientesResponse.json();
        setClientes(clientesData);

        // Cargar productos
        const productosResponse = await fetch('/api/products');
        const productosData = await productosResponse.json();
        setProductos(productosData);

        // Si es edición, cargar datos de la factura
        if (facturaId) {
          const facturaResponse = await fetch(`/api/facturacion/${facturaId}`);
          const facturaData = await facturaResponse.json();
          setFactura(facturaData);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [facturaId]);

  // Añadir item a la factura
  const agregarItem = () => {
    if (productos.length === 0) return;
    
    const primerProducto = productos[0];
    const nuevoItem: FacturaItem = {
      productoId: primerProducto.id,
      descripcion: primerProducto.nombre,
      cantidad: 1,
      precioUnitario: primerProducto.precio,
      importe: primerProducto.precio
    };

    setFactura(prev => {
      const nuevosItems = [...prev.items, nuevoItem];
      const nuevoSubtotal = calcularSubtotal(nuevosItems);
      const nuevoImpuesto = nuevoSubtotal * TASA_IMPUESTO;
      
      return {
        ...prev,
        items: nuevosItems,
        subtotal: nuevoSubtotal,
        impuesto: nuevoImpuesto,
        total: nuevoSubtotal + nuevoImpuesto
      };
    });
  };

  // Eliminar item de la factura
  const eliminarItem = (index: number) => {
    setFactura(prev => {
      const nuevosItems = prev.items.filter((_, i) => i !== index);
      const nuevoSubtotal = calcularSubtotal(nuevosItems);
      const nuevoImpuesto = nuevoSubtotal * TASA_IMPUESTO;
      
      return {
        ...prev,
        items: nuevosItems,
        subtotal: nuevoSubtotal,
        impuesto: nuevoImpuesto,
        total: nuevoSubtotal + nuevoImpuesto
      };
    });
  };

  // Actualizar un item
  const actualizarItem = (index: number, campo: keyof FacturaItem, valor: any) => {
    setFactura(prev => {
      const nuevosItems = [...prev.items];
      nuevosItems[index] = { 
        ...nuevosItems[index], 
        [campo]: valor 
      };

      // Si se cambia el producto, actualizar descripción y precio
      if (campo === 'productoId') {
        const productoSeleccionado = productos.find(p => p.id === valor);
        if (productoSeleccionado) {
          nuevosItems[index].descripcion = productoSeleccionado.nombre;
          nuevosItems[index].precioUnitario = productoSeleccionado.precio;
          nuevosItems[index].importe = productoSeleccionado.precio * nuevosItems[index].cantidad;
        }
      }

      // Si se cambia cantidad o precio, recalcular importe
      if (campo === 'cantidad' || campo === 'precioUnitario') {
        nuevosItems[index].importe = nuevosItems[index].cantidad * nuevosItems[index].precioUnitario;
      }

      const nuevoSubtotal = calcularSubtotal(nuevosItems);
      const nuevoImpuesto = nuevoSubtotal * TASA_IMPUESTO;
      
      return {
        ...prev,
        items: nuevosItems,
        subtotal: nuevoSubtotal,
        impuesto: nuevoImpuesto,
        total: nuevoSubtotal + nuevoImpuesto
      };
    });
  };

  // Calcular subtotal
  const calcularSubtotal = (items: FacturaItem[]): number => {
    return items.reduce((sum, item) => sum + item.importe, 0);
  };

  // Manejar cambios en los campos principales
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFactura(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar factura
  const guardarFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (factura.items.length === 0) {
      setError('Debe agregar al menos un producto a la factura');
      return;
    }

    if (!factura.clienteId) {
      setError('Debe seleccionar un cliente');
      return;
    }

    try {
      setGuardando(true);
      setError('');
      
      const url = facturaId 
        ? `/api/facturacion/${facturaId}` 
        : '/api/facturacion';
      
      const method = facturaId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(factura)
      });

      if (!response.ok) {
        throw new Error('Error al guardar la factura');
      }

      const savedFactura = await response.json();
      router.push(`/admin/facturacion/${savedFactura.id}`);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al guardar la factura');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div>Cargando datos...</div>;

  return (
    <form onSubmit={guardarFactura} className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <select
            name="clienteId"
            value={factura.clienteId}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Orden (opcional)
          </label>
          <select
            name="ordenId"
            value={factura.ordenId || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Sin orden asociada</option>
            {/* Aquí se cargarían las órdenes disponibles */}
          </select>
        </div>
      </div>
      
      {/* Items de la factura */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Productos</h3>
          <button
            type="button"
            onClick={agregarItem}
            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
          >
            + Agregar Producto
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-left">Producto</th>
                <th className="py-2 px-3 text-left">Descripción</th>
                <th className="py-2 px-3 text-right">Cantidad</th>
                <th className="py-2 px-3 text-right">Precio</th>
                <th className="py-2 px-3 text-right">Importe</th>
                <th className="py-2 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {factura.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No hay productos agregados
                  </td>
                </tr>
              ) : (
                factura.items.map((item, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="py-2 px-3">
                      <select
                        value={item.productoId}
                        onChange={(e) => actualizarItem(index, 'productoId', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded"
                      >
                        {productos.map(producto => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarItem(index, 'cantidad', parseInt(e.target.value))}
                        className="w-full p-1 border border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.precioUnitario}
                        onChange={(e) => actualizarItem(index, 'precioUnitario', parseFloat(e.target.value))}
                        className="w-full p-1 border border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      {formatCurrency(item.importe)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => eliminarItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Totales */}
      <div className="mb-6 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2 border-t">
            <span>Subtotal:</span>
            <span>{formatCurrency(factura.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-t">
            <span>IVA (16%):</span>
            <span>{formatCurrency(factura.impuesto)}</span>
          </div>
          <div className="flex justify-between py-2 border-t font-bold">
            <span>Total:</span>
            <span>{formatCurrency(factura.total)}</span>
          </div>
        </div>
      </div>
      
      {/* Notas */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          name="notas"
          value={factura.notas}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded h-24"
          placeholder="Información adicional, condiciones especiales, etc."
        />
      </div>
      
      {/* Botones de acción */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/admin/facturacion')}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {guardando ? 'Guardando...' : facturaId ? 'Actualizar Factura' : 'Crear Factura'}
        </button>
      </div>
    </form>
  );
}