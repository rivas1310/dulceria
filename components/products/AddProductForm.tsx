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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Obtener los valores del formulario
      const rawData = {
        name: formData.get("name")?.toString() || "",
        price: formData.get("price")?.toString() || "",
        categoryId: formData.get("categoryId")?.toString() || "",
        subcategoryId: formData.get("subcategoryId")?.toString() || "",
        stock: formData.get("stock")?.toString() || "",
        image: formData.get("image")?.toString() || "/placeholder-image.jpg",
      };

      console.log('Datos recibidos del formulario:', rawData);

      // Validar los datos con Zod
      const result = ProductSchema.safeParse(rawData);
      
      if (!result.success) {
        console.error('Errores de validación:', result.error.issues);
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

      console.log('Datos validados a enviar:', validatedData);

      // Enviar los datos al servidor
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        
        if (errorData.issues) {
          errorData.issues.forEach((issue: any) => {
            toast.error(issue.message);
          });
        } else if (errorData.error) {
          toast.error(errorData.error);
        } else {
          throw new Error('Error al crear el producto');
        }
        return;
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

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
      <form className="space-y-5" onSubmit={handleSubmit}>
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
