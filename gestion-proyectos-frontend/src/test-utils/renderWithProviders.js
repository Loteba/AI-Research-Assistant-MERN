// src/test-utils/renderWithProviders.js
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { AuthContext } from '../context/AuthContext';

export function renderWithProviders(
  ui,
  {
    route = '/',
    user = null,
    authOverrides = {},
    routerProps = {},
    ...renderOptions
  } = {}
) {
  const defaultAuth = {
    user,
    login: jest.fn(),
    logout: jest.fn(),
    ...authOverrides
  };

  window.history.pushState({}, 'Test', route);

  return render(
    <AuthContext.Provider value={defaultAuth}>
      <MemoryRouter initialEntries={[route]} {...routerProps}>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>,
    renderOptions
  );
}

export default renderWithProviders;
