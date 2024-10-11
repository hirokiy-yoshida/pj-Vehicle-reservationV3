import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import Link from 'next/link';
import ReservationList from '../../components/ReservationList';

const prisma = new PrismaClient();

export default async function ReservationPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div>アクセスが拒否されました。ログインしてください。</div>;
  }

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">予約一覧</h1>
      <Link href="/reservations/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
        新しい予約を作成
      </Link>
      <ReservationList reservations={reservations} />
    </div>
  );
}