import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import Link from 'next/link';
import { checkAdminRole } from '../../../lib/auth';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !checkAdminRole(session.user)) {
    return <div>アクセスが拒否されました。</div>;
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">管理者ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">予約統計</h2>
          <p>総予約数: {totalReservations}</p>
          <p>進行中の予約: {activeReservations}</p>
          <p>今日の予約: {todayReservations}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">車両統計</h2>
          <p>総車両数: {totalCars}</p>
          <p>利用可能な車両: {availableCars}</p>
          <p>メンテナンス中の車両: {carsInMaintenance}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">ユーザー統計</h2>
          <p>総ユーザー数: {totalUsers}</p>
          <p>新規ユーザー (今月): {newUsersThisMonth}</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">クイックリンク</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/reservations" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            予約管理
          </Link>
          <Link href="/admin/cars" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            車両管理
          </Link>
          <Link href="/admin/users" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            ユーザー管理
          </Link>
          <Link href="/admin/maintenance" className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            メンテナンス管理
          </Link>
          <Link href="/admin/reports" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            レポート
          </Link>
        </div>
      </div>
    </div>
  );
}