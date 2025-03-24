import { NextApiRequest, NextApiResponse } from "next";
import { getSalesData } from "../../src/lib/sales";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const salesData = await getSalesData();
    console.log("API - Datos obtenidos:", salesData);
    res.status(200).json(salesData);
  } catch (error) {
    console.error("Error in sales stats API:", error);
    res.status(500).json({
      error: "Error fetching sales stats",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
