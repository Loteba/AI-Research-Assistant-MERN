import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from '../AuthContext';

const mockedNavigate = jest.fn();

function ConsumerComponent() {
  const { user, login, logout } = useContext(AuthContext);
  return (
    <div>
      <div data-testid="user">{user ? user.name : 'no-user'}</div>
      <button onClick={() => login({ name: 'Alice', token: 'tok' })}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedNavigate.mockClear();
    // Spy on useNavigate at runtime to return our mock
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockedNavigate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('login stores user and navigates, logout clears and navigates', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ConsumerComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user').textContent).toBe('no-user');

    fireEvent.click(screen.getByText('login'));

    // user stored in localStorage and shown in context
    expect(JSON.parse(localStorage.getItem('user')).name).toBe('Alice');
    expect(screen.getByTestId('user').textContent).toBe('Alice');
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');

    // logout should remove and navigate to login
    fireEvent.click(screen.getByText('logout'));
    expect(localStorage.getItem('user')).toBeNull();
    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });
});
