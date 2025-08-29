import React from 'react';
import { RefreshCw, Cpu, Zap } from 'lucide-react';

const Header = ({ lastUpdate, onRefresh }) => {
  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                Quantum Jobs Tracker
              </h1>
            </div>
            <span className="badge badge-blue">AQVH915</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span>Last updated: {formatTime(lastUpdate)}</span>
            </div>
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <div className="pb-4">
          <p className="text-gray-600">
            Real-time monitoring of IBM Quantum computing jobs and backend status
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
