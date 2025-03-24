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

export default function OrderSummary() {
  const order = useStore((state) => state.order);
  const clearOrder = useStore((state) => state.clearOrder);

  const isMobileOrderOpen = useStore((state) => state.isMobileOrderOpen);
  const toggleMobileOrder = useStore((state) => state.toggleMobileOrder);

  const total = useMemo(() => {
    return order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [order]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const isFormValidRef = useRef(false);

  const nameRef = useRef(name);
  const phoneRef = useRef(phone);
  const totalRef = useRef(total);

  const [itemComments, setItemComments] = useState<{ [key: number]: string }>(
    {}
  );

  useEffect(() => {
    nameRef.current = name;
    phoneRef.current = phone;
    isFormValidRef.current = name.trim() !== "" && phone.trim() !== "";
    totalRef.current = total;
    console.log(
      "Form validity updated:",
      isFormValidRef.current,
      "Name:",
      name,
      "Phone:",
      phone,
      "Total:",
      total
    );
  }, [name, phone, total]);

  const handleCommentChange = (itemId: number, comment: string) => {
    setItemComments((prev) => ({ ...prev, [itemId]: comment }));
  };

  const handleCreateOrder = useCallback(
    async (orderData: any) => {
      const orderWithComments = {
        ...orderData,
        order: order.map((item) => ({
          ...item,
          ingredients: itemComments[item.id] || "",
        })),
      };
      console.log("Datos de la orden a crear:", orderWithComments);
      try {
        const result = await createOrder(orderWithComments);

        if (result.success) {
          console.log("Orden creada:", result.order);
          toast.success("Pedido realizado correctamente");
          clearOrder();
          setName("");
          setPhone("");
          setItemComments({});
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
    [clearOrder, itemComments, order]
  );

  const handlePayPalApprove = useCallback(
    async (data: any, actions: any) => {
      try {
        const details = await actions.order.capture();
        console.log("Capture result", details);

        const orderData = {
          name: nameRef.current,
          phoneNumber: phoneRef.current,
          total: totalRef.current,
          order: order.map((item) => ({
            ...item,
            ingredients: itemComments[item.id] || "",
          })),
        };
        console.log("Order data being sent:", orderData);
        await handleCreateOrder(orderData);
      } catch (error) {
        console.error("Error capturing order:", error);
        toast.error("Error al procesar el pago");
      }
    },
    [handleCreateOrder, order, itemComments]
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
        total: totalRef.current,
        order: order.map((item) => ({
          ...item,
          ingredients: itemComments[item.id] || "",
        })),
      };

      console.log("Order data for cash:", orderData);
      await handleCreateOrder(orderData);
    },
    [handleCreateOrder, order, itemComments]
  );

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
                placeholder="Comentarios (opcional): Agregar o quitar ingredientes"
                className="bg-white border border-gray-900 text-black p-2 w-full mt-2 mb-4"
                value={itemComments[item.id] || ""}
                onChange={(e) => handleCommentChange(item.id, e.target.value)}
              />
            </div>
          ))}
          <p className="text-2xl font-bold mt-32 text-center text-black">
            Total a pagar:{" "}
            <span className="font-bold text-black">
              {formatCurrency(totalRef.current)}
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
                    totalRef.current
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
                          value: totalRef.current.toFixed(2),
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
