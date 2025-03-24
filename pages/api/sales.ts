import { NextApiRequest, NextApiResponse } from "next";
import { getSalesData } from "@/src/lib/sales";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = await getSalesData();
    console.log("Datos de ventas:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error en API:", error);
    res.status(500).json({
      error: "Error al obtener datos de ventas",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
