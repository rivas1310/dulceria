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
    .min(1, { message: "El Nombre del Producto no puede ir vacío" }),
  price: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El Precio debe ser un número mayor a 0"
    }),
  categoryId: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Debe seleccionar una Categoría válida"
    }),
  subcategoryId: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Debe seleccionar una Subcategoría válida"
    }),
  stock: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "El Stock debe ser un número mayor o igual a 0"
    }),
  image: z
    .string()
    .optional()
    .default("/placeholder-image.jpg")
});