import React from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../../components/Form';
import Layout from '../../layout/Layout';
import { useAuth } from '../../context/AuthProvider';

const ClearanceForm = ({ title, endpoint, clearanceTypeId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const expectedGraduationYear = user?.expected_graduation
    ? new Date(user.expected_graduation).getFullYear()
    : '';

  const fields = [
    {
      name: 'graduation_year',
      type: 'number',
      label: 'Graduation Year',
      required: true,
      fullWidth: true,
      disabled: true
    },
    {
      name: 'reason',
      type: 'textarea',
      label: 'Reason for Clearance',
      required: true
    },
    {
      name: 'urgent_request',
      type: 'checkbox',
      label: 'Urgent Request',
      checkboxLabel: 'Mark as urgent'
    }
  ];

  let fileUploadFields = [];

  if (title === 'Project Clearance') {
    fileUploadFields = [
      {
        name: 'file',
        label: 'Project Documentation',
        accept: '.pdf,.doc,.docx',
        required: true,
        uploadText: 'Upload Project Documentation',
        acceptedTypes: 'PDF, DOC, DOCX up to 10MB',
        maxSize: 10,
      }
    ];
  } else if (title === 'Lab Clearance') {
    fileUploadFields = [
      {
        name: 'file',
        label: 'Lab Form',
        accept: '.pdf,.doc,.docx',
        required: true,
        uploadText: 'Upload Lab Form',
        acceptedTypes: 'PDF, DOC, DOCX up to 3MB',
        maxSize: 3,
      }
    ];
  } else if (title === 'Library Clearance') {
    fileUploadFields = [
      {
        name: 'file',
        label: 'Library Form',
        accept: '.pdf,.doc,.docx',
        required: true,
        uploadText: 'Upload Library Form',
        acceptedTypes: 'PDF, DOC, DOCX up to 3MB',
        maxSize: 3,
      }
    ];
  }

  const handleSubmit = async (formDataToSubmit) => {
    formDataToSubmit.append('clearance_type_id', clearanceTypeId);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formDataToSubmit
      });

      const data = await res.json();
      if (res.ok) {
        alert('Clearance request submitted successfully!');
        navigate('/student/student-status');
      } else {
        alert(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while submitting.');
    }
  };

  const initialValues = {
    graduation_year: expectedGraduationYear
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Form
            title={title}
            fields={fields}
            fileUploadFields={fileUploadFields}
            onSubmit={handleSubmit}
            showCancelButton
            onCancel={() => navigate('/student/dashboard')}
            submitButtonText="Submit Clearance Request"
            initialValues={initialValues}
          />
        </div>
      </div>
    </Layout>
  );
};

export const ProjectClearance = () =>
  <ClearanceForm title="Project Clearance" endpoint="http://localhost:8000/clearance/project/" clearanceTypeId={1} />;

export const LabClearance = () =>
  <ClearanceForm title="Lab Clearance" endpoint="http://localhost:8000/clearance/lab/" clearanceTypeId={2} />;

export const LibraryClearance = () =>
  <ClearanceForm title="Library Clearance" endpoint="http://localhost:8000/clearance/library/" clearanceTypeId={3} />;

export default ClearanceForm;