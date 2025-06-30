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

const roleColor = {
  student: {
    bg: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/25',
    hover: 'hover:text-blue-700 hover:bg-blue-50'
  },
  staff: {
    bg: 'from-green-500 to-green-600',
    shadow: 'shadow-green-500/25',
    hover: 'hover:text-green-700 hover:bg-green-50'
  },
  admin: {
    bg: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/25',
    hover: 'hover:text-purple-700 hover:bg-purple-50'
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
    { title: 'Check Clearance Status', icon: BadgeCheck, path: '/student/student-status' },
    { title: 'View Clearance History', icon: History, path: '/student/history' }
  ],
  staff: [
    { title: 'All Your Students', icon: Users, path: '/staff/my-students' },
    { title: 'View Requests', icon: FilePlus, path: '/staff/requests' },
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
        { label: 'Staff', path: '/admin/history/staff' },
        { label: 'My History', path: '/admin/history/admin' }
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

  const role = user?.role?.toLowerCase();
  const colors = roleColor[role] || roleColor['student'];

  useEffect(() => {
    if (user && user.role) {
      const role = user.role.toLowerCase();
      const config = sidebarConfig[role] || [];
      setSidebarItems(config);

      config.forEach((item, index) => {
        if (item.subItems && item.subItems.some(sub => isActive(sub.path))) {
          setOpenDropdown(index);
        }
      });
    }
  }, [user, location.pathname]);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const isActive = (path) => location.pathname === path;

  const renderSubItems = (subItems) => {
    return subItems.map((item, idx) => (
      <li
        key={idx}
        onClick={() => navigate(item.path)}
        className={`group relative ml-6 py-2.5 px-4 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
          isActive(item.path)
            ? `bg-gradient-to-r ${colors.bg} text-white shadow-lg ${colors.shadow}`
            : `text-gray-600 ${colors.hover} hover:shadow-sm`
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isActive(item.path) 
              ? 'bg-white shadow-sm' 
              : `bg-gray-300 group-hover:bg-${colors.bg.split(' ')[0].split('-')[1]}-500 group-hover:scale-125`
          }`}></div>
          <span className="text-sm font-medium leading-tight">{item.label}</span>
        </div>
        {isActive(item.path) && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full opacity-80"></div>
        )}
      </li>
    ));
  };

  const currentRoleConfig = user?.role ? roleConfig[user.role.toLowerCase()] : null;
  const RoleIcon = currentRoleConfig?.icon || GraduationCap;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-80 bg-gradient-to-b from-white via-gray-50/50 to-white border-r border-gray-200/60 min-h-screen flex flex-col shadow-xl backdrop-blur-sm">
      <div className="p-6 border-b border-gray-100/80 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <img
              src="../public/logo.png"
              alt="University Logo"
              className="relative w-14 h-14 rounded-full shadow-lg border-3 border-white object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r ${currentRoleConfig?.color || 'from-blue-500 to-blue-600'}
                            rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
              <RoleIcon className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Student Clearance
            </h2>
            <p className="text-sm text-gray-500 font-medium capitalize mt-0.5">
              {currentRoleConfig?.name || user?.role || 'User'} Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
        <div
          onClick={() => navigate(`/${user?.role?.toLowerCase()}/dashboard`)}
          className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
            isActive(`/${user?.role?.toLowerCase()}/dashboard`)
              ? `bg-gradient-to-r ${colors.bg} text-white shadow-lg ${colors.shadow}`
              : `text-gray-700 ${colors.hover} hover:shadow-md`
          }`}
        >
          <div className={`p-2.5 rounded-xl transition-all duration-300 ${
            isActive(`/${user?.role?.toLowerCase()}/dashboard`) 
              ? 'bg-white/20 shadow-inner' 
              : 'bg-gray-100 group-hover:bg-blue-100 group-hover:shadow-sm'
          }`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="font-semibold text-[15px] leading-tight">Dashboard</span>
        </div>

        <div className="my-6 mx-4">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        <div className="space-y-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon || LayoutDashboard;
            const hasSubItems = item.subItems;
            const isOpen = openDropdown === index;
            const isItemActive = isActive(item.path) || (hasSubItems && item.subItems.some(sub => isActive(sub.path)));

            return (
              <div key={index} className="group/item">
                <div
                  onClick={() => {
                    if (hasSubItems) toggleDropdown(index);
                    else if (item.path) navigate(item.path);
                  }}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    isItemActive
                      ? `bg-gradient-to-r ${colors.bg} text-white shadow-lg ${colors.shadow}`
                      : `text-gray-700 ${colors.hover} hover:shadow-md`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                      isItemActive 
                        ? 'bg-white/20 shadow-inner' 
                        : 'bg-gray-100 group-hover/item:bg-blue-100 group-hover/item:shadow-sm'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-[15px] leading-tight">{item.title}</span>
                  </div>
                  {hasSubItems && (
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isOpen 
                        ? 'bg-white/20 rotate-180 shadow-inner' 
                        : isItemActive 
                          ? 'bg-white/10 group-hover/item:bg-white/20' 
                          : 'bg-gray-100 group-hover/item:bg-blue-100'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {hasSubItems && (
                  <div className={`overflow-hidden transition-all duration-500 ease-out ${
                    isOpen ? 'max-h-96 opacity-100 mt-3 mb-2' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 mx-2 shadow-inner border border-gray-100/50">
                      <ul className="space-y-1.5">{renderSubItems(item.subItems)}</ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="p-5 border-t border-gray-100/80 bg-white/80 backdrop-blur-sm">
        {user && (
          <div className="flex items-center gap-4 px-4 py-4 mb-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100/50 shadow-sm">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="group flex items-center gap-4 w-full px-4 py-3.5 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/25"
        >
          <div className="p-2.5 bg-red-100 group-hover:bg-white/20 rounded-xl transition-all duration-300 group-hover:shadow-inner">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[15px] leading-tight">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;