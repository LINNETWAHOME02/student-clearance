import React from 'react';
import { X, FileText } from 'lucide-react';
import classNames from 'classnames';

const HistoryModal = ({ request, onClose, userRole = 'staff' }) => {
  if (!request) return null;

  const { report, student, type: clearanceType, file, date, is_urgent } = request;
  const formattedDate = new Date(date).toLocaleDateString();
  const isStudent = userRole === 'student';
  const isStaff = userRole === 'staff';

  const roleBorderColor = isStudent ? 'border-blue-500' : 'border-green-500';
  const glowClass = (type) =>
    type === 'report'
      ? 'bg-green-50 shadow-md shadow-green-200 hover:shadow-lg'
      : 'bg-blue-50 shadow-md shadow-blue-200 hover:shadow-lg';

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center transition-opacity animate-fade-in">
      <div
        className={classNames(
          'bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative border-t-4',
          roleBorderColor,
          'animate-slide-up'
        )}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-700" />
          Clearance {isStudent ? 'Review' : 'Request'} Details
          {is_urgent && (
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold animate-pulse">
              Urgent
            </span>
          )}
        </h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong>Clearance Type:</strong> {clearanceType}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span className={`font-semibold ${report?.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
              {report?.status}
            </span>
          </div>
          <div>
            <strong>Date:</strong> {formattedDate}
          </div>

          {isStudent && (
            <>
              <div>
                <strong>Handled By:</strong> {report?.staff_name} ({report?.staff_email})
              </div>
              <div>
                <strong>Remarks:</strong> {report?.remarks || 'None'}
              </div>
              {report?.document && (
                <div className={classNames('p-3 rounded-md', glowClass('report'))}>
                  <strong>Staff Report File:</strong>{" "}
                  <a
                    href={report.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline font-medium"
                  >
                    View Report
                  </a>
                </div>
              )}
            </>
          )}

          {isStaff && (
            <>
              <div>
                <strong>Student:</strong> {student.name} ({student.id_number})
              </div>
              <div>
                <strong>Student's University Email:</strong> {student.email}
              </div>
              <div>
                <strong>Your Remarks:</strong> {report?.remarks || 'None'}
              </div>
              {file && (
                <div className={classNames('p-3 rounded-md', glowClass('file'))}>
                  <strong>Document submitted by student:</strong>{" "}
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline font-medium"
                  >
                    View Uploaded File
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;