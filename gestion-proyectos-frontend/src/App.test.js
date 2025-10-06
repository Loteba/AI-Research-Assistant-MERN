import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthContext } from './context/AuthContext';

jest.mock('./components/layout/Navbar', () => () => <div>NavbarMock</div>);
jest.mock('./components/ai/Chatbot', () => () => <div>ChatbotMock</div>);

describe('App', () => {
  test('muestra Chatbot cuando hay user en contexto', () => {
    render(
      <AuthContext.Provider value={{ user: { token: 'x' } }}>
        <App />
      </AuthContext.Provider>
    );

    expect(screen.getByText('NavbarMock')).toBeInTheDocument();
    expect(screen.getByText('ChatbotMock')).toBeInTheDocument();
  });

  test('no muestra Chatbot cuando no hay user', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <App />
      </AuthContext.Provider>
    );

    expect(screen.getByText('NavbarMock')).toBeInTheDocument();
    expect(screen.queryByText('ChatbotMock')).not.toBeInTheDocument();
  });
});
