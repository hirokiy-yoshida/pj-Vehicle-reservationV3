'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';
import Button from '../../../components/Button';

export default function ReservationDetail({ params }: { params: { id: string } }) {
  const [reservation, setReservation] = useState(null);
  const [startMileage, setStartMileage] = useState('');
  const [endMileage, setEndMileage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchReservation();
  }, []);

  const fetchReservation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reservations/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setReservation(data);
        setStartMileage(data.startMileage?.toString() || '');
        setEndMileage(data.endMileage?.toString() || '');
      } else {
        setError('予約の取得に失敗しました。');
      }
    } catch (error) {
      setError('予約の取得中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartReservation = async () => {
    if (!startMileage) {
      setError('開始時の走行距離を入力してください。');
      return;
    }

    try {
      const response = await fetch(`/api/reservations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ACTIVE',
          startMileage: parseInt(startMileage),
        }),
      });

      if (response.ok) {
        const updatedReservation = await response.json();
        setReservation(updatedReservation);
        setError('');
      } else {
        const data = await response.json();
        setError(data.message || '予約の開始に失敗しました。');
      }
    } catch (error) {
      setError('予約の開始中にエラーが発生しました。');
    }
  };

  const handleEndReservation = async () => {
    if (!endMileage) {
      setError('終了時の走行距離を入力してください。');
      return;
    }

    if (parseInt(endMileage) <= parseInt(startMileage)) {
      setError('終了時の走行距離は開始時の走行距離より大きい必要があります。');
      return;
    }

    try {
      const response = await fetch(`/api/reservations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          endMileage: parseInt(endMileage),
        }),
      });

      if (response.ok) {
        const updatedReservation = await response.json();
        setReservation(updatedReservation);
        setError('');
      } else {
        const data = await response.json();
        setError(data.message || '予約の終了に失敗しました。');
      }
    } catch (error) {
      setError('予約の終了中にエラーが発生しました。');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!reservation) {
    return <ErrorMessage message="予約が見つかりません。" />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">予約詳細</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            予約情報
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">車両</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{reservation.car.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">開始時間</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(reservation.startTime).toLocaleString()}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">終了時間</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(reservation.endTime).toLocaleString()}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ステータス</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{reservation.status}</dd>
            </div>
          </dl>
        </div>
      </div>

      {reservation.status === 'PENDING' && (
        <div className="mt-4">
          <label htmlFor="startMileage" className="block text-sm font-medium text-gray-700">
            開始時の走行距離 (km)
          </label>
          <input
            type="number"
            id="startMileage"
            value={startMileage}
            onChange={(e) => setStartMileage(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <Button onClick={handleStartReservation} className="mt-2">
            利用開始
          </Button>
        </div>
      )}

      {reservation.status === 'ACTIVE' && (
        <div className="mt-4">
          <label htmlFor="endMileage" className="block text-sm font-medium text-gray-700">
            終了時の走行距離 (km)
          </label>
          <input
            type="number"
            id="endMileage"
            value={endMileage}
            onChange={(e) => setEndMileage(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <Button onClick={handleEndReservation} className="mt-2">
            利用終了
          </Button>
        </div>
      )}

      {error && <ErrorMessage message={error} />}
    </div>
  );
}