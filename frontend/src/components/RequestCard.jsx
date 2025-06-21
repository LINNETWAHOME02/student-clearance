import React from 'react';
import { Eye, MoreVertical } from 'lucide-react';

const RequestCard = ({ request, onViewRequest }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg border-l-4 ${getPriorityColor(request.priority)} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{request.student.name}</h3>
            <span className="text-sm text-gray-500">({request.student.studentId})</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">{request.type}</p>
          <p className="text-xs text-gray-500">Submitted: {request.date}</p>
          <p className="text-xs text-gray-500">{request.student.course} • {request.student.department}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewRequest(request)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
      {request.comments.length > 0 && (
        <div className="mt-3 p-2 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">{request.comments[request.comments.length - 1].text}</p>
        </div>
      )}
    </div>
  );
};

export default RequestCard;