import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { handleApiError, validateMethod } from '../../../lib/api-helpers';
import { checkAdminRole } from '../../../lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!validateMethod(req, res, ['GET'])) return;

  const session = await getServerSession(req, res, authOptions);
  if (!session || !checkAdminRole(session.user)) {
    return res.status(403).json({ message: "この操作を行う権限がありません。" });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalReservations,
      activeReservations,
      todayReservations,
      totalCars,
      availableCars,
      carsInMaintenance,
      totalUsers,
      newUsersThisMonth
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: 'ACTIVE' } }),
      prisma.reservation.count({ where: { startTime: { gte: today } } }),
      prisma.car.count(),
      prisma.car.count({ where: { NOT: { reservations: { some: { status: 'ACTIVE' } } } } }),
      prisma.maintenance.count({ where: { endTime: { gt: new Date() } } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: firstDayOfMonth } } })
    ]);

    const stats = {
      totalReservations,
      activeReservations,
      todayReservations,
      totalCars,
      availableCars,
      carsInMaintenance,
      totalUsers,
      newUsersThisMonth
    };

    res.status(200).json(stats);
  } catch (error) {
    handleApiError(res, error);
  }
}