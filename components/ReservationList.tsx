import React from 'react';
import Link from 'next/link';

interface Reservation {
  id: string;
  car: { name: string };
  shop: { name: string };
  startTime: Date;
  endTime: Date;
  status: string;
}

interface ReservationListProps {
  reservations: Reservation[];
}

const ReservationList: React.FC<ReservationListProps> = ({ reservations }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            車両
          </th>
          <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            店舗
          </th>
          <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            開始時間
          </th>
          <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            終了時間
          </th>
          <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            ステータス
          </th>
          <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            アクション
          </th>
        </tr>
      </thead>
      <tbody>
        {reservations.map((reservation) => (
          <tr key={reservation.id}>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
              {reservation.car.name}
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
              {reservation.shop.name}
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
              {new Date(reservation.startTime).toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
              {new Date(reservation.endTime).toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
              {reservation.status}
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
              <Link href={`/reservations/${reservation.id}`} className="text-blue-600 hover:text-blue-900">
                詳細
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ReservationList;