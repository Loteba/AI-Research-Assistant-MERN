// Prueba inicial para UploadItemModal
import { render, fireEvent, screen } from '@testing-library/react';
import UploadItemModal from './UploadItemModal';

test('renderiza UploadItemModal sin crashear', () => {
  render(<UploadItemModal isOpen={true} onClose={()=>{}} />);
});

test('permite seleccionar archivo y enviar el formulario', () => {
  const handleSubmit = jest.fn();
  const { container } = render(<UploadItemModal isOpen={true} onClose={() => {}} handleSubmit={handleSubmit} />);
  const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
  const fileInput = container.querySelector('input[type="file"]');
  fireEvent.change(fileInput, { target: { files: [file] } });
  fireEvent.change(screen.getByPlaceholderText(/Título del Paper/i), { target: { value: 'Paper Test' } });
  // Enviar formulario
  const form = container.querySelector('form');
  fireEvent.submit(form);
  expect(handleSubmit).toHaveBeenCalled();
});