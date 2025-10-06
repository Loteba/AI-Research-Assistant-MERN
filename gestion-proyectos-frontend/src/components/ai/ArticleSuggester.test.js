import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArticleSuggester from './ArticleSuggester';
import { AuthContext } from '../../context/AuthContext';

jest.mock('../../services/aiService', () => ({
  suggestArticles: jest.fn(),
}));

jest.mock('../../services/libraryService', () => ({
  saveSuggestion: jest.fn(),
}));

import aiService from '../../services/aiService';
import libraryService from '../../services/libraryService';

const renderWithUser = (ui, { user } = {}) => {
  return render(
    <AuthContext.Provider value={{ user }}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('ArticleSuggester', () => {
  beforeEach(() => {
    aiService.suggestArticles.mockReset();
    libraryService.saveSuggestion.mockReset();
  });

  test('muestra mensaje cuando no encuentra resultados', async () => {
    aiService.suggestArticles.mockResolvedValue([]);
    renderWithUser(<ArticleSuggester />, { user: { token: 'tok' } });

    const input = screen.getByPlaceholderText(/Introduce tu tema/i);
    fireEvent.change(input, { target: { value: 'quantum' } });

  const form = document.querySelector('.suggester-form') || screen.getByRole('form');
  fireEvent.submit(form);

    await waitFor(() => expect(aiService.suggestArticles).toHaveBeenCalled());
    // findByText espera asíncronamente a que aparezca el mensaje final
    await screen.findByText(/No se encontraron resultados/i);
  });

  test('muestra resultados y permite guardarlos', async () => {
    const mockArticle = [{ resultId: 'r1', title: 'T1', authors: 'A', summary: 'S', link: 'http://x' }];
    aiService.suggestArticles.mockResolvedValue(mockArticle);
    libraryService.saveSuggestion.mockResolvedValue({ message: 'Guardado' });

    renderWithUser(<ArticleSuggester />, { user: { token: 'tok' } });

    const input = screen.getByPlaceholderText(/Introduce tu tema/i);
    fireEvent.change(input, { target: { value: 'AI' } });

    const btn = screen.getByRole('button');
    fireEvent.click(btn);

    await waitFor(() => expect(aiService.suggestArticles).toHaveBeenCalled());

  await screen.findByText('T1');

  const saveBtn = screen.getByRole('button', { name: /guardar/i });
  fireEvent.click(saveBtn);

    await waitFor(() => expect(libraryService.saveSuggestion).toHaveBeenCalledWith(mockArticle[0], 'tok'));
    await waitFor(() => expect(saveBtn).toBeDisabled());
  });

  test('no realiza búsqueda si la query está vacía', async () => {
    renderWithUser(<ArticleSuggester />, { user: { token: 'tok' } });

    const btn = screen.getByRole('button');
    fireEvent.click(btn);

    expect(aiService.suggestArticles).not.toHaveBeenCalled();
  });
});
