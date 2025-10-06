import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import { AuthContext } from '../../context/AuthContext';

describe('Navbar', () => {
  test('muestra enlaces para usuario autenticado', () => {
    const logout = jest.fn();
    const user = { name: 'Juan Perez' };
    render(
      <AuthContext.Provider value={{ user, logout }}>
        <Navbar />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Bienvenido, Juan/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Cerrar Sesión/i));
    expect(logout).toHaveBeenCalled();
  });

  test('muestra enlaces de login cuando no hay usuario', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <Navbar />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
    expect(screen.getByText(/Registrarse/i)).toBeInTheDocument();
  });
});
