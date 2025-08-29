import React from 'react';
import { Server, Clock, AlertTriangle, CheckCircle, Users, Cpu } from 'lucide-react';

const BackendCard = ({ backend }) => {
  const getStatusIcon = () => {
    if (backend.error) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    return backend.operational ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <AlertTriangle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (backend.error) {
      return <span className="badge badge-red">Error</span>;
    }
    return backend.operational ? 
      <span className="badge badge-green">Operational</span> : 
      <span className="badge badge-red">Down</span>;
  };

  if (backend.error) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{backend.name}</h3>
          {getStatusIcon()}
        </div>
        <div className="text-red-600 text-sm">
          {backend.error}
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{backend.name}</h3>
        {getStatusIcon()}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          {getStatusBadge()}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Qubits:</span>
          <span className="font-medium">{backend.num_qubits || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Queue:</span>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{backend.pending_jobs}</span>
          </div>
        </div>
        
        {backend.estimated_wait_formatted && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Est. Wait:</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{backend.estimated_wait_formatted}</span>
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Version: {typeof backend.version === 'object' ? JSON.stringify(backend.version) : (backend.version || 'N/A')}</span>
            <span>{typeof backend.processor_type === 'object' ? JSON.stringify(backend.processor_type) : (backend.processor_type || 'N/A')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BackendGrid = ({ data }) => {
  if (!data || !data.backends) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Backend Status</h2>
        <div className="card">
          <p className="text-gray-600">Loading backend data...</p>
        </div>
      </div>
    );
  }

  const operationalCount = data.backends.filter(b => b.operational && !b.error).length;
  const totalCount = data.backends.length;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Backend Status</h2>
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600">
            {operationalCount}/{totalCount} Operational
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.backends.map((backend, index) => (
          <BackendCard key={backend.name || index} backend={backend} />
        ))}
      </div>
    </div>
  );
};

export default BackendGrid;
