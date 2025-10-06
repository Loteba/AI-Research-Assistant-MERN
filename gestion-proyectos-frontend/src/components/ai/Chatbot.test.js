import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chatbot from './Chatbot';
import { AuthContext } from '../../context/AuthContext';

// Mock aiService
jest.mock('../../services/aiService', () => ({
  aiChat: jest.fn()
}));
import aiService from '../../services/aiService';

describe('Chatbot component', () => {
  const user = { token: 'tok' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders toggle button and can open/close chat window', () => {
    render(
      <AuthContext.Provider value={{ user }}>
        <Chatbot />
      </AuthContext.Provider>
    );
    // Toggle by class (la estructura usa un botón con class chatbot-toggle-button)
    const toggle = document.querySelector('.chatbot-toggle-button') || screen.getAllByRole('button')[0];
    // The button exists — click to open
    fireEvent.click(toggle);

    // After opening, the window should have the 'open' class
    const windowEl = document.querySelector('.chatbot-window');
    expect(windowEl.classList.contains('open')).toBe(true);

    // Close using the close icon button in header (primer botón dentro del header)
    const headerButton = document.querySelector('.chatbot-header button');
    if (headerButton) fireEvent.click(headerButton);
    // Chat window should no longer have the 'open' class
    expect(windowEl.classList.contains('open')).toBe(false);
  });

  test('sends a message and displays AI response', async () => {
    aiService.aiChat.mockResolvedValue({ text: 'Respuesta IA' });

    render(
      <AuthContext.Provider value={{ user }}>
        <Chatbot />
      </AuthContext.Provider>
    );

  // open using DOM selector
  const toggle = document.querySelector('.chatbot-toggle-button') || screen.getAllByRole('button')[0];
  fireEvent.click(toggle);

    const input = screen.getByPlaceholderText(/escribe tu pregunta/i);
    const send = screen.getByRole('button', { name: /enviar/i });

    fireEvent.change(input, { target: { value: 'Hola' } });
    fireEvent.click(send);

    await waitFor(() => expect(aiService.aiChat).toHaveBeenCalled());
    await screen.findByText(/Respuesta IA/i);
  });

  test('does not send empty message or when no user', async () => {
    // Render without user
    render(
      <AuthContext.Provider value={{ user: null }}>
        <Chatbot />
      </AuthContext.Provider>
    );

  const toggle = document.querySelector('.chatbot-toggle-button') || screen.getAllByRole('button')[0];
  fireEvent.click(toggle);

    const input = screen.getByPlaceholderText(/escribe tu pregunta/i);
    const send = screen.getByRole('button', { name: /enviar/i });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(send);

    await waitFor(() => expect(aiService.aiChat).not.toHaveBeenCalled());
  });
});
