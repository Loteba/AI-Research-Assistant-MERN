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
  fireEvent.change(screen.getByPlaceholderText(/Pega aquí el texto/i), { target: { value: 'Texto para resumir' } });
  fireEvent.click(screen.getByRole('button', { name: /Resumir/i }));
  await waitFor(() => expect(screen.getByText(/Resumen generado/i)).toBeInTheDocument());
});