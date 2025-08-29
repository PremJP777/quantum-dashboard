import React from 'react';
import { BarChart3, TrendingUp, Activity, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
};

const Statistics = ({ data }) => {
  if (!data) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalJobs = data.total_jobs || 0;
  const statusDistribution = data.status_distribution || {};
  const backendDistribution = data.backend_distribution || {};
  
  const runningJobs = statusDistribution['RUNNING'] || 0;
  const queuedJobs = statusDistribution['QUEUED'] || 0;
  const completedJobs = statusDistribution['DONE'] || 0;
  
  const mostUsedBackend = Object.entries(backendDistribution)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          icon={BarChart3}
          color="blue"
          subtitle="Last 50 jobs tracked"
        />
        
        <StatCard
          title="Running Jobs"
          value={runningJobs}
          icon={Activity}
          color="green"
          subtitle="Currently executing"
        />
        
        <StatCard
          title="Queued Jobs"
          value={queuedJobs}
          icon={Clock}
          color="yellow"
          subtitle="Waiting in queue"
        />
        
        <StatCard
          title="Completed Jobs"
          value={completedJobs}
          icon={TrendingUp}
          color="purple"
          subtitle="Successfully finished"
        />
      </div>
      
      {mostUsedBackend && (
        <div className="mt-6 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Most Active Backend</h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">{mostUsedBackend[0]}</span>
            <span className="badge badge-blue">{mostUsedBackend[1]} jobs</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
