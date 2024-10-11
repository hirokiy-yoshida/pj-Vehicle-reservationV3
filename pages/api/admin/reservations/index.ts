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

  if (req.method === 'GET') {
    try {
      const { date } = req.query;
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);

      const reservations = await prisma.reservation.findMany({
        where: {
          startTime: {
            gte: startOfDay,
            lt: endOfDay,
          },
          ...(session.user.role === 'SHOP_ADMIN' ? { shop: { id: session.user.shopId } } : {}),
        },
        include: {
          car: true,
          user: true,
        },
      });

      res.status(200).json(reservations);
    } catch (error) {
      res.status(500).json({ message: "予約の取得中にエラーが発生しました。" });
    }
  } else if (req.method === 'POST') {
    try {
      const { carId, userId, startTime, endTime } = req.body;

      // 予約の重複チェック
      const existingReservation = await prisma.reservation.findFirst({
        where: {
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

      // メンテナンスの重複チェック
      const existingMaintenance = await prisma.maintenance.findFirst({
        where: {
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

      if (existingMaintenance) {
        return res.status(400).json({ message: "指定された時間帯はメンテナンス中です。" });
      }

      const car = await prisma.car.findUnique({ where: { id: carId } });
      if (!car) {
        return res.status(404).json({ message: "指定された車両が見つかりません。" });
      }

      if (session.user.role === 'SHOP_ADMIN' && car.shopId !== session.user.shopId) {
        return res.status(403).json({ message: "この車両の予約を作成する権限がありません。" });
      }

      const reservation = await prisma.reservation.create({
        data: {
          carId,
          userId,
          shopId: car.shopId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: 'PENDING',
        },
      });

      res.status(201).json(reservation);
    } catch (error) {
      res.status(500).json({ message: "予約の作成中にエラーが発生しました。" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}