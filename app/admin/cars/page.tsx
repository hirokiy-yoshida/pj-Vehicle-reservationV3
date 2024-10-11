import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function CarManagement() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN')) {
    return <div>アクセスが拒否されました。</div>;
  }

  const cars = await prisma.car.findMany({
    include: {
      shop: true,
    },
    ...(session.user.role === 'SHOP_ADMIN' ? { where: { shopId: session.user.shopId } } : {}),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">車両管理</h1>
      <Link href="/admin/cars/new" className="bg-blue-了解しました。車両予約管理システムの実装を進めていきます。現在の実装状況を踏まえ、次のステップとして車両管理機能を実装しましょう。

<boltArtifact id="create-car-management" title="車両管理機能の実装">
<boltAction type="file" filePath="app/admin/cars/page.tsx">
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function CarManagement() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN')) {
    return <div>アクセスが拒否されました。</div>;
  }

  const cars = await prisma.car.findMany({
    include: {
      shop: true,
    },
    ...(session.user.role === 'SHOP_ADMIN' ? { where: { shopId: session.user.shopId } } : {}),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">車両管理</h1>
      <Link href="/admin/cars/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
        新規車両登録
      </Link>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                車両名
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                モデル
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                ナンバープレート
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                所属店舗
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {car.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {car.model}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {car.licensePlate}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {car.shop.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  <Link href={`/admin/cars/${car.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
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