import React, { createContext, useState, useContext } from 'react';
import useSafeLocalStorage from '../hooks/useSafeLocalStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useSafeLocalStorage('user', null);

 const login = (data) => {
    setUser(data.user);
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
  };

  const logout = async (navigate, role) => {
    const refresh = localStorage.getItem('refreshToken');
    const access = localStorage.getItem('accessToken');

    try {
      await fetch('http://localhost:8000/accounts/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      });
    } catch (err) {
      console.warn('Logout API failed', err);
    }

    // Clear everything from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);

    // Redirect based on role
    if (role === 'student') navigate('/auth/student');
    else if (role === 'staff') navigate('/auth/staff');
    else if (role === 'admin') navigate('/auth/admin');
    else navigate('/auth');
  };



  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using the context
export const useAuth = () => useContext(AuthContext);