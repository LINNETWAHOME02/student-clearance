import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { Search, FileText } from 'lucide-react';
import Layout from '../../layout/Layout';
import RequestCard from '../../components/RequestCard';
import RequestModal from '../../components/RequestModal';

const ViewRequests = () => {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // pending requests by default, but staff will still be able to switch to view past ones via the dropdown
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:8000/clearance/assigned-requests/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assigned requests.');
      }

      const data = await response.json();
      console.log('Fetched requests:', data);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);


  const userClearanceType = typeof user?.clearance_type === 'string'
  ? user.clearance_type.toLowerCase()
  : 'all';

  const filteredRequestsByType = useMemo(() => {
    return userClearanceType === 'all' 
      ? requests 
      : requests.filter(req => {
          const requestType = req.type?.toLowerCase()?.replace(' clearance', '') || '';
          return requestType === userClearanceType.toLowerCase();
        });
  }, [requests, userClearanceType]);

  const filteredRequests = useMemo(() => {
    return filteredRequestsByType.filter(req => {
      const matchesSearch = (
        (req.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.student?.id_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.type || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
  }, [filteredRequestsByType, searchTerm, statusFilter]);

  const handleApproveRequest = async (requestId, comment = '') => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/clearance/update-request/${requestId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'approved',
          remarks: comment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve request');
      }

      await fetchRequests(); // to refresh request list
      setNotifications(prev => [...prev, { id: Date.now(), type: 'success', message: 'Request approved successfully' }]);
    } catch (error) {
      console.error('Approve error:', error);
      setNotifications(prev => [...prev, { id: Date.now(), type: 'error', message: error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/clearance/update-request/${requestId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'rejected',
          remarks: reason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject request');
      }

      await fetchRequests(); // to refresh request list
      setNotifications(prev => [...prev, { id: Date.now(), type: 'info', message: 'Request rejected with feedback' }]);
    } catch (error) {
      console.error('Reject error:', error);
      setNotifications(prev => [...prev, { id: Date.now(), type: 'error', message: error.message }]);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Manage Requests</h1>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by student name, ID, or request type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
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

          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onViewRequest={() => handleViewRequest(request)}
              />
            ))}
            {filteredRequests.length === 0 && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>

        {showRequestModal && selectedRequest && (
          <RequestModal
            request={selectedRequest}
            onClose={handleCloseModal}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            isLoading={isLoading}
          />
        )}

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

export default ViewRequests;