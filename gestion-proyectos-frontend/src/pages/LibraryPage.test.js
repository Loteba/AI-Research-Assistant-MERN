import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LibraryPage from './LibraryPage';
import { AuthContext } from '../context/AuthContext';

jest.mock('../services/libraryService', () => ({
  getItems: jest.fn(),
  uploadItem: jest.fn()
}));
import libraryService from '../services/libraryService';

describe('LibraryPage', () => {
  beforeEach(() => jest.clearAllMocks());

  test('fetches items on mount and displays them', async () => {
    const fakeItems = [
      { _id: '1', title: 'Doc1', summary: 'S1', tags: ['a'], itemType: 'pdf', link: '#' }
    ];
    libraryService.getItems.mockResolvedValue(fakeItems);

    render(
      <AuthContext.Provider value={{ user: { token: 't' } }}>
        <LibraryPage />
      </AuthContext.Provider>
    );

    await waitFor(() => expect(libraryService.getItems).toHaveBeenCalled());
    await screen.findByText('Doc1');
  });

  test('shows error when fetch fails', async () => {
    libraryService.getItems.mockRejectedValue(new Error('fail'));

    render(
      <AuthContext.Provider value={{ user: { token: 't' } }}>
        <LibraryPage />
      </AuthContext.Provider>
    );

    await waitFor(() => expect(libraryService.getItems).toHaveBeenCalled());
    await screen.findByText(/No se pudo cargar tu biblioteca/i);
  });

  test('upload form validation: no file selected shows error', async () => {
    libraryService.getItems.mockResolvedValue([]);

    render(
      <AuthContext.Provider value={{ user: { token: 't' } }}>
        <LibraryPage />
      </AuthContext.Provider>
    );

    // submit the form without selecting a file
    const submit = screen.getByRole('button', { name: /guardar en biblioteca/i });
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText(/por favor, selecciona un archivo pdf/i)).toBeInTheDocument());
  });
});
