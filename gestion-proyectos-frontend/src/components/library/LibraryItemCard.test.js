// Prueba inicial para LibraryItemCard
import { render, screen, fireEvent } from '@testing-library/react';
import LibraryItemCard from './LibraryItemCard';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const mockItem = {
  title: 'Documento de Prueba',
  itemType: 'pdf',
  summary: 'Resumen de prueba',
  tags: ['investigación', 'pdf'],
  link: 'https://example.com/doc.pdf',
};

test('renderiza LibraryItemCard sin crashear', () => {
  render(<LibraryItemCard item={{title:'Test'}} />);
});

test('muestra el título y el resumen', () => {
  render(<LibraryItemCard item={mockItem} />);
  expect(screen.getByText(/Documento de Prueba/i)).toBeInTheDocument();
  expect(screen.getByText(/Resumen de prueba/i)).toBeInTheDocument();
});

test('renderiza los tags correctamente', () => {
  render(<LibraryItemCard item={mockItem} />);
  expect(screen.getByText('investigación')).toBeInTheDocument();
  expect(screen.getByText('pdf')).toBeInTheDocument();
});

test('el enlace tiene el href correcto y abre en nueva pestaña', () => {
  render(<LibraryItemCard item={mockItem} />);
  const link = screen.getByRole('link', { name: /abrir/i });
  expect(link).toHaveAttribute('href', mockItem.link);
  expect(link).toHaveAttribute('target', '_blank');
});

test('accesibilidad básica: sin violaciones a11y', async () => {
  const { container } = render(<LibraryItemCard item={mockItem} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Mock de un item tipo link
const mockLinkItem = { ...mockItem, itemType: 'link', link: 'https://example.com' };

test('muestra el icono correcto según el tipo', () => {
  const { rerender } = render(<LibraryItemCard item={mockItem} />);
  expect(screen.getByTestId('icon-pdf')).toBeInTheDocument();
  rerender(<LibraryItemCard item={mockLinkItem} />);
  expect(screen.getByTestId('icon-link')).toBeInTheDocument();
});