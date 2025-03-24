"use client"
import { useStore } from "@/src/store";
import OrderSummary from "../order/OrderSumary";

export default function MobileOrderButton() {
  const order = useStore((state) => state.order);
  const isMobileOrderOpen = useStore((state) => state.isMobileOrderOpen);
  const toggleMobileOrder = useStore((state) => state.toggleMobileOrder);

  return (
    <>
      {/* Botón flotante en móvil */}
      <button
        className="fixed bottom-4 right-4 bg-customBlue text-white p-4 rounded-full md:hidden z-50"
        onClick={toggleMobileOrder}
      >
        Mi Pedido ({order.length})
      </button>

      {/* Modal/Sidebar móvil */}
      {isMobileOrderOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white overflow-y-auto">
            <OrderSummary />
          </div>
        </div>
      )}
    </>
  );
} 