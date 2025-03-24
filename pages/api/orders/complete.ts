import { NextApiRequest, NextApiResponse } from 'next';
import { completeOrder } from '../../../actions/complete-order-action';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await completeOrder(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error completing order:', error);
    return res.status(500).json({ error: 'Error al procesar la orden' });
  }
}