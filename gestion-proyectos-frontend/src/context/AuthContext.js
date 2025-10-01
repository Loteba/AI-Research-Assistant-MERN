// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    navigate('/dashboard');
  };

  // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
  const logout = () => {
    // 1. Primero, redirigimos al usuario.
    // El router desmontará limpiamente la página del dashboard.
    navigate('/login');
    
    // 2. Después, limpiamos el estado y el localStorage.
    // Esto asegura que cuando React re-renderice la App, ya estaremos
    // en la página de login, donde el estado 'user' no causa
    // el desmontaje conflictivo del Chatbot.
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};