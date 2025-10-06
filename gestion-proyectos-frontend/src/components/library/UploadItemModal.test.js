// Prueba inicial para UploadItemModal
import { render, fireEvent, screen } from '@testing-library/react';
import UploadItemModal from './UploadItemModal';

test('renderiza UploadItemModal sin crashear', () => {
  render(<UploadItemModal isOpen={true} onClose={()=>{}} />);
});

test('permite seleccionar archivo y enviar el formulario', () => {
  const handleSubmit = jest.fn();
  render(<UploadItemModal isOpen={true} onClose={() => {}} handleSubmit={handleSubmit} />);
  const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
  fireEvent.change(screen.getByLabelText(/Archivo PDF/i), { target: { files: [file] } });
  fireEvent.change(screen.getByLabelText(/Título del Paper/i), { target: { value: 'Paper Test' } });
  // Usar submit sobre el formulario en vez de click en el botón
  const form = screen.getByLabelText(/Archivo PDF/i).closest('form');
  fireEvent.submit(form);
  expect(handleSubmit).toHaveBeenCalled();
});