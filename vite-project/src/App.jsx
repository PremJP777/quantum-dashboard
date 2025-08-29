
    import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BackendGrid from './components/BackendGrid';
import JobsTable from './components/JobsTable';
import Statistics from './components/Statistics';
import Charts from './components/Charts';
import { Activity, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [backendsData, setBackendsData] = useState(null);
  const [jobsData, setJobsData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      
      const [backendsResponse, jobsResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard-data`),
        fetch(`${API_BASE_URL}/jobs`),
        fetch(`${API_BASE_URL}/statistics`)
      ]);

      if (!backendsResponse.ok || !jobsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const backends = await backendsResponse.json();
      const jobs = await jobsResponse.json();
      const stats = await statsResponse.json();

      setBackendsData(backends);
      setJobsData(jobs);
      setStatsData(stats);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST'
      });
      if (response.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Quantum Dashboard...</h2>
          <p className="text-gray-500 mt-2">Connecting to IBM Quantum Network</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        lastUpdate={lastUpdate} 
        onRefresh={refreshData}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        <Statistics data={statsData} />
        
        {/* Backend Status Grid */}
        <BackendGrid data={backendsData} />
        
        {/* Charts Section */}
        <Charts 
          backendsData={backendsData} 
          statsData={statsData} 
        />
        
        {/* Recent Jobs Table */}
        <JobsTable data={jobsData} />
      </main>
    </div>
  );
}

export default App;

