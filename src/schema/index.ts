import {z} from 'zod'


export const OrderSchema = z.object({
  name: z.string().min(1, "Tu Nombre es Obligtorio"),
  total: z.number().min(1, "Hay errores en la orden"),
  phoneNumber: z.string().min(1, "El número de teléfono es requerido"),
  order: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      ingredients: z.string().optional(),
      
      price: z.number(),
      quantity: z.number(),
      subtotal: z.number(),
    })
  ),
});  
export const OrderIdSchema = z.object({
  phoneNumber: z.string().nullable(),
  orderId: z
    .string()
    .transform((value) => parseInt(value))
    .refine((value) => value > 0, { message: "Hay errores" }),
});

export const SearchSchema = z.object({
    search: z.string()
                .trim()
                .min(1, {message: 'la busqueda no puede ir vacia'})
})

export const ProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "El Nombre del Producto no puede ir vacio" }),
  price: z
    .string()
    .trim()
    .transform((value) => parseFloat(value))
    .refine((value) => value > 0, { message: "Precio no válido" })
    .or(z.number().min(1, { message: "La Categoría es Obligatoria" })),
  categoryId: z
    .string()
    .trim()
    .transform((value) => parseInt(value))
    .refine((value) => value > 0, { message: "La Categoría es Obligatoria" })
    .or(z.number().min(1, { message: "La Categoría es Obligatoria" })),
  image: z.string().min(1, { message: "La Imagen es obligatoria" }),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
});