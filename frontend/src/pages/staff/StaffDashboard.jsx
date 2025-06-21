import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';

// components
import RequestCard from '../../components/RequestCard';
import RequestModal from '../../components/RequestModal';
import DashboardHeader from '../../components/DashboardHeader';
import UserMenu from '../../components/UserMenu';
import OverviewTab from '../../components/OverviewTab';
import StudentsTab from '../../components/StudentsTab';
import HistoryTab from '../../components/HistoryTab';
import SideBar from '../../components/SideBar';
import Layout from '../../layout/Layout';

// Mock data - replace with actual API calls
const mockRequests = [
  {
    id: 1,
    student: { 
      name: 'John Doe', 
      email: 'john.doe@university.edu', 
      studentId: 'ST001', 
      course: 'Computer Science', 
      department: 'Engineering' 
    },
    type: 'Project Clearance',
    date: '2025-06-15',
    status: 'pending',
    documents: ['project_report.pdf', 'supervisor_approval.pdf'],
    comments: [],
    priority: 'high',
    submittedAt: '2025-06-15T10:30:00Z',
    deadline: '2025-06-20'
  },
  {
    id: 2,
    student: { 
      name: 'Jane Smith', 
      email: 'jane.smith@university.edu', 
      studentId: 'ST002', 
      course: 'Information Technology', 
      department: 'Engineering' 
    },
    type: 'Lab Clearance',
    date: '2025-06-14',
    status: 'pending',
    documents: ['lab_equipment_return.pdf'],
    comments: [{ text: 'Equipment check needed', date: '2025-06-14', author: 'System' }],
    priority: 'medium',
    submittedAt: '2025-06-14T14:20:00Z',
    deadline: '2025-06-18'
  },
  {
    id: 3,
    student: { 
      name: 'Mike Johnson', 
      email: 'mike.j@university.edu', 
      studentId: 'ST003', 
      course: 'Software Engineering', 
      department: 'Engineering' 
    },
    type: 'Library Clearance',
    date: '2025-06-13',
    status: 'approved',
    documents: ['library_clearance.pdf'],
    comments: [],
    priority: 'low',
    submittedAt: '2025-06-13T09:15:00Z',
    approvedAt: '2025-06-13T16:45:00Z',
    approvedBy: 'Dr. Smith'
  },
  {
    id: 4,
    student: { 
      name: 'Sarah Wilson', 
      email: 'sarah.w@university.edu', 
      studentId: 'ST004', 
      course: 'Computer Science', 
      department: 'Engineering' 
    },
    type: 'Project Clearance',
    date: '2025-06-12',
    status: 'rejected',
    documents: ['project_draft.pdf'],
    comments: [{ 
      text: 'Project requirements not met. Please revise and resubmit.', 
      date: '2025-06-12', 
      author: 'Dr. Johnson' 
    }],
    priority: 'medium',
    submittedAt: '2025-06-12T11:00:00Z',
    rejectedAt: '2025-06-12T17:30:00Z',
    rejectedBy: 'Dr. Johnson'
  },
  {
    id: 5,
    student: { 
      name: 'David Brown', 
      email: 'david.b@university.edu', 
      studentId: 'ST005', 
      course: 'Information Technology', 
      department: 'Engineering' 
    },
    type: 'Lab Clearance',
    date: '2025-06-11',
    status: 'approved',
    documents: ['lab_completion.pdf'],
    comments: [],
    priority: 'low',
    submittedAt: '2025-06-11T13:45:00Z',
    approvedAt: '2025-06-11T15:20:00Z',
    approvedBy: 'Dr. Wilson'
  }
];

