import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const roles = ['Student', 'Staff', 'Admin'];

const rolePlaceholders = {
  Student: {
    email: 'University student email',
    id: 'Enrollment Number',
    idType: 'text',
    department: 'Department enrolled in'
  },
  Staff: {
    email: 'University staff email',
    id: 'Staff ID',
    idType: 'text',
    department: 'Department working under'
  },
  Admin: {
    email: 'University admin email',
    id: 'Admin ID',
    idType: 'text',
    department: 'Department you head'
  }
};

const Auth = () => {
  const [activeIndex, setActiveIndex] = useState(0); // index of roles
  const [isActivated, setIsActivated] = useState(false);
  const [flipped, setFlipped] = useState(false); // for flip animation
  const [message, setMessage] = useState(null); // for success or error messages during activation or login

  // to capture input data from the forms
  const [formData, setFormData] = useState({
  name: '',
  email: '',
  id_number: '',
  department: '',
  password: '',
  confirm_password: ''
});

  const activeRole = roles[activeIndex];
  const { email, id, idType, department } = rolePlaceholders[activeRole];

  const navigate = useNavigate();
  const { login } = useAuth();

  // Flip animation trigger
  const handleRoleChange = (direction) => {
    setFlipped(true); // to trigger flip
    setTimeout(() => {
      if (direction === 'next') {
        setActiveIndex((prev) => (prev + 1) % roles.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + roles.length) % roles.length);
      }
      setFlipped(false); // to reset after transition
    }, 300); // to match the animation duration
  };

  const handleActivateSubmit = async (e) => {
  e.preventDefault();
  setMessage(null);

  const role = activeRole.toLowerCase(); // to convert to 'student', 'staff', 'admin'
  const payload = {
    ...formData,
    id_number: formData.id_number,
    role,
  };

  try {
    const res = await fetch('http://localhost:8000/accounts/activate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage({ type: 'success', text: data.message });
      setIsActivated(true); // switch to login
    } else {
      setMessage({ type: 'error', text: data.error || 'Activation failed' });
    }
  } catch (err) {
    setMessage({ type: 'error', text: 'Server error. Try again later.' });
  }
};

const handleLogin = async (e) => {
  e.preventDefault();

  const res = await fetch('http://localhost:8000/accounts/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_number: formData.id_number, password: formData.password }),
  });

  const data = await res.json();
  if (res.ok) {
    login(data); // Save to context + localStorage

    // Role-based redirect
    if (data.role === 'student') navigate('/student/dashboard');
    else if (data.role === 'staff') navigate('/staff/dashboard');
    else if (data.role === 'systemadmin') navigate('/admin/dashboard');
  } else {
    setMessage({ type: 'error', text: data.error || 'Login failed' });
  }
};

  const renderForm = () => (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleActivateSubmit}>
      <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-styled input-styled:focus" required/>
      <input type="email" placeholder={email} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-styled input-styled:focus" required/>
      <input type={idType} placeholder={id} value={formData.id_number} onChange={(e) => setFormData({ ...formData, id_number: e.target.value })} className="input-styled input-styled:focus" required/>
      <input type="text" placeholder={department} value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-styled input-styled:focus" required/>
      <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-styled input-styled:focus" required/>
      <input type="password" placeholder="Confirm password" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} className="input-styled input-styled:focus" required/>
      
      <button type="submit" className="btn_no_bg">Activate Account</button>
      <p className="text-center mt-4 text-[#2d4570]">
        Already activated account?{' '}
        <button onClick={() => setIsActivated(true)} className="text-blue-600 hover:underline">
          Log In
        </button>
      </p>

      {/* Render message */}
      {message && (
        <p className={`text-sm text-center mt-2 ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
          {message.text}
        </p>
      )}
    </form>
  );

  const renderLogin = () => (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleLogin}>
      {/* <input type="email" placeholder={email} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input input-bordered" /> */}
      <input type={idType} placeholder={id} value={formData.id_number} onChange={(e) => setFormData({ ...formData, id_number: e.target.value })} className="input-styled input-styled:focus" />
      <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-styled input-styled:focus" />

      <button type="submit" className="btn_bg">Log In</button>
      <p className="text-center mt-4 text-[#2d4570]">
        Need to activate account?{' '}
        <button onClick={() => setIsActivated(false)} className="text-blue-600 hover:underline">
          Activate
        </button>
      </p>

      {/* Render message */}
      {message && (
        <p className={`text-sm text-center mt-2 ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
          {message.text}
        </p>
      )}
    </form>
  );

  return (
    <div className="container mx-auto mt-6 max-w-3xl p-6 bg-gradient-to-tl from-[#f9fcfc] via-[#ebfafc] via-[#dcf7fb] to-[#dff4fa] rounded-md shadow-md relative">
      {/* Logo */}
      <img src="./logo.png" alt="Logo" className='mx-auto w-20 h-20' />

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-[#0a3e97]">Student Clearance System</h2>
      </div>

      {/* Arrows + Role toggle */}
      <div className="flex justify-center items-center gap-3 mb-4">
        <button onClick={() => handleRoleChange('prev')} className="text-[#3575E2] hover:text-black text-2xl">
          ←
        </button>
        <span className="text-xl font-semibold text-[#0a3e97] hover:text-black">
          {activeRole}
        </span>
        <button onClick={() => handleRoleChange('next')} className="text-[#3575E2] hover:text-black text-2xl">
          →
        </button>
      </div>

      {/* Form heading */}
      <h3 className="text-xl font-semibold text-center mb-4 text-[#2d4570]">
        {isActivated
          ? `Log in to your ${activeRole} account`
          : `Activate your ${activeRole} account`}
      </h3>

      {/* Animated form container */}
      <div className={`transition-transform duration-300 ${flipped ? 'rotate-y-180' : ''}`}>
        <div className="transform-gpu [transform-style:preserve-3d]">
          <div className="backface-hidden">
            {isActivated ? renderLogin() : renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;