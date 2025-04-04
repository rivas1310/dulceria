import React, { useState } from 'react';

interface FormularioCuponProps {
  orderId: number;
  onCuponAplicado: (descuento: number, mensaje: string) => void;
}

const FormularioCupon: React.FC<FormularioCuponProps> = ({ orderId, onCuponAplicado }) => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{show: boolean, title: string, description: string, status: 'error' | 'success' | 'info'}>({
    show: false,
    title: '',
    description: '',
    status: 'info'
  });

  const showToast = (title: string, description: string, status: 'error' | 'success' | 'info') => {
    setToast({ show: true, title, description, status });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const aplicarCupon = async () => {
    if (!codigo.trim()) {
      showToast('Código requerido', 'Por favor ingresa un código de cupón', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cupones/aplicar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo, orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast('Error', data.error || 'No se pudo aplicar el cupón', 'error');
        return;
      }

      // Notificar al componente padre sobre el cupón aplicado
      onCuponAplicado(data.orden.descuento, data.mensaje);
      
      showToast('¡Cupón aplicado!', data.mensaje, 'success');
      
      // Limpiar el campo después de aplicar exitosamente
      setCodigo('');
    } catch (error) {
      console.error('Error al aplicar cupón:', error);
      showToast('Error', 'Ocurrió un error al procesar el cupón', 'error');
    } finally {
      setLoading(false);
    }
  };

  const eliminarCupon = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cupones/eliminarAplicacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast('Error', data.error || 'No se pudo eliminar el cupón', 'error');
        return;
      }

      // Notificar al componente padre que se eliminó el cupón
      onCuponAplicado(0, 'Cupón eliminado');
      
      showToast('Cupón eliminado', data.mensaje, 'info');
    } catch (error) {
      console.error('Error al eliminar cupón:', error);
      showToast('Error', 'Ocurrió un error al eliminar el cupón', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-md">
      <h3 className="text-lg font-medium mb-2">¿Tienes un cupón de descuento?</h3>
      
      {toast.show && (
        <div className={`mb-3 p-2 rounded-md ${
          toast.status === 'error' ? 'bg-red-100 text-red-700' : 
          toast.status === 'success' ? 'bg-green-100 text-green-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          <p className="font-bold">{toast.title}</p>
          <p>{toast.description}</p>
        </div>
      )}
      
      <div className="flex space-x-2">
        <input
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Ingresa tu código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          onClick={aplicarCupon}
          disabled={loading}
        >
          {loading ? 'Aplicando...' : 'Aplicar'}
        </button>
        <button
          className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          onClick={eliminarCupon}
          disabled={loading}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </div>
  );
};

export default FormularioCupon; 