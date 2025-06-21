import React from 'react';
import Sidebar from '../components/SideBar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;