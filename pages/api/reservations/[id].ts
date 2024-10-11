import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import { handleApiError, validateMethod } from '../../../lib/api-helpers';
import { getSessionUser } from '../../../lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!validateMethod(req, res, ['GET', 'PUT', 'DELETE'])) return;

  const user = await getSessionUser(req, res);
  if (!user) return;

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const reservation = await prisma.reservation.findUnique({
        where: { id: String(id) },
        include: { car: true },
      });

      if (!reservation) {
        return res.status(404).json({ message: "予約が見つかりません。" });
      }

      if (reservation.userId !== user.id && user.role !== 'ADMIN') {
        return res.status(403).json({ message: "この予約にアクセスする権限がありません。" });
      }

      res.status(200).json(reservation);
    } else if (req.method === 'PUT') {
      const { startTime, endTime } = req.body;

      const reservation = await prisma.reservation.findUnique({
        where: { id: String(id) },
      });

      if (!reservation) {
        return res.status(404).json({ message: "予約が見つかりません。" });
      }

      if (reservation.userId !== user.id && user.role !== 'ADMIN') {
        return res.status(403).json({ message: "この予約を更新する権限がありません。" });
      }

      // 予約の重複チェック
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          id: { not: String(id) },
          carId: reservation.carId,
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
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        },
      });

      res.status(200).json(updatedReservation);
    } else if (req.method === 'DELETE') {
      const reservation = await prisma.reservation.findUnique({
        where: { id: String(id) },
      });

      if (!reservation) {
        return res.status(404).json({ message: "予約が見つかりません。" });
      }

      if (reservation.userId !== user.id && user.role !== 'ADMIN') {
        return res.status(403).json({ message: "この予約を削除する権限がありません。" });
      }

      await prisma.reservation.delete({
        where: { id: String(id) },
      });

      res.status(204).end();
    }
  } catch (error) {
    handleApiError(res, error);
  }
}