const mockStudents = [
  { 
    id: 1, 
    name: 'John Doe', 
    studentId: 'ST001', 
    course: 'Computer Science', 
    year: '4th Year', 
    status: 'active',
    email: 'john.doe@university.edu',
    department: 'Engineering',
    phone: '+1234567890',
    enrollmentDate: '2022-09-01',
    clearanceStatus: { project: 'pending', lab: 'approved', library: 'approved' }
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    studentId: 'ST002', 
    course: 'Information Technology', 
    year: '3rd Year', 
    status: 'active',
    email: 'jane.smith@university.edu',
    department: 'Engineering',
    phone: '+1234567891',
    enrollmentDate: '2023-09-01',
    clearanceStatus: { project: 'approved', lab: 'pending', library: 'approved' }
  },
  { 
    id: 3, 
    name: 'Mike Johnson', 
    studentId: 'ST003', 
    course: 'Software Engineering', 
    year: '4th Year', 
    status: 'cleared',
    email: 'mike.j@university.edu',
    department: 'Engineering',
    phone: '+1234567892',
    enrollmentDate: '2022-09-01',
    clearanceStatus: { project: 'approved', lab: 'approved', library: 'approved' }
  },
  { 
    id: 4, 
    name: 'Sarah Wilson', 
    studentId: 'ST004', 
    course: 'Computer Science', 
    year: '4th Year', 
    status: 'active',
    email: 'sarah.w@university.edu',
    department: 'Engineering',
    phone: '+1234567893',
    enrollmentDate: '2022-09-01',
    clearanceStatus: { project: 'rejected', lab: 'approved', library: 'approved' }
  },
  { 
    id: 5, 
    name: 'David Brown', 
    studentId: 'ST005', 
    course: 'Information Technology', 
    year: '3rd Year', 
    status: 'cleared',
    email: 'david.b@university.edu',
    department: 'Engineering',
    phone: '+1234567894',
    enrollmentDate: '2023-09-01',
    clearanceStatus: { project: 'approved', lab: 'approved', library: 'approved' }
  }
];

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState(mockRequests);
  const [students, setStudents] = useState(mockStudents);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  const { user, logout } = useAuth();

  // Get user's clearance type and filter requests accordingly
  const userClearanceType = user?.clearance_type || 'all';
  const filteredRequestsByType = userClearanceType === 'all' 
    ? requests 
    : requests.filter(req => {
        const requestType = req.type?.toLowerCase()?.replace(' clearance', '') || '';
        const clearanceType = typeof userClearanceType === 'string' 
          ? userClearanceType.toLowerCase() 
          : '';
        return requestType === clearanceType;
      });

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalRequests = filteredRequestsByType.length;
    const pendingRequests = filteredRequestsByType.filter(req => req.status === 'pending').length;
    const approvedRequests = filteredRequestsByType.filter(req => req.status === 'approved').length;
    const rejectedRequests = filteredRequestsByType.filter(req => req.status === 'rejected').length;
    const urgentRequests = filteredRequestsByType.filter(req => 
      req.priority === 'high' && req.status === 'pending'
    ).length;

    return [
      {
        title: 'Total Requests',
        value: totalRequests,
        icon: 'FileText',
        trend: '+12%',
        trendUp: true,
        color: 'blue'
      },
      {
        title: 'Pending',
        value: pendingRequests,
        icon: 'Clock',
        trend: '+8%',
        trendUp: true,
        color: 'yellow'
      },
      {
        title: 'Approved',
        value: approvedRequests,
        icon: 'CheckCircle',
        trend: '+15%',
        trendUp: true,
        color: 'green'
      },
      {
        title: 'Urgent',
        value: urgentRequests,
        icon: 'AlertTriangle',
        trend: '-3%',
        trendUp: false,
        color: 'red'
      }
    ];
  }, [filteredRequestsByType]);

  // Load initial data
  useEffect(() => {
    // Simulate loading initial data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Event handlers
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleEditProfile = () => {
    // Redirect to profile edit page
    window.location.href = '/profile/edit';
  };

  const handleApproveRequest = async (requestId) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { 
            ...req, 
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: user?.name || 'Current User'
          } : req
        )
      );

      // Add notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'Request approved successfully'
      }]);
    } catch (error) {
      console.error('Failed to approve request:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to approve request'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { 
            ...req, 
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectedBy: user?.name || 'Current User',
            comments: [...req.comments, { 
              text: reason, 
              date: new Date().toISOString().split('T')[0],
              author: user?.name || 'Current User'
            }]
          } : req
        )
      );

      // Add notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: 'Request rejected with feedback'
      }]);
    } catch (error) {
      console.error('Failed to reject request:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to reject request'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleCloseModal = () => {
    setShowRequestModal(false);
    setSelectedRequest(null);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to refresh data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch fresh data from the API
      // For now, we'll just simulate a refresh
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'Data refreshed successfully'
      }]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to refresh data'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    try {
      // Create CSV content
      const csvContent = [
        ['ID', 'Student Name', 'Student ID', 'Type', 'Status', 'Date', 'Priority'],
        ...filteredRequestsByType.map(req => [
          req.id,
          req.student.name,
          req.student.studentId,
          req.type,
          req.status,
          req.date,
          req.priority
        ])
      ].map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clearance_requests_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'Data exported successfully'
      }]);
    } catch (error) {
      console.error('Export failed:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Export failed'
      }]);
    }
  };

  const handleExportHistory = (historyData) => {
    try {
      const csvContent = [
        ['ID', 'Student Name', 'Type', 'Status', 'Date', 'Action By'],
        ...historyData.map(item => [
          item.id,
          item.student?.name,
          item.type,
          item.status,
          item.date,
          item.approvedBy || item.rejectedBy || 'System'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clearance_history_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'History exported successfully'
      }]);
    } catch (error) {
      console.error('History export failed:', error);
    }
  };

  const handleContactStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      // In a real app, this might open an email client or internal messaging system
      window.location.href = `mailto:${student.email}?subject=University Clearance Inquiry`;
    }
  };

  const handleViewStudent = (studentId) => {
    // In a real app, this might navigate to a detailed student view
    console.log('Viewing student details for ID:', studentId);
    const student = students.find(s => s.id === studentId);
    if (student) {
      alert(`Student Details:\nName: ${student.name}\nID: ${student.studentId}\nCourse: ${student.course}\nYear: ${student.year}`);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'requests', label: 'View Requests' },
    { id: 'students', label: 'All Students' },
    { id: 'history', label: 'History' }
  ];

  // Filter requests for the requests tab
  const filteredRequests = filteredRequestsByType.filter(req => {
    const matchesSearch = req.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render requests tab content
  const renderRequestsTab = () => (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by student name, ID, or request type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map(request => (
          <RequestCard 
            key={request.id} 
            request={request} 
            onView={() => handleViewRequest(request)}
            onApprove={() => handleApproveRequest(request.id)}
            onReject={(reason) => handleRejectRequest(request.id, reason)}
            isLoading={isLoading}
          />
        ))}
        {filteredRequests.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        {/* User Menu */}
      {showUserMenu && (
        <UserMenu
          user={user}
          onEditProfile={handleEditProfile}
          onLogout={handleLogout}
          onClose={() => setShowUserMenu(false)}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            requests={filteredRequestsByType}
            students={students}
            onViewRequest={handleViewRequest}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'requests' && renderRequestsTab()}

        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            onContactStudent={handleContactStudent}
            onViewStudent={handleViewStudent}
            userClearanceType={userClearanceType}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            requests={filteredRequestsByType.filter(req => req.status !== 'pending')}
            onExportHistory={handleExportHistory}
            userClearanceType={userClearanceType}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedRequest && (
        <RequestModal
          request={selectedRequest}
          onClose={handleCloseModal}
          onApprove={() => {
            handleApproveRequest(selectedRequest.id);
            handleCloseModal();
          }}
          onReject={(reason) => {
            handleRejectRequest(selectedRequest.id, reason);
            handleCloseModal();
          }}
          isLoading={isLoading}
        />
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {notifications.slice(-3).map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                notification.type === 'success' ? 'bg-green-500 text-white' :
                notification.type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{notification.message}</span>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </Layout>
      
    </div>
  );
};

export default StaffDashboard;