"use client";
import { ProductSchema } from "@/src/schema/index";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { updateProduct } from "@/actions/update-product-action";

export default function EditProductForm({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  if (!params) {
    throw new Error("Params are not available");
  }
  const id = +params.id!;

  const handleSubmit = async (formData: FormData) => {
    try {
      // Convertir todos los valores a string
      const data = {
        name: formData.get("name")?.toString() || "",
        price: formData.get("price")?.toString() || "0",
        categoryId: formData.get("categoryId")?.toString() || "",
        subcategoryId: formData.get("subcategoryId")?.toString() || "",
        image: formData.get("image")?.toString() || "",
        stock: formData.get("stock")?.toString() || "0",
      };

      console.log("Datos a validar:", data); // Para debugging

      if (!ProductSchema || typeof ProductSchema.safeParse !== 'function') {
        console.error("Error: ProductSchema no está disponible o no tiene el método safeParse");
        toast.error("Error en la validación del formulario");
        return;
      }

      const result = ProductSchema.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          toast.error(issue.message);
        });
        return;
      }

      const response = await updateProduct(result.data, id);
      if (response?.errors) {
        response.errors.forEach((issue) => {
          toast.error(issue.message);
        });
        return;
      }

      toast.success("Producto Actualizado");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el producto');
    }
  };

  return (
    <div className="bg-white mt-10 px-5 py-10 rounded-md shadow-md max-w-3xl mx-auto">
      <form className="space-y-5" action={handleSubmit}>
        {children}
        <button
          type="submit"
          className="bg-black hover:bg-customCyan text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
