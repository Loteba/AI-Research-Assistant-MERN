import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';
import authService from '../../services/authService';

jest.mock('../../services/authService');

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderRegisterPage = () => {
    return render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
  };

  test('renders registration form', () => {
    renderRegisterPage();

    expect(screen.getByText(/Crear una cuenta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear/i })).toBeInTheDocument();
  });

  test('renders role select dropdown', () => {
    renderRegisterPage();

    const roleSelect = screen.getByRole('combobox');
    expect(roleSelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Investigador/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Estudiante/i })).toBeInTheDocument();
  });

  test('renders admin creation toggle button', () => {
    renderRegisterPage();

    expect(screen.getByRole('button', { name: /Crear como administrador/i })).toBeInTheDocument();
  });

  test('toggles admin section visibility', async () => {
    
    renderRegisterPage();

    const toggleButton = screen.getByRole('button', { name: /Crear como administrador/i });
    
    // Initially hidden
    expect(screen.queryByText(/Clave de administrador/i)).not.toBeInTheDocument();

    // Click to show
    await userEvent.click(toggleButton);
    expect(screen.getByText(/Clave de administrador/i)).toBeInTheDocument();

    // Click to hide
    await userEvent.click(toggleButton);
    expect(screen.queryByText(/Clave de administrador/i)).not.toBeInTheDocument();
  });

  test('updates form fields on input', async () => {
    
    renderRegisterPage();

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);

    if (inputs[0]) {
      await userEvent.type(inputs[0], 'John Doe');
      expect(inputs[0]).toHaveValue('John Doe');
    }
  });

  test('changes role selection', async () => {
    
    renderRegisterPage();

    const roleSelect = screen.getByRole('combobox');
    await user.selectOptions(roleSelect, 'investigador');

    expect(roleSelect).toHaveValue('investigador');
  });

  test('submits registration form with user data', async () => {
    authService.register.mockResolvedValue({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'estudiante',
    });

    
    renderRegisterPage();

    const submitButton = screen.getByRole('button', { name: /Crear/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });
  });

  test('displays success message on successful registration', async () => {
    authService.register.mockResolvedValue({
      name: 'John Doe',
      email: 'john@example.com',
    });

    
    renderRegisterPage();

    const nameInput = screen.getByLabelText(/Nombre/i);
    const emailInput = screen.getByLabelText(/Correo/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole('button', { name: /Crear/i });

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Cuenta creada correctamente/i)).toBeInTheDocument();
    });
  });

  test('displays error message on registration failure', async () => {
    const errorMessage = 'Email already registered';
    authService.register.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    
    renderRegisterPage();

    const nameInput = screen.getByLabelText(/Nombre/i);
    const emailInput = screen.getByLabelText(/Correo/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole('button', { name: /Crear/i });

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('submits admin registration with admin key', async () => {
    authService.register.mockResolvedValue({
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
    });

    
    renderRegisterPage();

    // Fill basic info
    const nameInput = screen.getByLabelText(/Nombre/i);
    const emailInput = screen.getByLabelText(/Correo/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    await userEvent.type(nameInput, 'Admin User');
    await userEvent.type(emailInput, 'admin@example.com');
    await userEvent.type(passwordInput, 'password123');

    // Open admin section
    const toggleButton = screen.getByRole('button', { name: /Crear como administrador/i });
    await userEvent.click(toggleButton);

    // Check admin checkbox
    const adminCheckbox = screen.getByRole('checkbox', { name: /Crear como administrador/i });
    await userEvent.click(adminCheckbox);

    // Fill admin key
    const adminKeyInput = screen.getByLabelText(/Clave de administrador/i);
    await userEvent.type(adminKeyInput, 'secret-admin-key');

    // Submit
    const submitButton = screen.getByRole('button', { name: /Crear/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'admin',
          adminKey: 'secret-admin-key',
        })
      );
    });
  });

  test('password field has minimum length requirement', () => {
    renderRegisterPage();

    const passwordInput = screen.getByLabelText(/Contraseña/i);
    expect(passwordInput).toHaveAttribute('minLength', '6');
  });

  test('all required fields are marked as required', () => {
    renderRegisterPage();

    const nameInput = screen.getByLabelText(/Nombre/i);
    const emailInput = screen.getByLabelText(/Correo/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});


