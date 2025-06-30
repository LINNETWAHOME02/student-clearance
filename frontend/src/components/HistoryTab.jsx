import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';
import { StaffStatCard } from './StatCard';
import HistoryModal from './HistoryModal';

const HistoryTab = ({
  requests = [],
  onExportHistory,
  userRole = 'staff'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const isStudent = userRole === 'student';
  const completedRequests = requests.filter(
    (req) => req.status === 'approved' || req.status === 'rejected'
  );

  const filteredHistory = completedRequests.filter((req) => {
    const matchesSearch =
      req.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.type === typeFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const requestDate = new Date(req.date);
      const now = new Date();

      switch (dateFilter) {
        case 'today':
          matchesDate = requestDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          matchesDate = requestDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
          );
          matchesDate = requestDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }
    }

    return (isStudent ? true : matchesSearch) && matchesStatus && matchesType && matchesDate;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'student':
        aValue = a.student.name.toLowerCase();
        bValue = b.student.name.toLowerCase();
        break;
      case 'type':
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a.date;
        bValue = b.date;
    }

    return sortOrder === 'asc'
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  const getStats = () => {
    const total = completedRequests.length;
    const approved = completedRequests.filter(
      (req) => req.status === 'approved'
    ).length;
    const rejected = completedRequests.filter(
      (req) => req.status === 'rejected'
    ).length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return [
      {
        title: 'Total Completed',
        value: total,
        icon: FileText,
        trend: '+10%',
        trendUp: true,
        color: 'blue'
      },
      {
        title: 'Approved',
        value: approved,
        icon: CheckCircle,
        trend: '+12%',
        trendUp: true,
        color: 'green'
      },
      {
        title: 'Rejected',
        value: rejected,
        icon: XCircle,
        trend: '-5%',
        trendUp: false,
        color: 'red'
      },
      {
        title: 'Approval Rate',
        value: `${approvalRate}%`,
        icon: Clock,
        trend: approvalRate >= 50 ? '+High' : '-Low',
        trendUp: approvalRate >= 50,
        color: 'yellow'
      }
    ];
  };

  const stats = getStats();

  const studentName = completedRequests[0]?.student?.name || 'Your';

  return (
    <div className="space-y-6">
      {userRole === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StaffStatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendUp={stat.trendUp}
              color={stat.color}
            />
          ))}
        </div>
      )}

      {/* Filters / Title */}
      {isStudent ? (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{studentName}'s Clearance History</h2>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by student name, ID, or request type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Types</option>
                {[...new Set(completedRequests.map((req) => req.type))].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              <button
                onClick={() => onExportHistory && onExportHistory(filteredHistory)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Clearance History
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {sortedHistory.length} of {completedRequests.length} completed requests
          </p>
        </div>

        {sortedHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {!isStudent && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedHistory.map((request, idx) => (
                  <tr key={idx}>
                    {!isStudent && (
                      <td className="px-6 py-4 whitespace-nowrap">{request.student.name}</td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">{request.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(request.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No History Found</h3>
            <p className="text-gray-600">
              {completedRequests.length === 0
                ? 'No completed requests yet.'
                : 'No requests match your current filters.'}
            </p>
          </div>
        )}
      </div>

      <HistoryModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        userRole={userRole}
      />
    </div>
  );
};

export default HistoryTab;