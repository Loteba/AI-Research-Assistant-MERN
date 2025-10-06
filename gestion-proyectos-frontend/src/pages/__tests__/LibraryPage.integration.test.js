import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import renderWithProviders from '../../test-utils/renderWithProviders';
import LibraryPage from '../LibraryPage';
import * as libraryService from '../../services/libraryService';

jest.mock('../../services/libraryService', () => ({
  getItems: jest.fn(),
  uploadItem: jest.fn(),
}));

describe('LibraryPage integration flows', () => {
  afterEach(() => jest.resetAllMocks());

  test('subida de archivo actualiza lista y hace refetch', async () => {
    const newItem = { _id: 'x1', title: 'Nuevo Paper', itemType: 'pdf' };

  // Primer fetch (mount) devuelve vacío, todas las llamadas posteriores devolverán el nuevo item
  libraryService.getItems.mockResolvedValueOnce([]).mockResolvedValue([newItem]);
    libraryService.uploadItem.mockResolvedValue(newItem);

    renderWithProviders(<LibraryPage />, { user: { token: 'tok' } });

    // inicialmente no hay resultados
    await screen.findByText(/No se encontraron resultados/i);

  // seleccionar archivo en el formulario (el label no está asociado por id en este componente)
  const fileInput = document.querySelector('input[type="file"]');
    const testFile = new File(['pdf-content'], 'paper.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    const submitBtn = screen.getByRole('button', { name: /Guardar en Biblioteca/i });
    fireEvent.click(submitBtn);

    // esperar que el servicio haya sido llamado de nuevo (refetch) — aceptamos 2 o más llamadas
    await waitFor(() => {
      expect(libraryService.getItems.mock.calls.length).toBeGreaterThanOrEqual(2);
    }, { timeout: 2000 });

  // ahora el DOM debería mostrar el nuevo item
  const added = await screen.findByText(/Nuevo Paper/i);
  expect(added).toBeInTheDocument();
  expect(libraryService.uploadItem).toHaveBeenCalled();
  });

  test('debounce en búsqueda llama getItems con término', async () => {
    libraryService.getItems.mockResolvedValue([]);

    renderWithProviders(<LibraryPage />, { user: { token: 'tok' } });

    const search = screen.getByPlaceholderText(/Buscar en la biblioteca/i);
    fireEvent.change(search, { target: { value: 'react' } });

    // esperar hasta que el servicio haya sido llamado con el término (debounce 500ms)
    await waitFor(() => {
      expect(libraryService.getItems).toHaveBeenCalledWith('react');
    }, { timeout: 1200 });
  });

  test('no realiza fetch si no hay token en user', async () => {
    libraryService.getItems.mockResolvedValue([]);
    renderWithProviders(<LibraryPage />, { user: null });

    // esperar un tick
    await waitFor(() => {
      expect(libraryService.getItems).not.toHaveBeenCalled();
    });
  });
});
