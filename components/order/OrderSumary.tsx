"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useStore } from "@/src/store";
import { toast } from "react-toastify";
import ProductDetails from "./ProductDetails";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { formatCurrency } from "@/src/lib/utils";
import { createOrder } from "@/actions/create-order-actions";
import { OrderSchema } from "@/src/schema";
import MobileOrderButton from "@/components/products/MobileOrderButton";
import FormularioCupon from "@/components/carrito/FormularioCupon";

export default function OrderSummary() {
  const order = useStore((state) => state.order);
  const clearOrder = useStore((state) => state.clearOrder);

  const isMobileOrderOpen = useStore((state) => state.isMobileOrderOpen);
  const toggleMobileOrder = useStore((state) => state.toggleMobileOrder);

  const subtotal = useMemo(() => {
    return order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [order]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const isFormValidRef = useRef(false);
  const [descuento, setDescuento] = useState(0);
  const [codigoCupon, setCodigoCupon] = useState("");
  const [mensajeCupon, setMensajeCupon] = useState("");
  const [loadingCupon, setLoadingCupon] = useState(false);
  const [cuponAplicado, setCuponAplicado] = useState(false);

  const nameRef = useRef(name);
  const phoneRef = useRef(phone);
  const subtotalRef = useRef(subtotal);
  const descuentoRef = useRef(descuento);

  // Cálculo del total con descuento
  const total = useMemo(() => {
    return subtotal - descuento;
  }, [subtotal, descuento]);

  const [itemComments, setItemComments] = useState<{ [key: number]: string }>(
    {}
  );

  // La referencia al ID de la orden para aplicar el cupón
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    nameRef.current = name;
    phoneRef.current = phone;
    isFormValidRef.current = name.trim() !== "" && phone.trim() !== "";
    subtotalRef.current = subtotal;
    descuentoRef.current = descuento;
    
    console.log(
      "Form validity updated:",
      isFormValidRef.current,
      "Name:",
      name,
      "Phone:",
      phone,
      "Subtotal:",
      subtotal,
      "Descuento:",
      descuento,
      "Total con descuento:",
      total
    );
  }, [name, phone, subtotal, descuento, total]);

  const handleCommentChange = (itemId: number, comment: string) => {
    setItemComments((prev) => ({ ...prev, [itemId]: comment }));
  };

  // Aplicar cupón de descuento
  const aplicarCupon = async () => {
    if (!codigoCupon.trim()) {
      toast.error("Por favor ingresa un código de cupón");
      return;
    }

    setLoadingCupon(true);
    try {
      const response = await fetch('/api/cupones/validar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          codigo: codigoCupon,
          subtotal: subtotal
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'No se pudo aplicar el cupón');
        return;
      }

      // Aplicar el descuento
      setDescuento(data.descuento);
      setMensajeCupon(data.mensaje);
      setCuponAplicado(true);
      toast.success(data.mensaje || '¡Cupón aplicado!');
    } catch (error) {
      console.error('Error al aplicar cupón:', error);
      toast.error('Ocurrió un error al procesar el cupón');
    } finally {
      setLoadingCupon(false);
    }
  };

  // Eliminar cupón aplicado
  const eliminarCupon = () => {
    setDescuento(0);
    setCodigoCupon("");
    setMensajeCupon("");
    setCuponAplicado(false);
    toast.info('Cupón eliminado');
  };

  const handleCreateOrder = useCallback(
    async (orderData: any) => {
      const orderWithComments = {
        ...orderData,
        order: order.map((item) => ({
          ...item,
          ingredients: itemComments[item.id] || "",
        })),
        descuento: descuentoRef.current,
        subtotal: subtotalRef.current,
        total: subtotalRef.current - descuentoRef.current,
        codigoCupon: cuponAplicado ? codigoCupon : null
      };
      console.log("Datos de la orden a crear:", orderWithComments);
      try {
        const result = await createOrder(orderWithComments);

        if (result.success) {
          console.log("Orden creada:", result.order);
          // Guardar el ID de la orden para poder aplicar cupones
          if (result.order && result.order.id) {
            setOrderId(result.order.id);
          }
          toast.success("Pedido realizado correctamente");
          clearOrder();
          setName("");
          setPhone("");
          setItemComments({});
          setDescuento(0);
          setCodigoCupon("");
          setMensajeCupon("");
          setCuponAplicado(false);
        } else {
          console.error("Error al crear la orden:", result.errors);
          if (result.errors && Array.isArray(result.errors)) {
            result.errors.forEach((error) => {
              toast.error(`Error: ${error.path} - ${error.message}`);
            });
          } else {
            toast.error("Error desconocido al crear la orden");
          }
        }
      } catch (error) {
        console.error("Error inesperado al crear la orden:", error);
        toast.error("Error inesperado al crear la orden");
      }
    },
    [clearOrder, itemComments, order, subtotal, codigoCupon, cuponAplicado]
  );

  const handlePayPalApprove = useCallback(
    async (data: any, actions: any) => {
      try {
        const details = await actions.order.capture();
        console.log("Capture result", details);

        const orderData = {
          name: nameRef.current,
          phoneNumber: phoneRef.current,
          total: subtotalRef.current - descuentoRef.current,
          subtotal: subtotalRef.current,
          descuento: descuentoRef.current,
          order: order.map((item) => ({
            ...item,
            ingredients: itemComments[item.id] || "",
          })),
          codigoCupon: cuponAplicado ? codigoCupon : null
        };
        console.log("Order data being sent:", orderData);
        await handleCreateOrder(orderData);
      } catch (error) {
        console.error("Error capturing order:", error);
        toast.error("Error al procesar el pago");
      }
    },
    [handleCreateOrder, order, itemComments, subtotal, codigoCupon, cuponAplicado]
  );

  const handleCashOrder = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isFormValidRef.current) {
        toast.error(
          "Por favor, completa tu nombre y número de teléfono antes de realizar el pedido"
        );
        return;
      }

      const orderData = {
        name: nameRef.current,
        phoneNumber: phoneRef.current,
        total: subtotalRef.current - descuentoRef.current,
        subtotal: subtotalRef.current,
        descuento: descuentoRef.current,
        order: order.map((item) => ({
          ...item,
          ingredients: itemComments[item.id] || "",
        })),
        codigoCupon: cuponAplicado ? codigoCupon : null
      };

      console.log("Order data for cash:", orderData);
      await handleCreateOrder(orderData);
    },
    [handleCreateOrder, order, itemComments, subtotal, codigoCupon, cuponAplicado]
  );

  const handleIncrement = useCallback((id: number) => {
    const product = order.find(item => item.id === id);
    if (product) {
      useStore.getState().increaseQuantity(id);
    }
  }, [order]);

  const handleDecrement = useCallback((id: number) => {
    const product = order.find(item => item.id === id);
    if (product && product.quantity > 1) {
      useStore.getState().decreaseQuantity(id);
    }
  }, [order]);

  const handleRemove = useCallback((id: number) => {
    useStore.getState().removeItem(id);
  }, []);

  return (
    <aside
      className={`
        h-full 
        bg-customBlue 
        p-5
        ${isMobileOrderOpen ? "w-full md:w-64 lg:w-96" : "w-64 lg:w-96"}
      `}
    >
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-black text-black">Mi Pedido</h1>
        {isMobileOrderOpen && (
          <button
            onClick={() => useStore.getState().toggleMobileOrder()}
            className="text-black text-2xl md:hidden"
          >
            ✕
          </button>
        )}
      </div>

      {order.length === 0 ? (
        <p className="text-center text-black font-bold text-2xl my-64">
          No has realizado ningún pedido
        </p>
      ) : (
        <div className="mt-5">
          {order.map((item) => (
            <div key={item.id}>
              <ProductDetails item={item} />
              <textarea
                placeholder="Comentarios"
                className="bg-white border border-gray-900 text-black p-2 w-full mt-2 mb-4"
                value={itemComments[item.id] || ""}
                onChange={(e) => handleCommentChange(item.id, e.target.value)}
              />
            </div>
          ))}
          
          {/* Formulario para aplicar cupón */}
          <div className="mb-4 p-3 border border-gray-300 bg-white rounded-md">
            <h3 className="text-black font-bold mb-2">¿Tienes un cupón de descuento?</h3>
            
            {mensajeCupon && (
              <div className="mb-3 p-2 bg-green-100 text-green-700 rounded-md">
                <p className="font-bold">¡Cupón aplicado!</p>
                <p>{mensajeCupon}</p>
              </div>
            )}
            
            <div className="flex space-x-2">
              <input
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="Ingresa tu código"
                value={codigoCupon}
                onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                disabled={cuponAplicado}
              />
              {!cuponAplicado ? (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  onClick={aplicarCupon}
                  disabled={loadingCupon || !codigoCupon.trim()}
                >
                  {loadingCupon ? '...' : 'Aplicar'}
                </button>
              ) : (
                <button
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
                  onClick={eliminarCupon}
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
          
          {/* Resumen de la orden */}
          <div className="mt-20 text-black">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            {descuento > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span className="font-medium">Descuento:</span>
                <span>-{formatCurrency(descuento)}</span>
              </div>
            )}
          </div>
          
          <p className="text-2xl font-bold mt-4 text-center text-black border-t border-dashed border-gray-400 pt-2">
            Total a pagar:{" "}
            <span className="font-bold text-black">
              {formatCurrency(total)}
            </span>
          </p>
          
          <form
            className="w-full mt-10 gap-5 space-y-5"
            onSubmit={handleCashOrder}
          >
            <input
              type="text"
              placeholder="Tu Nombre"
              className="bg-white border border-gray-900 text-black p-2 w-full"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Tu Teléfono"
              className="bg-white border border-gray-900 text-black p-2 w-full"
              name="phone_number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="grid grid-cols-1 gap-7 items-center">
              <button
                type="submit"
                className="py-2 rounded uppercase text-white bg-black hover:bg-customBlue2 w-48 text-center cursor-pointer font-bold"
              >
                Realizar Pedido
              </button>
            </div>

            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                currency: "MXN",
              }}
            >
              <PayPalButtons
                style={{ layout: "vertical" }}
                onClick={(data, actions) => {
                  console.log(
                    "Click en PayPal. Nombre:",
                    nameRef.current,
                    "Teléfono:",
                    phoneRef.current,
                    "isFormValid:",
                    isFormValidRef.current,
                    "Total:",
                    total
                  );
                  if (!isFormValidRef.current) {
                    toast.error(
                      "Por favor, completa tu nombre y número de teléfono antes de pagar"
                    );
                    return actions.reject();
                  }
                  return actions.resolve();
                }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                      {
                        amount: {
                          value: total.toFixed(2),
                          currency_code: "MXN",
                        },
                      },
                    ],
                  });
                }}
                onApprove={handlePayPalApprove}
                onError={(err) => {
                  console.error("PayPal error:", err);
                  toast.error("Error processing payment");
                }}
              />
            </PayPalScriptProvider>
          </form>
        </div>
      )}
    </aside>
  );
}
