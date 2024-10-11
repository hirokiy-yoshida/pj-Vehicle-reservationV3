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
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      reservationsPerDay,
      revenuePerMonth,
      popularCars,
      averageUsageTime,
      averageMileage
    ] = await Promise.all([
      prisma.$queryRaw`
        SELECT DATE(startTime) as date, COUNT(*) as count
        FROM Reservation
        WHERE startTime >= ${sevenDaysAgo}
        GROUP BY DATE(startTime)
        ORDER BY date
      `,
      prisma.$queryRaw`
        SELECT DATE_FORMAT(startTime, '%Y-%m') as month, SUM(TIMESTAMPDIFF(HOUR, startTime, endTime) * 1000) as revenue
        FROM Reservation
        WHERE startTime >= ${sixMonthsAgo} AND status = 'COMPLETED'
        GROUP BY DATE_FORMAT(startTime, '%Y-%m')
        ORDER BY month
      `,
      prisma.car.findMany({
        select: {
          name: true,
          _count: {
            select: { reservations: true }
          }
        },
        orderBy: {
          reservations: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      prisma.reservation.aggregate({
        where: {
          status: 'COMPLETED'
        },
        _avg: {
          _count: {
            select: {
              startTime: true,
              endTime: true
            }
          }
        }
      }),
      prisma.reservation.aggregate({
        where: {
          status: 'COMPLETED',
          startMileage: { not: null },
          endMileage: { not: null }
        },
        _avg: {
          endMileage: true,
          startMileage: true
        }
      })
    ]);

    const popularCarsFormatted = popularCars.map(car => ({
      name: car.name,
      reservationCount: car._count.reservations
    }));

    const averageUsageTimeHours = averageUsageTime._avg._count.endTime - averageUsageTime._avg._count.startTime;
    const averageMileageKm = averageMileage._avg.endMileage - averageMileage._avg.startMileage;

    res.status(200).json({
      reservationsPerDay,
      revenuePerMonth,
      popularCars: popularCarsFormatted,
      averageUsageTime: averageUsageTimeHours.toFixed(2),
      averageMileage: averageMileageKm.toFixed(2)
    });
  } catch (error) {
    handleApiError(res, error);
  }
}