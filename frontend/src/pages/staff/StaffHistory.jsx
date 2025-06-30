import React, { useEffect, useState } from 'react';
import Layout from '../../layout/Layout';
import HistoryTab from '../../components/HistoryTab';
import { useAuth } from '../../context/AuthProvider';
import { CheckCircle, XCircle } from 'lucide-react';

const StaffHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHandledRequests = async () => {
      try {
        const res = await fetch(`http://localhost:8000/clearance/staff-history/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const data = await res.json();
        if (res.ok) setHistory(data);
        else console.error(data.error || 'Failed to fetch staff history.');
      } catch (err) {
        console.error("Error fetching staff history:", err);
      }
    };

    if (user?.role === 'staff') fetchHandledRequests();
  }, [user]);

  const handleExport = (filteredHistory) => {
    const csvContent = [
      ['Student Name', 'ID Number', 'Type', 'Date', 'Status'],
      ...filteredHistory.map(req => [
        req.student.name,
        req.student.id_number,
        req.type,
        new Date(req.date).toLocaleDateString(),
        req.status
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Clearance_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-center text-2xl font-bold mb-6">Clearance Request History</h2>

        {/* Request History Table */}
        <HistoryTab
          requests={history}
          userRole="staff"
          onExportHistory={handleExport}
        />
      </div>
    </Layout>
  );
};

export default StaffHistory;