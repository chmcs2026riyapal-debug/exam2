import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Student Login - Sirf student ke liye
  const studentLogin = (studentData) => {
    const userData = {
      ...studentData,
      role: 'student'
    };
    setUser(userData);
    localStorage.setItem('student', JSON.stringify(userData));
  };

  // Student Logout
  const studentLogout = () => {
    setUser(null);
    localStorage.removeItem('student');
  };

  // Check if student is logged in on page load
  useEffect(() => {
    const savedStudent = localStorage.getItem('student');
    if (savedStudent) {
      setUser(JSON.parse(savedStudent));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      studentLogin, 
      studentLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};