import React, { useEffect, useState } from 'react';
import Layout from '../../layout/Layout';
import HistoryTab from '../../components/HistoryTab';
import { useAuth } from '../../context/AuthProvider';

const StudentHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/clearance/student-history/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Unknown error occurred");
        }

        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Error fetching student history:", err);
      }
    };


    if (user?.role === 'student') fetchHistory();
  }, [user]);

  return (
    <Layout>
      <div className="p-6">
        <HistoryTab requests={history} userRole="student" />
      </div>
    </Layout>
  );
};

export default StudentHistory;