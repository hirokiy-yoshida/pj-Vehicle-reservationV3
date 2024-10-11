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
      const maintenance = await prisma.maintenance.findUnique({
        where: { id: String(id) },
        include: {
          car: true,
        },
      });

      if (!maintenance) {
        return res.status(404).json({ message: "メンテナンスが見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && maintenance.car.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "このメンテナンスにアクセスする権限がありません。" });
      }

      res.status(200).json(maintenance);
    } catch (error) {
      res.status(500).json({ message: "メンテナンスの取得中にエラーが発生しました。" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { carId, startTime, endTime, description } = req.body;

      const maintenance = await prisma.maintenance.findUnique({
        where: { id: String(id) },
        include: {
          car: true,
        },
      });

      if (!maintenance) {
        return res.status(404).json({ message: "メンテナンスが見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && maintenance.car.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "このメンテナンスを更新する権限がありません。" });
      }

      const updatedMaintenance = await prisma.maintenance.update({
        where: { id: String(id) },
        data: {
          carId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          description,
        },
      });

      res.status(200).json(updatedMaintenance);
    } catch (error) {
      res.status(500).json({ message: "メンテナンスの更新中にエラーが発生しました。" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const maintenance = await prisma.maintenance.findUnique({
        where: { id: String(id) },
        include: {
          car: true,
        },
      });

      if (!maintenance) {
        return res.status(404).json({ message: "メンテナンスが見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && maintenance.car.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "このメンテナンスを削除する権限がありません。" });
      }

      await prisma.maintenance.delete({
        where: { id: String(id) },
      });

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "メンテナンスの削除中にエラーが発生しました。" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}