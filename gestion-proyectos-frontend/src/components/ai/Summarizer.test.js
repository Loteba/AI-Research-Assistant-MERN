// Prueba inicial para Summarizer
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Summarizer from './Summarizer';
import * as aiService from '../../services/aiService';

test('renderiza Summarizer sin crashear', () => {
  render(<Summarizer />);
});

test('genera resumen al hacer click en el botón', async () => {
  jest.spyOn(aiService, 'aiSummarizeText').mockResolvedValue({ summary: 'Resumen generado', model: 'gpt-test' });
  render(<Summarizer />);
  // Seleccionar el textarea por su rol (textbox) y escribir
  const textarea = screen.getByRole('textbox');
  fireEvent.change(textarea, { target: { value: 'Texto para resumir' } });
  fireEvent.click(screen.getByRole('button', { name: /Resumir/i }));
  await waitFor(() => expect(screen.getByText(/Resumen generado/i)).toBeInTheDocument());
});