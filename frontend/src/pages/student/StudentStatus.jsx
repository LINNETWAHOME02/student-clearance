import React, { useEffect, useState } from 'react';
import Layout from '../../layout/Layout';
import RequestCard from '../../components/RequestCard';
import { useAuth } from '../../context/AuthProvider';

const StudentStatus = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStudentRequests = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:8000/clearance/my-requests/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRequests(data || []);
      } catch (err) {
        console.error('Error fetching student requests:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentRequests();
  }, []);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-center text-3xl font-bold text-gray-800">Pending Clearance Requests</h1>
        {requests.length === 0 ? (
          <p className="text-gray-600">No requests found.</p>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <RequestCard key={request.id} request={request} hideActions />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentStatus;