import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import {
  User, Mail, Phone, MapPin, Calendar, Shield, IdCard, CheckCircle, Clock,
  AlertCircle, Briefcase, Award, Settings, Users, FileCheck, Building, Crown, UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomBanner = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isAdmin = user.role?.toLowerCase() === 'admin';
  const isStaff = user.role?.toLowerCase() === 'staff';

  const iconColor = isAdmin ? 'text-purple-500' : isStaff ? 'text-green-500' : 'text-blue-500';

  const [clearanceStats, setClearanceStats] = useState({
    totalStudents: 0,
    clearedStudents: 0,
    pendingStudents: 0,
    percentage: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!isStaff || !token) return;

      try {
        const response = await fetch("http://localhost:8000/clearance/stats/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setClearanceStats(data);
      } catch (error) {
        console.error("Error fetching staff stats:", error);
      }
    };

    fetchStats();
  }, [token, isStaff]);

  const systemStats = user.systemStats || {
    totalUsers: 0,
    activeStaff: 0,
    totalStudents: 0,
    systemHealth: 100,
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-yellow-600 bg-yellow-100";
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 80) return CheckCircle;
    if (percentage >= 60) return Clock;
    return AlertCircle;
  };

  const getRoleIcon = () => {
    if (isAdmin) return Crown;
    if (isStaff) return Shield;
    return User;
  };

  const getRoleColor = () => {
    if (isAdmin) return "from-purple-500 to-purple-700";
    if (isStaff) return "from-green-500 to-green-700";
    return "from-gray-500 to-gray-700";
  };

  const getRoleBadgeColor = () => {
    if (isAdmin) return "bg-purple-100 text-purple-800 border-purple-200";
    if (isStaff) return "bg-green-100 text-green-800 border-green-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const StatusIcon = isStaff 
    ? getStatusIcon(clearanceStats.percentage) 
    : CheckCircle;

  const RoleIcon = getRoleIcon();

  const getClearanceTypeName = (id) => {
    switch (id) {
      case 1:
        return "In-charge of Project Clearance";
      case 2:
        return "In-charge of Lab Clearance";
      case 3:
        return "In-charge of Library Clearance";
      default:
        return "Clearance Type";
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8 mb-8 min-h-[600px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={user.avatar || "/api/placeholder/100/100"}
              alt={user.first_name}
              className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-lg object-cover"
            />
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${getRoleColor()} rounded-full border-3 border-white flex items-center justify-center shadow-md`}>
              <RoleIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {user.first_name} {user.last_name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRoleBadgeColor()}`}>
                {user.role?.toUpperCase()}
              </span>
            </div>
            <p className="text-lg text-gray-600 flex items-center gap-2">
              <IdCard className={`w-5 h-5 ${iconColor}`} />
              {user.employee_id || user.id_number || "N/A"}
            </p>
            <p className="text-base text-gray-500 flex items-center gap-2 mt-2">
              <Briefcase className={`w-5 h-5 ${iconColor}`} />
              {user.position || "Position"} - {user.department || "Department"}
            </p>
            {isStaff && user.clearance_type && (
              <p className="text-base text-green-600 flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                <FileCheck className={`w-5 h-5 ${iconColor}`} />
                {getClearanceTypeName(user.clearance_type)}
              </p>
            )}
          </div>
        </div>

        {/* Status/Stats */}
        {isStaff ? (
          <div className={`px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm ${getStatusColor(clearanceStats.percentage)}`}>
            <StatusIcon className={"w-6 h-6"} />
            <div className="text-base font-semibold">
              <div className="text-lg">{clearanceStats.percentage}% Cleared</div>
              <div className="text-sm opacity-75">
                {clearanceStats.clearedStudents}/{clearanceStats.totalStudents} Students
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm bg-purple-100 text-purple-600">
            <Crown className="w-6 h-6" />
            <div className="text-base font-semibold">
              <div className="text-lg">System Admin</div>
              <div className="text-sm opacity-75">Full Access</div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isStaff && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-700">Clearance Progress</span>
            <span className="text-base text-gray-500">
              {clearanceStats.clearedStudents} of {clearanceStats.totalStudents} students cleared
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-5 shadow-inner">
            <div
              className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 h-5 rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
              style={{ width: `${clearanceStats.percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
            Contact
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Mail className={`w-5 h-5 ${iconColor}`} />
              <span className="truncate font-medium">{user.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Phone className={`w-5 h-5 ${iconColor}`} />
              <span className="font-medium">{user.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Building className={`w-5 h-5 ${iconColor}`} />
              <span className="font-medium">{user.office_location || user.department || "Office"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
            Professional
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Briefcase className={`w-5 h-5 ${iconColor}`} />
              <span className="font-medium">{user.position || "Position"}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Building className={`w-5 h-5 ${iconColor}`} />
              <span className="font-medium">{user.department || "Department"}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Award className={`w-5 h-5 ${iconColor}`} />
              <span className="font-medium">
                {isAdmin ? "Administrator" : user.clearance_type?.name || "Staff"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
            Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Calendar className={`w-5 h-5 ${iconColor}`} />
              <div>
                <div className="text-sm text-gray-500 font-medium">Hired</div>
                <div className="font-semibold">{user.hire_date || user.created_at || "N/A"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-base text-gray-700">
              <UserCheck className={`w-5 h-5 ${iconColor}`} />
              <div>
                <div className="text-sm text-gray-500 font-medium">Last Active</div>
                <div className="font-semibold">{user.last_login || "Recently"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
            {isAdmin ? "System Stats" : "My Stats"}
          </h3>
          {isStaff ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-100 rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{clearanceStats.clearedStudents}</div>
                  <div className="text-sm text-green-600 font-medium">Cleared</div>
                </div>
                <div className="bg-yellow-100 rounded-xl p-4 text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">{clearanceStats.pendingStudents}</div>
                  <div className="text-sm text-yellow-600 font-medium">Pending</div>
                </div>
              </div>
              <div className="bg-blue-100 rounded-xl p-4 text-center border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{clearanceStats.totalStudents}</div>
                <div className="text-sm text-blue-600 font-medium">Total Students</div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-100 rounded-xl p-4 text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{systemStats.activeStaff}</div>
                  <div className="text-sm text-purple-600 font-medium">Active Staff</div>
                </div>
                <div className="bg-blue-100 rounded-xl p-4 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{systemStats.totalStudents}</div>
                  <div className="text-sm text-blue-600 font-medium">Students</div>
                </div>
              </div>
              <div className="bg-green-100 rounded-xl p-4 text-center border border-green-200">
                <div className="text-2xl font-bold text-green-600">{systemStats.systemHealth}%</div>
                <div className="text-sm text-green-600 font-medium">System Health</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <button
          className={`px-8 py-4 text-white rounded-xl transition-all duration-300 flex items-center gap-3 text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
            isStaff
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
              : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
          }`}
        >
          {isStaff ? <Users className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          {isStaff ? "Manage Students" : "System Settings"}
        </button>
        <button
          onClick={() => navigate(`/${user.role.toLowerCase()}/edit-profile`)}
          className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center gap-3 text-base font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          <User className="w-5 h-5" />
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default CustomBanner;