import React from 'react';
import Form from './Form';
import { useAuth } from '../context/AuthProvider';
import Layout from '../layout/Layout';

const EditProfile = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  if (!user) return null;

  const commonFields = [
    { name: 'first_name', type: 'text', label: 'First Name', required: true },
    { name: 'last_name', type: 'text', label: 'Last Name', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true, disabled: role !== 'admin' },
    { name: 'phone', type: 'text', label: 'Phone Number' },
  ];

  const studentFields = [
    { name: 'course', type: 'text', label: 'Course', disabled: true },
    { name: 'year', type: 'number', label: 'Year of Study', disabled: true },
    { name: 'semester', type: 'text', label: 'Semester', disabled: true },
    { name: 'admission_date', type: 'date', label: 'Admission Date', disabled: true },
    { name: 'expected_graduation', type: 'date', label: 'Expected Graduation', disabled: true },
    { name: 'gpa', type: 'text', label: 'GPA', disabled: true },
    { name: 'credits', type: 'text', label: 'Credits Earned', disabled: true },
    { name: 'bio', type: 'textarea', label: 'Bio' },
  ];

  const staffFields = [
    { name: 'department', type: 'text', label: 'Department', disabled: true },
    { name: 'position', type: 'text', label: 'Position/Title' },
    { name: 'bio', type: 'textarea', label: 'Bio' },
  ];

  const adminFields = [
    { name: 'bio', type: 'textarea', label: 'Bio' },
  ];

  const fileUploadFields = [
    {
      name: 'avatar',
      label: 'Profile Picture',
      accept: '.jpg,.jpeg,.png',
      multiple: false,
    }
  ];

  let roleSpecificFields = [];
  if (role === 'student') roleSpecificFields = studentFields;
  else if (role === 'staff') roleSpecificFields = staffFields;
  else if (role === 'admin') roleSpecificFields = adminFields;

  const handleProfileSubmit = async (formData) => {
      try {
        const userId = user.id;
        const token = localStorage.getItem("accessToken");

        const res = await fetch(`http://localhost:8000/accounts/profile/update/`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        });

        const data = await res.json();
        if (res.ok) {
          alert('Profile updated!');
        } else {
          console.error(data);
          alert('Update failed.');
        }
      } catch (err) {
        console.error("Error updating profile:", err);
        alert('Something went wrong.');
      }
    };


  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Edit Profile</h1>
          <Form
            title="Edit Your Profile"
            fields={[...commonFields, ...roleSpecificFields]}
            fileUploadFields={fileUploadFields}
            onSubmit={handleProfileSubmit}
            initialValues={user}
            submitButtonText="Update Profile"
          />
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;