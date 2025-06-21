import React from 'react';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
import RequestCard from './RequestCard';

const OverviewTab = ({ requests=[], students=[], onViewRequest, setActiveTab }) => {
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedToday = requests.filter(r => 
    r.status === 'approved' && r.date === new Date().toISOString().split('T')[0]
  );
  const highPriorityPending = requests.filter(r => 
    r.priority === 'high' && r.status === 'pending'
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={students.length}
          subtitle="Under supervision"
          icon={Users}
          color="text-blue-600"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting review"
          icon={Clock}
          color="text-yellow-600"
        />
        <StatCard
          title="Approved Today"
          value={approvedToday.length}
          subtitle="Completed clearances"
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatCard
          title="High Priority"
          value={highPriorityPending.length}
          subtitle="Needs attention"
          icon={AlertCircle}
          color="text-red-600"
        />
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {requests.slice(0, 3).map(request => (
            <RequestCard 
              key={request.id} 
              request={request} 
              onViewRequest={onViewRequest}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;