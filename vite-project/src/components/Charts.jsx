import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChart3, PieChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Charts = ({ backendsData, statsData }) => {
  if (!backendsData || !statsData) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="card">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Backend Queue Chart Data
  const backendChartData = {
    labels: backendsData.backends
      ?.filter(b => !b.error && b.operational)
      ?.map(b => b.name) || [],
    datasets: [
      {
        label: 'Pending Jobs',
        data: backendsData.backends
          ?.filter(b => !b.error && b.operational)
          ?.map(b => b.pending_jobs) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const backendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Queue Load by Backend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Status Distribution Chart Data
  const statusData = statsData.status_distribution || {};
  const statusChartData = {
    labels: Object.keys(statusData),
    datasets: [
      {
        data: Object.values(statusData),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green for DONE
          'rgba(59, 130, 246, 0.8)',  // Blue for RUNNING
          'rgba(245, 158, 11, 0.8)',  // Yellow for QUEUED
          'rgba(239, 68, 68, 0.8)',   // Red for ERROR
          'rgba(156, 163, 175, 0.8)', // Gray for others
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Job Status Distribution',
      },
    },
  };

  // Backend Usage Chart Data
  const backendUsageData = statsData.backend_distribution || {};
  const backendUsageChartData = {
    labels: Object.keys(backendUsageData),
    datasets: [
      {
        label: 'Jobs Count',
        data: Object.values(backendUsageData),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
      },
    ],
  };

  const backendUsageChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Backend Usage Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Backend Queue Chart */}
        <div className="card">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Queue Load</h3>
          </div>
          <div className="h-64">
            <Bar data={backendChartData} options={backendChartOptions} />
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="card">
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Job Status</h3>
          </div>
          <div className="h-64">
            <Doughnut data={statusChartData} options={statusChartOptions} />
          </div>
        </div>
      </div>

      {/* Backend Usage Chart */}
      <div className="card">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Backend Usage</h3>
        </div>
        <div className="h-64">
          <Bar data={backendUsageChartData} options={backendUsageChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Charts;
