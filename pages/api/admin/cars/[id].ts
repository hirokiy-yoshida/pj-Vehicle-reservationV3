import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN')) {
    return res.status(403).json({ message: "この操作を行う権限がありません。" });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const car = await prisma.car.findUnique({
        where: { id: String(id) },
        include: {
          shop: true,
        },
      });

      if (!car) {
        return res.status(404).json({ message: "車両が見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && car.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "この車両にアクセスする権限がありません。" });
      }

      res.status(200).json(car);
    } catch (error) {
      res.status(500).json({ message: "車両の取得中にエラーが発生しました。" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, model, licensePlate, shopId } = req.body;

      const car = await prisma.car.findUnique({
        where: { id: String(id) },
      });

      if (!car) {
        return res.status(404).json({ message: "車両が見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && car.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "この車両を更新する権限がありません。" });
      }

      const updatedCar = await prisma.car.update({
        where: { id: String(id) },
        data: {
          name,
          model,
          licensePlate,
          shopId: session.user.role === 'ADMIN' ? shopId : undefined,
        },
      });

      res.status(200).json(updatedCar);
    } catch (error) {
      res.status(500).json({ message: "車両の更新中にエラーが発生しました。" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const car = await prisma.car.findUnique({
        where: { id: String(id) },
      });

      if (!car) {
        return res.status(404).json({ message: "車両が見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && car.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "この車両を削除する権限がありません。" });
      }

      await prisma.car.delete({
        where: { id: String(id) },
      });

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "車両の削除中にエラーが発生しました。" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}