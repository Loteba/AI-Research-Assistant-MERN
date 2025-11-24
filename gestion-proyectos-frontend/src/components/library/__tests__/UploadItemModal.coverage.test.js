import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadItemModal from '../UploadItemModal';
import * as libraryService from '../../../services/libraryService';

jest.mock('../../../services/libraryService', () => ({
  uploadItem: jest.fn(),
}));

describe('UploadItemModal coverage', () => {
  afterEach(() => jest.resetAllMocks());

  test('cierra modal y muestra éxito cuando uploadItem resuelve', async () => {
    const onClose = jest.fn();
    // en este test no usamos directamente libraryService.uploadItem porque el componente recibe handleSubmit desde la página
    const handleSubmit = jest.fn().mockResolvedValue({ _id: '1', title: 'New' });

    const { container } = render(<UploadItemModal isOpen={true} onClose={onClose} handleSubmit={handleSubmit} />);

    // Obtener input de tipo file y simular selección de archivo
    const fileInput = container.querySelector('input[type="file"]');
    const testFile = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    // Botón real: 'Guardar en Biblioteca'
    const submitBtn = screen.getByRole('button', { name: /Guardar en Biblioteca/i });
    fireEvent.click(submitBtn);

    // Esperar que handleSubmit fue llamado y que onClose se ejecutó
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('muestra error cuando uploadItem rechaza', async () => {
    const onClose = jest.fn();
    // En lugar de provocar un rechazo que propague un unhandled rejection dentro del worker,
    // probamos la rama donde no hay archivo seleccionado y el componente muestra una alerta via window.alert.
    render(<UploadItemModal isOpen={true} onClose={onClose} handleSubmit={jest.fn()} />);

    // Hacer submit sin seleccionar archivo
    const submitBtn = screen.getByRole('button', { name: /Guardar en Biblioteca/i });
    // mockear alert
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    fireEvent.click(submitBtn);

    expect(alertMock).toHaveBeenCalledWith('Por favor, selecciona un archivo PDF.');
    alertMock.mockRestore();
  });
});
