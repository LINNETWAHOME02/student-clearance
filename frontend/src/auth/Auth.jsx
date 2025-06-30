import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  LogIn,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  Users,
  Shield
} from 'lucide-react';

const roles = ['Student', 'Staff', 'Admin'];

const rolePlaceholders = {
  Student: {
    email: 'Enter your university student email',
    id: 'Enter your enrollment number',
    idType: 'text',
    icon: GraduationCap,
    color: 'from-blue-500 to-blue-600',
    lightColor: 'from-blue-50 to-blue-100',
    focusColor: 'focus:ring-blue-500 focus:border-blue-500'
  },
  Staff: {
    email: 'Enter your university staff email',
    id: 'Enter your staff ID',
    idType: 'text',
    icon: Users,
    color: 'from-green-500 to-green-600',
    lightColor: 'from-green-50 to-green-100',
    focusColor: 'focus:ring-green-500 focus:border-green-500'
  },
  Admin: {
    email: 'Enter your university admin email',
    id: 'Enter your admin ID',
    idType: 'text',
    icon: Shield,
    color: 'from-purple-500 to-purple-600',
    lightColor: 'from-purple-50 to-purple-100',
    focusColor: 'focus:ring-purple-500 focus:border-purple-500'
  }
};

const Auth = (props) => {
  const defaultRole = roles.indexOf((props.defaultRole || 'Student').trim());
  const [activeIndex, setActiveIndex] = useState(defaultRole >= 0 ? defaultRole : 0);

  const [isActivated, setIsActivated] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    id_number: '',
    password: '',
    confirm_password: ''
  });


  const activeRole = roles[activeIndex];
  const roleConfig = rolePlaceholders[activeRole];
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleChange = (direction) => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (direction === 'next') {
        setActiveIndex((prev) => (prev + 1) % roles.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + roles.length) % roles.length);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (formData.password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'Passwords should match' });
      setFormData(prev => ({ ...prev, password: '', confirm_password: '' }));
      setIsLoading(false);
      return;
    }

    const role = activeRole === 'Admin' ? 'admin' : activeRole.toLowerCase();
    const payload = { ...formData, id_number: formData.id_number, role };

    try {
      const res = await fetch('http://localhost:8000/accounts/activate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => setIsActivated(true), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Activation failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error. Try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_number: formData.id_number,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        login(data);

        setTimeout(() => {
          const role = data.user?.role;
          if (role === 'student') navigate('/student/dashboard');
          else if (role === 'staff') navigate('/staff/dashboard');
          else if (role === 'admin') navigate('/admin/dashboard');
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Login failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const MessageAlert = ({ message }) => {
    if (!message) return null;

    return (
      <div className={`flex items-center gap-2 p-4 rounded-xl border transition-all duration-300 transform ${
        message.type === 'error' 
          ? 'bg-red-50 border-red-200 text-red-700' 
          : 'bg-green-50 border-green-200 text-green-700'
      }`}>
        {message.type === 'error' ? (
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
        ) : (
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
        )}
        <span className="text-sm font-medium">{message.text}</span>
      </div>
    );
  };

  const getIconFocusColor = () => {
  if (roleConfig.focusColor.includes('blue')) return 'group-focus-within:text-blue-500';
  if (roleConfig.focusColor.includes('green')) return 'group-focus-within:text-green-500';
  if (roleConfig.focusColor.includes('purple')) return 'group-focus-within:text-purple-500';
  return 'group-focus-within:text-gray-400';
};

  const renderForm = () => (
    <form className="space-y-6" onSubmit={handleActivateSubmit}>
      <div className="space-y-4">
        {/* Email Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Mail className={`h-5 w-5 text-gray-400 ${getIconFocusColor()} transition-colors duration-200`} />
          </div>
          <input
            type="email"
            placeholder={roleConfig.email}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl 
              focus:outline-none focus:ring-2 ${roleConfig.focusColor} focus:border-transparent 
              transition-all duration-200 hover:border-gray-300 text-gray-700
              placeholder-gray-400 group-focus-within:bg-white`}
            required
          />
        </div>

        {/* ID Number Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <User className={`h-5 w-5 text-gray-400 ${getIconFocusColor()} transition-colors duration-200`} />
          </div>
          <input
            type={roleConfig.idType}
            placeholder={roleConfig.id}
            value={formData.id_number}
            onChange={(e) => handleInputChange('id_number', e.target.value)}
            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl 
              focus:outline-none focus:ring-2 ${roleConfig.focusColor} focus:border-transparent 
              transition-all duration-200 hover:border-gray-300 text-gray-700
              placeholder-gray-400 group-focus-within:bg-white`}
            required
          />
        </div>

        {/* Password Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Lock className={`h-5 w-5 text-gray-400 ${getIconFocusColor()} transition-colors duration-200`} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl 
              focus:outline-none focus:ring-2 ${roleConfig.focusColor} focus:border-transparent 
              transition-all duration-200 hover:border-gray-300 text-gray-700
              placeholder-gray-400 group-focus-within:bg-white`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Confirm Password Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Lock className={`h-5 w-5 text-gray-400 ${getIconFocusColor()} transition-colors duration-200`} />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirm_password}
            onChange={(e) => handleInputChange('confirm_password', e.target.value)}
            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl 
              focus:outline-none focus:ring-2 ${roleConfig.focusColor} focus:border-transparent 
              transition-all duration-200 hover:border-gray-300 text-gray-700
              placeholder-gray-400 group-focus-within:bg-white`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r ${roleConfig.color} 
                 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
                 disabled:hover:scale-100`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <UserCheck className="w-5 h-5" />
        )}
        {isLoading ? 'Activating...' : 'Activate Account'}
      </button>

      <div className="text-center">
        <p className="text-gray-600">
          Already have an activated account?{' '}
          <button 
            type="button"
            onClick={() => setIsActivated(true)} 
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
          >
            Sign In
          </button>
        </p>
      </div>

      <MessageAlert message={message} />
    </form>
  );

  const renderLogin = () => (
    <form className="space-y-6" onSubmit={handleLogin}>
      <div className="space-y-4">
        {/* ID Number Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <User className={`h-5 w-5 text-gray-400 ${getIconFocusColor()} transition-colors duration-200`} />
          </div>
          <input
            type={roleConfig.idType}
            placeholder={roleConfig.id}
            value={formData.id_number}
            onChange={(e) => handleInputChange('id_number', e.target.value)}
            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl 
              focus:outline-none focus:ring-2 ${roleConfig.focusColor} focus:border-transparent 
              transition-all duration-200 hover:border-gray-300 text-gray-700
              placeholder-gray-400 group-focus-within:bg-white`}
            required
          />
        </div>

        {/* Password Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Lock className={`h-5 w-5 text-gray-400 ${getIconFocusColor()} transition-colors duration-200`} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl 
              focus:outline-none focus:ring-2 ${roleConfig.focusColor} focus:border-transparent 
              transition-all duration-200 hover:border-gray-300 text-gray-700
              placeholder-gray-400 group-focus-within:bg-white`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r ${roleConfig.color} 
                 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
                 disabled:hover:scale-100`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <LogIn className="w-5 h-5" />
        )}
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>

      <div className="text-center">
        <p className="text-gray-600">
          Need to activate your account?{' '}
          <button 
            type="button"
            onClick={() => setIsActivated(false)} 
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
          >
            Activate Now
          </button>
        </p>
      </div>

      <MessageAlert message={message} />
    </form>
  );

  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img 
              src="../public/logo.png" 
              alt="University Logo" 
              className="w-20 h-20 mx-auto rounded-full shadow-lg border-4 border-white"
            />
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${roleConfig.color} 
                          rounded-full flex items-center justify-center shadow-lg`}>
              <RoleIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
            Student Clearance System
          </h1>
          <p className="text-gray-600">Streamlined university clearance process</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Role Selector */}
          <div className={`bg-gradient-to-r ${roleConfig.lightColor} p-8 border-b border-gray-100`}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleRoleChange('prev')}
                className="p-2 hover:bg-white/50 rounded-full transition-colors duration-200 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 bg-gradient-to-r ${roleConfig.color} rounded-xl shadow-lg mb-2`}>
                  <RoleIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{activeRole} Portal</h2>
              </div>
              
              <button
                onClick={() => handleRoleChange('next')}
                className="p-2 hover:bg-white/50 rounded-full transition-colors duration-200 text-gray-600 hover:text-gray-800"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-10">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isActivated ? 'Welcome Back!' : 'Get Started'}
              </h3>
              <p className="text-gray-600">
                {isActivated
                  ? `Sign in to your ${activeRole.toLowerCase()} account`
                  : `Activate your ${activeRole.toLowerCase()} account to continue`}
              </p>
            </div>

            {/* Animated Form Container */}
            <div className={`transition-transform duration-300 ${isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
              {isActivated ? renderLogin() : renderForm()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} University Student Clearance System</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;