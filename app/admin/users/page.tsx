import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function UserManagement() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return <div>アクセスが拒否されました。</div>;
  }

  const users = await prisma.user.findMany({
    include: {
      shop: true,
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">ユーザー管理</h1>
      <Link href="/admin/users/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
        新規ユーザー作成
      </Link>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                名前
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                メールアドレス
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                役割
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
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {user.shop?.name || 'なし'}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
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