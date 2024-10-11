'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const { data: session } = useSession();
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session && (session.user.role === 'ADMIN' || session.user.role === 'SHOP_ADMIN')) {
      fetchReportData();
    }
  }, [session]);

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/admin/reports');
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        setError('レポートデータの取得に失敗しました。');
      }
    } catch (error) {
      setError('レポートデータの取得中にエラーが発生しました。');
    }
  };

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SHOP_ADMIN')) {
    return <div>アクセスが拒否されました。</div>;
  }

  const reservationsChartData = {
    labels: reportData?.reservationsPerDay.map(item => item.date) || [],
    datasets: [
      {
        label: '日別予約数',
        data: reportData?.reservationsPerDay.map(item => item.count) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const revenueChartData = {
    labels: reportData?.revenuePerMonth.map(item => item.month) || [],
    datasets: [
      {
        label: '月別収益',
        data: reportData?.revenuePerMonth.map(item => item.revenue) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">レポート</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">日別予約数</h2>
            <Bar data={reservationsChartData} />
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">月別収益</h2>
            <Bar data={revenueChartData} />
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">人気の車両</h2>
            <ul>
              {reportData.popularCars.map((car, index) => (
                <li key={index} className="mb-2">
                  {car.name}: {car.reservationCount} 予約
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">利用統計</h2>
            <p>平均利用時間: {reportData.averageUsageTime} 時間</p>
            <p>平均走行距離: {reportData.averageMileage} km</p>
          </div>
        </div>
      )}
    </div>
  );
}