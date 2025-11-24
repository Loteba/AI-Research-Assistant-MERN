import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import { AuthContext } from '../../context/AuthContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('../../__mocks__/react-router-dom.js'),
  useNavigate: () => jest.fn(),
}));

describe('HomePage', () => {
  const renderHomePage = (user = null) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user }}>
          <HomePage />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test('renders home page with hero section', () => {
    renderHomePage();

    expect(screen.getByText(/ARA — Tu asistente de investigación con IA/i)).toBeInTheDocument();
  });

  test('renders app when user is not authenticated', () => {
    renderHomePage(null);
    expect(screen.getByText(/ARA — Tu asistente/i)).toBeInTheDocument();
  });

  test('renders app when user is authenticated', () => {
    const user = { name: 'John', email: 'john@example.com' };
    renderHomePage(user);
    expect(screen.getByText(/ARA — Tu asistente/i)).toBeInTheDocument();
  });

  test('renders benefits section', () => {
    renderHomePage();
    expect(screen.getByText(/Ahorra tiempo con IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Encuentra artículos clave/i)).toBeInTheDocument();
  });

  test('renders stats section', () => {
    renderHomePage();
    expect(screen.getByText('100+')).toBeInTheDocument();
    expect(screen.getByText('1.5k+')).toBeInTheDocument();
    expect(screen.getByText('2.3k+')).toBeInTheDocument();
  });

  test('renders features section', () => {
    renderHomePage();
    expect(screen.getByText(/Resumidor IA/i)).toBeInTheDocument();
  });

  test('renders FAQ section', () => {
    renderHomePage();
    expect(screen.getByText(/Preguntas frecuentes/i)).toBeInTheDocument();
  });

  test('renders final CTA', () => {
    renderHomePage();
    expect(screen.getByText(/¿Listo para acelerar/i)).toBeInTheDocument();
  });

  test('renders hero image', () => {
    renderHomePage();
    const images = screen.getAllByAltText(/Fondo tecnológico/i);
    expect(images.length).toBeGreaterThan(0);
  });

  test('renders all major sections without error', () => {
    // Just verify page renders without crashing
    const { container } = renderHomePage();
    expect(container).toBeTruthy();
  });
});
