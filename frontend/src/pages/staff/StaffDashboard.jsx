import React from 'react';
import Layout from '../../layout/Layout';
import CustomBanner from '../../components/CustomBanner';

const StaffDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-center py-2">
            <h1 className="text-2xl font-bold text-gray-800">Welcome to Staff Dashboard</h1>
            {/* <p className="text-gray-600 mt-2">Use the tabs or sidebar to manage requests and view student information.</p> */}
          </div>
          <CustomBanner />
        </div>
      </Layout>
    </div>
  );
};

export default StaffDashboard;