import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function MaintenanceManagement() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN')) {
    return <div>アクセスが拒否されました。</div>;
  }

  const maintenances = await prisma.maintenance.findMany({
    include: {
      car: true,
    },
    ...(session.user.role === 'SHOP_ADMIN' ? { where: { car: { shopId: session.user.shopId } } } : {}),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">メンテナンス管理</h1>
      <Link href="/admin/maintenance/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
        新規メンテナンス登録
      </Link>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                車両
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                開始時間
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                終了時間
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                説明
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody>
            {maintenances.map((maintenance) => (
              <tr key={maintenance.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {maintenance.car.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {new Date(maintenance.startTime).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {new Date(maintenance.endTime).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {maintenance.description}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  <Link href={`/admin/maintenance/${maintenance.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                    編集
                  </Link>
                  <button className="text-red-600 hover:text-red-900">
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}