import React from "react";
import { useAuth } from "../../context/AuthProvider";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  IdCard,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Award,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const Banner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const clearance = user.clearanceStatus || {
    completed: 0,
    pending: 0,
    total: 0,
    percentage: 0,
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 80) return CheckCircle;
    if (percentage >= 60) return Clock;
    return AlertCircle;
  };

  const StatusIcon = getStatusIcon(clearance.percentage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user.avatar || "/api/placeholder/80/80"}
              alt={user.first_name}
              className="w-16 h-16 rounded-full border-4 border-blue-100 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.first_name} {user.last_name}</h1>
            <p className="text-gray-600 flex items-center gap-1">
              <IdCard className="w-4 h-4" />
              {user.id_number || "N/A"}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <GraduationCap className="w-4 h-4" />
              {user.course || "Program"} - Year { user.year || "Year"}
            </p>
          </div>
        </div>

        {/* Status */}
        <div
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${getStatusColor(
            clearance.percentage
          )}`}
        >
          <StatusIcon className="w-5 h-5" />
          <div className="text-sm font-medium">
            <div>{clearance.percentage}% Complete</div>
            <div className="text-xs opacity-75">
              {clearance.completed}/{clearance.total} Items
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Clearance Progress
          </span>
          <span className="text-sm text-gray-500">
            {clearance.completed} of {clearance.total} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${clearance.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Contact
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="truncate">{user.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{user.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{user.department || "Department"}</span>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Academic
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>Semester: {user.semester}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award className="w-4 h-4 text-gray-400" />
              <span>GPA: {user.gpa || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <span>Credits: {user.credits || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Timeline
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Admitted</div>
                <div>{user.admission_date || "N/A"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Expected Graduation</div>
                <div>{user.expected_graduation || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">
                {clearance.completed}
              </div>
              <div className="text-xs text-green-600">Completed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-yellow-600">
                {clearance.pending}
              </div>
              <div className="text-xs text-yellow-600">Pending</div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600">
              {clearance.percentage}%
            </div>
            <div className="text-xs text-blue-600">Overall Progress</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6 pt-6 border-t border-gray-100">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          View Clearance Details
        </button>
        <button
          onClick={() => navigate(`/${user.role.toLowerCase()}/edit-profile`)}
          className="px-8 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <User className="w-4 h-4" />
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Banner;
