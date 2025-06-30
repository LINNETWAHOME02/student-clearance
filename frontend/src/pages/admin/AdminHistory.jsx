import React, { useEffect, useState } from 'react';
import HistoryTab from '../../components/HistoryTab';
import Layout from '../../layout/Layout';
import { useAuth } from '../../context/AuthProvider';
import { useParams } from 'react-router-dom';

const AdminHistory = () => {
  const { user } = useAuth();
  const { tab } = useParams(); // 'students', 'staff', or 'admin'
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user || !tab) return;

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8000/clearance/history/${tab}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${tab} history`);
        }

        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error(`Error loading ${tab} history:`, error);
      }
    };

    fetchHistory();
  }, [user, tab]);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 capitalize">
          {tab === 'admin' ? 'My Activity History' : `${tab} Clearance History`}
        </h1>
        <HistoryTab requests={requests} userRole="admin" />
      </div>
    </Layout>
  );
};

export default AdminHistory;