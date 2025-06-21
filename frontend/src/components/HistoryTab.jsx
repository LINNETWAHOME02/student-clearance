import React, { useState } from 'react';
import { 
  Calendar, 
  Filter, 
  Search, 
  Download, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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
  const [expandedRequest, setExpandedRequest] = useState(null);

  // Filter completed requests (approved/rejected)
  const completedRequests = requests.filter(req => 
    req.status === 'approved' || req.status === 'rejected'
  );

  // Apply filters
  const filteredHistory = completedRequests.filter(req => {
    const matchesSearch = req.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.type === typeFilter;
    
    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const requestDate = new Date(req.date);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = requestDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = requestDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = requestDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Sort requests
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
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleRequestExpanded = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const getUniqueTypes = () => {
    const types = [...new Set(completedRequests.map(req => req.type))];
    return types;
  };

  const getStats = () => {
    const total = completedRequests.length;
    const approved = completedRequests.filter(req => req.status === 'approved').length;
    const rejected = completedRequests.filter(req => req.status === 'rejected').length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    
    return { total, approved, rejected, approvalRate };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-blue-600">{stats.approvalRate}%</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
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
          
          {/* Filters */}
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
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>{type}</option>
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

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Clearance History</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {sortedHistory.length} of {completedRequests.length} completed requests
          </p>
        </div>
        
        {sortedHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('student')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Student
                      {sortBy === 'student' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Type
                      {sortBy === 'type' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Date
                      {sortBy === 'date' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Status
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedHistory.map((request) => (
                  <React.Fragment key={request.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.student.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.student.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.type}</div>
                        <div className="text-xs text-gray-500">{request.student.course}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleRequestExpanded(request.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          {expandedRequest === request.id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedRequest === request.id && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Student Details</h4>
                                <div className="text-sm space-y-1">
                                  <p><span className="text-gray-500">Email:</span> {request.student.email}</p>
                                  <p><span className="text-gray-500">Department:</span> {request.student.department}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                                <div className="text-sm space-y-1">
                                  <p><span className="text-gray-500">Priority:</span> 
                                    <span className={`ml-1 capitalize ${
                                      request.priority === 'high' ? 'text-red-600' :
                                      request.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                      {request.priority}
                                    </span>
                                  </p>
                                  <p><span className="text-gray-500">Documents:</span> {request.documents.length} files</p>
                                </div>
                              </div>
                            </div>
                            
                            {request.comments.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
                                <div className="space-y-2">
                                  {request.comments.map((comment, index) => (
                                    <div key={index} className="bg-white p-3 rounded border">
                                      <p className="text-sm text-gray-900">{comment.text}</p>
                                      <p className="text-xs text-gray-500 mt-1">{comment.date}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
                ? "No completed requests yet." 
                : "No requests match your current filters."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTab;