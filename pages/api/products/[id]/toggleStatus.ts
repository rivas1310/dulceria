import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/src/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { isActive: !product.isActive },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}
