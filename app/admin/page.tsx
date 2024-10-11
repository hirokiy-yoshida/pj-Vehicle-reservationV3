import { getServerSession } from "next-auth/next";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN')) {
    return <div>アクセスが拒否されました。</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">管理者ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {session.user.role === 'ADMIN' && (
          <>
            <Link href="/admin/users" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center">
              ユーザー管理
            </Link>
            <Link href="/admin/shops" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center">
              店舗管理
            </Link>
          </>
        )}
        <Link href="/admin/cars" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center">
          車両管理
        </Link>
        <Link href="/admin/reservations" className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-center">
          予約管理
        </Link>
        <Link href="/admin/maintenance" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-center">
          メンテナンス管理
        </Link>
      </div>
    </div>
  );
}