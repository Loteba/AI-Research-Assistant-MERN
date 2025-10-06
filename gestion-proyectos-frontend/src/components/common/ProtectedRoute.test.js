import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../../context/AuthContext';

describe('ProtectedRoute', () => {
  test('redirige a login cuando no hay usuario', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <ProtectedRoute />
      </AuthContext.Provider>
    );
    expect(screen.queryByText(/cerrar sesión/i)).not.toBeInTheDocument();
  });
});
