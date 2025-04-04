"use client"
import { ProductSchema } from "@/src/schema/index";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function AddProductForm({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      // Obtener los valores del formulario como strings
      const rawData = {
        name: formData.get("name")?.toString() || "",
        price: formData.get("price")?.toString() || "",
        categoryId: formData.get("categoryId")?.toString() || "",
        subcategoryId: formData.get("subcategoryId")?.toString() || "",
        stock: formData.get("stock")?.toString() || "",
        image: "/placeholder-image.jpg",
      };

      console.log('Datos a validar:', rawData);

      // Validar los datos
      const result = ProductSchema.safeParse(rawData);
      
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          toast.error(issue.message);
        });
        return;
      }

      // Los datos validados ya están transformados a números
      const validatedData = {
        name: result.data.name,
        price: Number(result.data.price),
        categoryId: Number(result.data.categoryId),
        subcategoryId: Number(result.data.subcategoryId),
        stock: Number(result.data.stock),
        image: result.data.image,
      };

      console.log('Datos transformados a enviar:', validatedData);

      // Enviar los datos validados y transformados al servidor
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Error del servidor:', responseData);
        if (responseData.issues) {
          responseData.issues.forEach((issue: any) => {
            toast.error(`Error: ${issue.message}`);
          });
        } else {
          throw new Error(responseData.error || 'Error al crear el producto');
        }
        return;
      }

      toast.success("Producto creado exitosamente");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error('Error completo:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el producto');
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
          Crear Producto
        </button>
      </form>
    </div>
  );
}
