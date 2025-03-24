import { completeOrder } from "@/actions/complete-order-action";
import { formatCurrency } from "@/src/lib/utils";
import { OrderWithProducts } from "@/src/types";
import { products } from "@/prisma/data/products";

type OrderCardProps = {
  order: OrderWithProducts;
  onOrderComplete?: () => void;
};

export default function OrderCard({ order, onOrderComplete }: OrderCardProps) {
  const handleCompleteOrder = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    console.log("Iniciando completar orden. Datos de la orden:", order);

    if (!order.id) {
      console.error("Error: ID de orden no disponible");
      alert("No se puede completar la orden: ID de orden no disponible");
      return;
    }

    if (!order.phoneNumber) {
      console.error("Error: Número de teléfono no disponible");
      alert(
        "No se puede completar la orden: Número de teléfono no proporcionado"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("order_id", order.id.toString());
      formData.append("phone_number", order.phoneNumber);

      console.log(
        "Enviando solicitud para completar orden. ID:",
        order.id,
        "Teléfono:",
        order.phoneNumber
      );

      const result = await completeOrder(formData);
      console.log("Resultado de completar orden:", result);

      if (result.success) {
        console.log("Orden completada exitosamente");
        if (onOrderComplete) {
          onOrderComplete();
        }
      } else {
        throw new Error(
          result.error || "Error desconocido al completar la orden"
        );
      }
    } catch (error) {
      console.error("Error detallado al completar la orden:", error);
      alert(
        "Hubo un problema al completar el pedido: " + (error as Error).message
      );
    }
  };

  return (
    <section
      aria-labelledby="summary-heading"
      className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:mt-0 lg:p-8 space-y-4"
    >
      <p className="text-2xl font-medium text-gray-900">
        Cliente: {order.name}
      </p>
      <p className="text-lg font-medium text-gray-900">Productos Ordenados:</p>
      <dl className="mt-6 space-y-4">
        {order.orderProducts.map((product) => (
          <div
            key={product.productId}
            className="flex flex-col items-start gap-2 border-t border-gray-200 text-black pt-4"
          >
            <div className="flex items-center">
              <dt className="flex items-center text-sm text-gray-600">
                <span className="font-black">({product.quantity})</span>
              </dt>
              <dd className="text-sm font-medium text-gray-900 ml-2">
                {product.product.name}
              </dd>
            </div>
          </div>
        ))}
        {/* Mostrar los ingredientes aquí, fuera del mapeo de productos */}
        {order.ingredients && (
          <p className="text-sm text-gray-600 mt-4">
            <strong>Ingredientes:</strong> {order.ingredients}
          </p>
        )}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <dt className="text-base font-medium text-gray-900">
            Total a Pagar:
          </dt>
          <dd className="text-base font-medium text-gray-900">
            {formatCurrency(order.total)}
          </dd>
        </div>
      </dl>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <dt className="text-base font-medium text-gray-900">
          Número de Teléfono:
        </dt>
        <dd className="text-base font-medium text-gray-900">
          {order.phoneNumber || "No disponible"}
        </dd>
      </div>

      <form onSubmit={handleCompleteOrder}>
        <button
          type="submit"
          className="bg-customBlue hover:bg-customBlue2 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer"
          disabled={!order.phoneNumber || !order.id}
        >
          {order.phoneNumber && order.id
            ? "Marcar Orden Completada"
            : "Datos insuficientes para completar"}
        </button>
      </form>
    </section>
  );
}