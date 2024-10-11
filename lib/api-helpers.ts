import { NextApiResponse } from 'next';

export const handleApiError = (res: NextApiResponse, error: any) => {
  console.error('API Error:', error);
  res.status(500).json({ message: 'サーバーエラーが発生しました。' });
};

export const validateMethod = (req: NextApiRequest, res: NextApiResponse, allowedMethods: string[]) => {
  if (!allowedMethods.includes(req.method!)) {
    res.setHeader('Allow', allowedMethods);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return false;
  }
  return true;
};