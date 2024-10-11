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
      const reservation = await prisma.reservation.findUnique({
        where: { id: String(id) },
        include: {
          car: true,
          user: true,
          shop: true,
        },
      });

      if (!reservation) {
        return res.status(404).json({ message: "予約が見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && reservation.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "この予約にアクセスする権限がありません。" });
      }

      res.status(200).json(reservation);
    } catch (error) {
      res.status(500).json({ message: "予約の取得中にエラーが発生しました。" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { carId, userId, startTime, endTime, status } = req.body;

      const reservation = await prisma.reservation.findUnique({
        where: { id: String(id) },
        include: { car: true },
      });

      if (!reservation) {
        return res.status(404).json({ message: "予約が見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && reservation.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "この予約を更新する権限がありません。" });
      }

      // 予約の重複チェック
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          id: { not: String(id) },
          carId,
          OR: [
            {
              AND: [
                { startTime: { lte: new Date(startTime) } },
                { endTime: { gt: new Date(startTime) } },
              ],
            },
            {
              AND: [
                { startTime: { lt: new Date(endTime) } },
                { endTime: { gte: new Date(endTime) } },
              ],
            },
          ],
        },
      });

      if (existingReservation) {
        return res.status(400).json({ message: "指定された時間帯は既に予約されています。" });
      }

      const updatedReservation = await prisma.reservation.update({
        where: { id: String(id) },
        data: {
          carId,
          userId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status,
        },
      });

      res.status(200).json(updatedReservation);
    } catch (error) {
      res.status(500).json({ message: "予約の更新中にエラーが発生しました。" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: String(id) },
      });

      if (!reservation) {
        return res.status(404).json({ message: "予約が見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && reservation.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "この予約を削除する権限がありません。" });
      }

      await prisma.reservation.delete({
        where: { id: String(id) },
      });

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "予約の削除中にエラーが発生しました。" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}