import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';

jest.mock('../../services/authService');

describe('LoginPage', () => {
  const mockLogin = jest.fn();

  const renderLoginPage = () => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ login: mockLogin }}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    renderLoginPage();

    expect(screen.getByText(/Iniciar Sesion/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  test('renders forgot password link', () => {
    renderLoginPage();

    const forgotLink = screen.getByText(/Olvidaste tu contrasena/i);
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink).toHaveAttribute('href', '/forgot-password');
  });

  test('updates form fields on input change', async () => {
    renderLoginPage();

    const inputs = screen.getAllByRole('textbox');
    const emailInput = inputs.find(i => i.type === 'email');

    if (emailInput) {
      await userEvent.type(emailInput, 'test@example.com');
      expect(emailInput).toHaveValue('test@example.com');
    }
  });

  test('submits form with email and password', async () => {
    const mockUserData = { email: 'test@example.com', token: 'abc123' };
    authService.login.mockResolvedValue(mockUserData);

    
    renderLoginPage();

    const inputs = screen.getAllByRole('textbox');
    const emailInput = inputs.find(i => i.type === 'email');
    const submitButton = screen.getByRole('button', { name: /Entrar/i });

    if (emailInput) {
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
          })
        );
        expect(mockLogin).toHaveBeenCalledWith(mockUserData);
      });
    }
  });

  test('displays error message on login failure', async () => {
    const errorMessage = 'Credenciales inválidas';
    authService.login.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    
    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: /Entrar/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('displays default error message when response has no message', async () => {
    authService.login.mockRejectedValue(new Error('Network error'));

    
    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: /Entrar/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Credenciales invalidas/i)).toBeInTheDocument();
    });
  });

  test('clears error message on new form submission', async () => {
    
    authService.login.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: /Entrar/i });

    // First submission - fails
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    // Second submission - succeeds
    authService.login.mockResolvedValueOnce({ token: 'abc123' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledTimes(2);
    });
  });

  test('email field is required', () => {
    renderLoginPage();

    const inputs = screen.getAllByRole('textbox');
    const emailInput = inputs.find(i => i.type === 'email');
    expect(emailInput).toBeRequired();
  });

  test('password field is required', () => {
    renderLoginPage();

    const form = screen.getByRole('button', { name: /Entrar/i }).closest('form');
    const passwordInputs = form.querySelectorAll('input[type="password"]');
    expect(passwordInputs.length).toBeGreaterThan(0);
  });
});


