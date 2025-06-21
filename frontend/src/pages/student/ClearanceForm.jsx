import React from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../../components/Form';
import Layout from '../../layout/Layout';

const ClearanceForm = ({ title, endpoint }) => {
  const navigate = useNavigate();
  const fields = [
    { name: 'student_id', type: 'text', label: 'Student ID', required: true },
    { name: 'full_name', type: 'text', label: 'Full Name', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    {
      name: 'department',
      type: 'select',
      label: 'Department',
      required: true,
      options: [
        { value: 'cs', label: 'Computer Science' },
        { value: 'eng', label: 'Engineering' },
        { value: 'bus', label: 'Business' },
        { value: 'med', label: 'Medicine' },
      ]
    },
    { name: 'graduation_year', type: 'number', label: 'Graduation Year', required: true },
    { name: 'reason', type: 'textarea', label: 'Reason for Clearance', required: true },
    { name: 'urgent_request', type: 'checkbox', label: 'Urgent Request', checkboxLabel: 'Mark as urgent' }
  ];

  const fileUploadFields = [
    { name: 'transcripts', label: 'Academic Transcripts', required: true },
    { name: 'identification', label: 'Identification Documents', required: true },
    { name: 'supporting_docs', label: 'Supporting Documents' },
  ];

  const handleSubmit = async ({ formData, uploadedFiles }) => {
    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formPayload.append(key, value);
    });
    Object.entries(uploadedFiles).forEach(([key, files]) => {
      files.forEach(file => formPayload.append(key, file));
    });

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: formPayload
      });
      const data = await res.json();
      if (res.ok) {
        alert('Request submitted!');
        navigate('/student/history');
      } else {
        alert(data.error || 'Failed to submit');
      }
    } catch (err) {
      console.error(err);
      alert('Submission error');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">{title}</h1>
          <Form
            title={title}
            fields={fields}
            fileUploadFields={fileUploadFields}
            onSubmit={handleSubmit}
            showCancelButton
            onCancel={() => navigate('/student/dashboard')}
            submitButtonText="Submit Clearance Request"
          />
        </div>
      </div>
    </Layout>
  );
};

// Exporting each with its own title and endpoint
export const ProjectClearance = () => <ClearanceForm title="Project Clearance" endpoint="http://localhost:8000/clearance/project/" />;
export const LabClearance = () => <ClearanceForm title="Lab Clearance" endpoint="http://localhost:8000/clearance/lab/" />;
export const LibraryClearance = () => <ClearanceForm title="Library Clearance" endpoint="http://localhost:8000/clearance/library/" />;