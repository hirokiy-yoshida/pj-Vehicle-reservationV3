'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewReservation() {
  const [carId, setCarId] = useState('');
  const [userId, setUserId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCars();
    fetchUsers();

    const carIdParam = searchParams.get('carId');
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');

    if (carIdParam) setCarId(carIdParam);
    if (dateParam && timeParam) {
      const startDateTime = new Date(`${dateParam}T${timeParam}`);
      setStartTime(startDateTime.toISOString().slice(0, 16));
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1);
      setEndTime(endDateTime.toISOString().slice(0, 16));
    }
  }, []);

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
      const response = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          userId,
          startTime,
          endTime,
        }),
      });

      if (response.ok) {
        router.push('/admin/reservations');
      } else {
        const data = await response.json();
        setError(data.message || '予約の作成に失敗しました。');
      }
    } catch (error) {
      setError('予約の作成中にエラーが発生しました。');
    }
  };

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN')) {
    return <div>アクセスが拒否されました。</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">新規予約作成</h1>
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
            <option value="">車両を選択してください</option>
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
            <option value="">ユーザーを選択してください</option>
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
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            予約を作成
          </button>
        </div>
      </form>
    </div>
  );
}