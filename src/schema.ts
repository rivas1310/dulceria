import { z } from "zod";

export const OrderSchema = z.object({
  name: z.string({
    required_error: "El nombre es requerido",
  }),
  phoneNumber: z.string({
    required_error: "El número de teléfono es requerido",
  }),
  total: z.number({
    required_error: "El total es requerido",
  }).nonnegative({
    message: "El total no puede ser negativo",
  }),
  subtotal: z.number({
    required_error: "El subtotal es requerido",
  }).nonnegative({
    message: "El subtotal no puede ser negativo",
  }).optional(),
  descuento: z.number({
    required_error: "El descuento es requerido",
  }).nonnegative({
    message: "El descuento no puede ser negativo",
  }).optional(),
  order: z.array(
    z.object({
      id: z.number(),
      quantity: z.number(),
      price: z.number(),
      name: z.string(),
      ingredients: z.string().optional(),
    }),
    {
      required_error: "La orden es requerida",
      invalid_type_error: "La orden debe ser un arreglo",
    }
  ).nonempty({
    message: "La orden no puede estar vacía",
  }),
}); 