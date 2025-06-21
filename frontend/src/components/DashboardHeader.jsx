import React from 'react';
import { RefreshCw, Download } from 'lucide-react';
import UserMenu from './UserMenu';

const DashboardHeader = ({ activeTab, setActiveTab, onRefresh, onExport }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'requests', label: 'View Requests' },
    { id: 'students', label: 'All Students' },
    { id: 'history', label: 'History' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600">Manage student clearance requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={onExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <UserMenu />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex space-x-8 mt-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardHeader;