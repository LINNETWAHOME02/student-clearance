import React, { useEffect, useState } from "react";
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
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    total: 0,
    percentage: 0,
  });

  useEffect(() => {
    const fetchStudentStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/clearance/student-stats/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch clearance stats");

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching student stats:", err);
      }
    };

    if (user?.role === "student") {
      fetchStudentStats();
    }
  }, [user]);

  if (!user) return null;

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

  const StatusIcon = getStatusIcon(stats.percentage);

  const handleCheckStatus = () => {
    navigate("/student/student-status");
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
              className="w-24 h-24 rounded-full border-4 border-blue-100 shadow-lg object-cover"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full border-3 border-white flex items-center justify-center shadow-md">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-lg text-gray-600 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-blue-500" />
              {user.id_number || "N/A"}
            </p>
            <p className="text-base text-gray-500 flex items-center gap-2 mt-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              {user.course || "Program"} - Year {user.year || "Year"}
            </p>
          </div>
        </div>

        {/* Status */}
        <div
          className={`px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm ${getStatusColor(
            stats.percentage
          )}`}
        >
          <StatusIcon className="w-6 h-6 text-yellow-500" />
          <div className="text-base font-semibold">
            <div className="text-lg">{stats.percentage}% Complete</div>
            <div className="text-sm opacity-75">
              {stats.completed}/{stats.total} Items
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-700">Clearance Progress</span>
          <span className="text-base text-gray-500">
            {stats.completed} of {stats.total} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-5 shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-5 rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
            style={{ width: `${stats.percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {/* Contact Info */}
        <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
            Contact
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Mail className="w-5 h-5 text-blue-500" />
              <span className="truncate font-medium">{user.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Phone className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{user.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-gray-700">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{user.department || "Department"}</span>
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
            Academic
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-base text-gray-700">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Semester: {user.semester}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Award className="w-5 h-5 text-blue-500" />
              <span className="font-medium">GPA: {user.gpa || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-gray-700">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Credits: {user.credits || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
            Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-500 font-medium">Admitted on:</div>
                <div className="font-semibold">{user.admission_date || "N/A"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-base text-gray-700">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-500 font-medium">Expected Graduation:</div>
                <div className="font-semibold">{user.expected_graduation || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-sm text-green-600 font-medium">Completed</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
            <div className="text-sm text-blue-600 font-medium">Overall Progress</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <button
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-3 text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          onClick={handleCheckStatus}
        >
          <CheckCircle className="w-5 h-5" />
          View Clearance Details
        </button>
        <button
          onClick={() => navigate(`/${user.role.toLowerCase()}/edit-profile`)}
          className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center gap-3 text-base font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          <User className="w-5 h-5 text-blue-500" />
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Banner;