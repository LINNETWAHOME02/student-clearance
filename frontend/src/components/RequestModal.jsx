import React, { useState } from 'react';
import { X, Check, FileText } from 'lucide-react';

const RequestModal = ({ request, onClose, onApprove, onReject }) => {
  const [comment, setComment] = useState('');
  
  if (!request) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = () => {
    onApprove(request.id, comment);
    onClose();
  };

  const handleReject = () => {
    if (comment.trim()) {
      onReject(request.id, comment);
      onClose();
    } else {
      alert('Please provide a reason for rejection');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{request.student.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Student ID</p>
                <p className="font-medium">{request.student.id_number}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{request.student.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Course</p>
                <p className="font-medium">{request.student.course}</p>
              </div>
            </div>
          </div>

          {/* Request Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Request Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-medium">{request.type}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Date Submitted</p>
                <p className="font-medium">{request.date}</p>
              </div>
              <div>
                <p className="text-gray-600">Priority</p>
                <p className={`font-medium capitalize ${
                  request.priority === 'high' ? 'text-red-600' :
                  request.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>{request.priority}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
            <div className="space-y-2">
              {request.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    {/* In-case I want to add mutiple document submission */}
                    <span className="text-sm font-medium">{doc.split('/').pop()}</span>
                  </div>
                  <a
                    href={request.file} // will use {doc} for each doc to have its full path if handling multiple documents
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          {request.comments.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Comments</h3>
              <div className="space-y-2">
                {request.comments.map((comment, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{comment.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{comment.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Comment */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              {request.status === 'pending' ? 'Add Comment (Required for rejection)' : 'Add Comment'}
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          {request.status === 'pending' && (
            <>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestModal;