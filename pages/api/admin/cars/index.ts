import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import { handleApiError, validateMethod } from '../../../../lib/api-helpers';
import { getSessionUser, checkAdminRole } from '../../../../lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!validateMethod(req, res, ['GET', 'POST'])) return;

  const user = await getSessionUser(req, res);
  if (!user) return;

  if (!checkAdminRole(user)) {
    return res.status(403).json({ message: "この操作を行う権限がありません。" });
  }

  try {
    if (req.method === 'POST') {
      const { name, model, licensePlate, shopId } = req.body;
      const car = await prisma.car.create({
        data: {
          name,
          model,
          licensePlate,
          shopId: user.role === 'SHOP_ADMIN' ? user.shopId : shopId,
        },
      });
      res.status(201).json(car);
    } else if (req.method === 'GET') {
      const cars = await prisma.car.findMany({
        include: { shop: true },
        ...(user.role === 'SHOP_ADMIN' ? { where: { shopId: user.shopId } } : {}),
      });
      res.status(200).json(cars);
    }
  } catch (error) {
    handleApiError(res, error);
  }
}