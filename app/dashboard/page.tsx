import { getServerSession } from "next-auth/next";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>ログインしてください。</div>;
  }

  const upcomingReservations = await prisma.reservation.findMany({
    where: {
      userId: session.user.id,
      startTime: {
        gte: new Date(),
      },
    },
    include: {
      car: true,
    },
    orderBy: {
      startTime: 'asc',
    },
    take: 5,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">今後の予約</h2>
          {upcomingReservations.length > 0 ? (
            <ul className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <li key={reservation.id} className="border-b pb-2">
                  <p className="font-semibold">{reservation.car.name}</p>
                  <p>{new Date(reservation.startTime).toLocaleString()} - {new Date(reservation.endTime).toLocaleString()}</p>
                  <Link href={`/reservations/${reservation.id}`} className="text-blue-600 hover:text-blue-800">
                    詳細を見る
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>予約はありません。</p>
          )}
          <Link href="/reservations/new" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            新しい予約を作成
          </Link>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">クイックリンク</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/reservations" className="text-blue-600 hover:text-blue-800">
                予約一覧を見る
              </Link>
            </li>
            <li>
              <Link href="/profile" className="text-blue-600 hover:text-blue-800">
                プロフィールを編集
              </Link>
            </li>
            {(session.user.role === 'ADMIN' || session.user.role === 'SHOP_ADMIN') && (
              <li>
                <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                管理画面へ
              </Link>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}