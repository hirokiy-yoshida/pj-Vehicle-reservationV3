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

  if (req.method === 'POST') {
    try {
      const { carId, startTime, endTime, description } = req.body;

      const car = await prisma.car.findUnique({
        where: { id: carId },
      });

      if (!car) {
        return res.status(404).json({ message: "指定された車両が見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && car.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "この車両のメンテナンスを登録する権限がありません。" });
      }

      const maintenance = await prisma.maintenance.create({
        data: {
          carId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          description,
        },
      });

      res.status(201).json(maintenance);
    } catch (error) {
      res.status(500).json({ message: "メンテナンスの登録中にエラーが発生しました。" });
    }
  } else if (req.method === 'GET') {
    try {
      const maintenances = await prisma.maintenance.findMany({
        include: {
          car: true,
        },
        ...(session.user.role === 'SHOP_ADMIN' ? { where: { car: { shopId: session.user.shopId } } } : {}),
      });

      res.status(200).json(maintenances);
    } catch (error) {
      res.status(500).json({ message: "メンテナンスの取得中にエラーが発生しました。" });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}