import React, { useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(navigate, 'staff');
  };

  const handleEditProfile = () => {
    // Navigate to profile edit page or show profile modal
    navigate('/staff/profile');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {getInitials(user?.first_name, user?.last_name)}
          </span>
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-semibold text-gray-900">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {getInitials(user?.first_name, user?.last_name)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400">{user?.department}</p>
              </div>
            </div>
          </div>
          
          <div className="py-2">
            <button
              onClick={handleEditProfile}
              className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Edit Profile</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;