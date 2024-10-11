'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [cars, setCars] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: session } = useSession();

  useEffect(() => {
    fetchReservations();
    fetchCars();
    fetchMaintenances();
  }, [selectedDate]);

  const fetchReservations = async () => {
    const response = await fetch(`/api/admin/reservations?date=${selectedDate}`);
    const data = await response.json();
    setReservations(data);
  };

  const fetchCars = async () => {
    const response = await fetch('/api/admin/cars');
    const data = await response.json();
    setCars(data);
  };

  const fetchMaintenances = async () => {
    const response = await fetch(`/api/admin/maintenance?date=${selectedDate}`);
    const data = await response.json();
    setMaintenances(data);
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const isSlotAvailable = (carId, timeSlot) => {
    const hour = parseInt(timeSlot.split(':')[0]);
    const slotStart = new Date(selectedDate);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotEnd.getHours() + 1);

    const hasReservation = reservations.some(reservation => 
      reservation.carId === carId &&
      new Date(reservation.startTime) < slotEnd &&
      new Date(reservation.endTime) > slotStart
    );

    const hasMaintenance = maintenances.some(maintenance => 
      maintenance.carId === carId &&
      new Date(maintenance.startTime) < slotEnd &&
      new Date(maintenance.endTime) > slotStart
    );

    return !hasReservation && !hasMaintenance;
  };

  const getReservationForSlot = (carId, timeSlot) => {
    return reservations.find(reservation => 
      reservation.carId === carId &&
      new Date(reservation.startTime).getHours() <= parseInt(timeSlot.split(':')[0]) &&
      new Date(reservation.endTime).getHours() > parseInt(timeSlot.split(':')[0])
    );
  };

  const getMaintenanceForSlot = (carId, timeSlot) => {
    return maintenances.find(maintenance => 
      maintenance.carId === carId &&
      new Date(maintenance.startTime).getHours() <= parseInt(timeSlot.split(':')[0]) &&
      new Date(maintenance.endTime).getHours() > parseInt(timeSlot.split(':')[0])
    );
  };

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN')) {
    return <div>アクセスが拒否されました。</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">予約管理</h1>
      <div className="mb-4">
        <label htmlFor="date" className="mr-2">日付:</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                車両 / 時間
              </th>
              {timeSlots.map(slot => (
                <th key={slot} className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cars.map(car => (
              <tr key={car.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {car.name}
                </td>
                {timeSlots.map(slot => {
                  const reservation = getReservationForSlot(car.id, slot);
                  const maintenance = getMaintenanceForSlot(car.id, slot);
                  const isAvailable = isSlotAvailable(car.id, slot);
                  return (
                    <td key={`${car.id}-${slot}`} className={`px-6 py-4 whitespace-no-wrap border-b border-gray-500 ${isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
                      {reservation ? (
                        <Link href={`/admin/reservations/${reservation.id}`} className="text-blue-600 hover:text-blue-900">
                          予約済
                        </Link>
                      ) : maintenance ? (
                        <span className="text-yellow-600">メンテナンス中</span>
                      ) : (
                        <Link href={`/admin/reservations/new?carId=${car.id}&date=${selectedDate}&time=${slot}`} className="text-green-600 hover:text-green-900">
                          予約可能
                        </Link>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}