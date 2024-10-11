'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ReservationDetail({ params }: { params: { id: string } }) {
  const [reservation, setReservation] = useState(null);
  const [carId, setCarId] = useState('');
  const [userId, setUserId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('');
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchReservation();
    fetchCars();
    fetchUsers();
  }, []);

  const fetchReservation = async () => {
    try {
      const response = await fetch(`/api/admin/reservations/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setReservation(data);
        setCarId(data.carId);
        setUserId(data.userId);
        setStartTime(new Date(data.startTime).toISOString().slice(0, 16));
        setEndTime(new Date(data.endTime).toISOString().slice(0, 16));
        setStatus(data.status);
      } else {
        setError('予約の取得に失敗しました。');
      }
    } catch (error) {
      setError('予約の取得中にエラーが発生しました。');
    }
  };

  const fetchCars = async () => {
    const response = await fetch('/api/admin/cars');
    const data = await response.json();
    setCars(data);
  };

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users');
    const data = await response.json();
    setUsers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/reservations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          userId,
          startTime,
          endTime,
          status,
        }),
      });

      if (response.ok) {
        router.push('/admin/reservations');
      } else {
        const data = await response.json();
        setError(data.message || '予約の更新に失敗しました。');
      }
    } catch (error) {
      setError('予約の更新中にエラーが発生しました。');
    }
  };

  const handleDelete = async () => {
    if (confirm('本当にこの予約を削除しますか？')) {
      try {
        const response = await fetch(`/api/admin/reservations/${params.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/admin/reservations');
        } else {
          const data = await response.json();
          setError(data.message || '予約の削除に失敗しました。');
        }
      } catch (error) {
        setError('予約の削除中にエラーが発生しました。');
      }
    }
  };

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN')) {
    return <div>アクセスが拒否されました。</div>;
  }

  if (!reservation) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">予約詳細</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="carId" className="block text-sm font-medium text-gray-700">
            車両
          </label>
          <select
            id="carId"
            value={carId}
            onChange={(e) => setCarId(e.target.value)}
            required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
            ユーザー
          </label>
          <select
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            開始時間
          </label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            終了時間
          </label>
          <input
            type="datetime-local"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            ステータス
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="PENDING">保留中</option>
            <option value="ACTIVE">利用中</option>
            <option value="COMPLETED">完了</option>
            <option value="CANCELLED">キャンセル</option>
          </select>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
        <div className="flex justify-between">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            更新
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            削除
          </button>
        </div>
      </form>
    </div>
  );
}