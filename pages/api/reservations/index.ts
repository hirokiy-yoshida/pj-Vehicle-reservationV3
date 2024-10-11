import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "認証されていません。" });
  }

  if (req.method === 'POST') {
    try {
      const { carId, startTime, endTime } = req.body;

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

      const reservation = await prisma.reservation.create({
        data: {
          userId: session.user.id,
          carId,
          shopId: session.user.shopId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: 'PENDING',
        },
      });

      res.status(201).json(reservation);
    } catch (error) {
      res.status(500).json({ message: "予約の作成中にエラーが発生しました。" });
    }
  } else if (req.method === 'GET') {
    try {
      const reservations = await prisma.reservation.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          car: true,
          shop: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      res.status(200).json(reservations);
    } catch (error) {
      res.status(500).json({ message: "予約の取得中にエラーが発生しました。" });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}