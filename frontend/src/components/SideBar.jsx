import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import {
  LayoutDashboard,
  ChevronDown,
  FilePlus,
  BadgeCheck,
  History,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  Shield
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const roleConfig = {
  student: {
    icon: GraduationCap,
    color: 'from-blue-500 to-blue-600',
    name: 'Student'
  },
  staff: {
    icon: Users,
    color: 'from-green-500 to-green-600',
    name: 'Staff'
  },
  admin: {
    icon: Shield,
    color: 'from-purple-500 to-purple-600',
    name: 'Admin'
  }
};

const sidebarConfig = {
  student: [
    {
      title: 'Request Clearance',
      icon: FilePlus,
      subItems: [
        { label: 'Project Clearance', path: '/student/project-clearance' },
        { label: 'Lab Clearance', path: '/student/lab-clearance' },
        { label: 'Library Clearance', path: '/student/library-clearance' }
      ]
    },
    { title: 'Check Clearance Status', icon: BadgeCheck, path: '/student/status' },
    { title: 'View Clearance History', icon: History, path: '/student/history' }
  ],
  staff: [
    { title: 'All Your Students', icon: Users, path: '/staff/students' },
    { title: 'View Requests', icon: FilePlus, path: '/staff/requests' },
    { title: 'Clear Students', icon: BadgeCheck, path: '/staff/clear' },
    { title: 'View History', icon: History, path: '/staff/history' }
  ],
  admin: [
    {
      title: 'View Department Users',
      icon: Users,
      subItems: [
        { label: 'Students', path: '/admin/users/students' },
        { label: 'Staff', path: '/admin/users/staff' }
      ]
    },
    {
      title: 'Edit User Details',
      icon: Settings,
      subItems: [
        { label: 'Students', path: '/admin/edit/students' },
        { label: 'Staff', path: '/admin/edit/staff' }
      ]
    },
    {
      title: 'Clearance History',
      icon: History,
      subItems: [
        { label: 'Students', path: '/admin/history/students' },
        { label: 'Staff', path: '/admin/history/staff' }
      ]
    }
  ]
};

const SideBar = () => {
  const { user, logout } = useAuth();
  const [sidebarItems, setSidebarItems] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  if (user && user.role) {
    const role = user.role.toLowerCase();
    const config = sidebarConfig[role] || [];
    setSidebarItems(config);

    // To automatically open dropdown if current path matches a subitem
    config.forEach((item, index) => {
      if (item.subItems && item.subItems.some(sub => isActive(sub.path))) {
        setOpenDropdown(index);
      }
    });
  }}, [user, location.pathname]);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const isActive = (path) => location.pathname === path;

  const renderSubItems = (subItems) => {
    return subItems.map((item, idx) => (
      <li
        key={idx}
        onClick={() => navigate(item.path)}
        className={`group ml-8 py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium ${
          isActive(item.path)
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${
            isActive(item.path) ? 'bg-blue-500' : 'bg-gray-400 group-hover:bg-blue-500'
          } transition-colors`}></div>
          {item.label}
        </div>
      </li>
    ));
  };

  const currentRoleConfig = user?.role ? roleConfig[user.role.toLowerCase()] : null;
  const RoleIcon = currentRoleConfig?.icon || GraduationCap;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="../public/logo.png"
              alt="University Logo"
              className="w-12 h-12 rounded-full shadow-lg border-2 border-white"
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${currentRoleConfig?.color || 'from-blue-500 to-blue-600'}
                            rounded-full flex items-center justify-center shadow-lg`}>
              <RoleIcon className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Student Clearance</h2>
            <p className="text-xs text-gray-500 capitalize">
              {currentRoleConfig?.name || user?.role || 'User'} Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {/* Dashboard */}
        <div
          onClick={() => navigate(`/${user?.role?.toLowerCase()}/dashboard`)}
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
            isActive(`/${user?.role?.toLowerCase()}/dashboard`)
              ? 'bg-blue-50 text-blue-700 shadow-sm'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors ${
            isActive(`/${user?.role?.toLowerCase()}/dashboard`) ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
          }`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="font-semibold">Dashboard</span>
        </div>

        {/* Dynamic Items */}
        <div className="space-y-1 mt-6">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon || LayoutDashboard;
            const hasSubItems = item.subItems;
            const isOpen = openDropdown === index;

            return (
              <div key={index}>
                <div
                  onClick={() => {
                    if (hasSubItems) toggleDropdown(index);
                    else if (item.path) navigate(item.path);
                  }}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isOpen || isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isOpen || isActive(item.path) ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">{item.title}</span>
                  </div>
                  {hasSubItems && (
                    <div className={`p-1 rounded-md transition-all duration-200 ${
                      isOpen ? 'bg-blue-100 rotate-180' : 'group-hover:bg-gray-200'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Submenu */}
                {hasSubItems && (
                  <div className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="bg-gray-50 rounded-xl p-2 mx-2">
                      <ul className="space-y-1">{renderSubItems(item.subItems)}</ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-100">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all duration-200"
        >
          <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
          </div>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;