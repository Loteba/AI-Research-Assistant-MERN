import React from 'react';
import { screen } from '@testing-library/react';
import renderWithProviders from '../../test-utils/renderWithProviders';
import LibraryPage from '../LibraryPage';
import * as libraryService from '../../services/libraryService';

jest.mock('../../services/libraryService', () => ({
  getItems: jest.fn(),
  uploadItem: jest.fn(),
  saveSuggestion: jest.fn(),
}));

describe('LibraryPage coverage tests', () => {
  afterEach(() => jest.resetAllMocks());

  test('muestra lista de items cuando getItems devuelve datos', async () => {
    const items = [
      { _id: '1', title: 'Artículo 1', authors: ['A'] },
      { _id: '2', title: 'Artículo 2', authors: ['B'] },
    ];

    libraryService.getItems.mockResolvedValue(items);

    renderWithProviders(<LibraryPage />, { user: { token: 't' } });

    const it1 = await screen.findByText(/Artículo 1/i);
    const it2 = await screen.findByText(/Artículo 2/i);
    expect(it1).toBeInTheDocument();
    expect(it2).toBeInTheDocument();
  });

  test('muestra mensaje de error cuando getItems falla', async () => {
    libraryService.getItems.mockRejectedValue(new Error('fail'));

    renderWithProviders(<LibraryPage />, { user: { token: 't' } });

    const err = await screen.findByText(/No se pudo cargar tu biblioteca/i);
    expect(err).toBeInTheDocument();
  });
});
