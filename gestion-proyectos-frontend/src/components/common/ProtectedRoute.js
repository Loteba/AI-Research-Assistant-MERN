// frontend/src/components/common/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Si no hay usuario, redirigir a la página de login
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, renderizar el componente hijo (la página protegida)
  return <Outlet />;
};

export default ProtectedRoute;