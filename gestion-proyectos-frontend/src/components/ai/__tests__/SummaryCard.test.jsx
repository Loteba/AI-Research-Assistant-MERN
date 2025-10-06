import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SummaryCard from '../SummaryCard';

// mock clipboard and URL.createObjectURL
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

global.URL.createObjectURL = jest.fn(() => 'blob:fake');
global.URL.revokeObjectURL = jest.fn();

describe('SummaryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('parses bullets and highlights labels', () => {
    const text = `* **Objetivo:** Mejorar tests\n- Otro punto\nSin viñeta pero texto`;
    render(<SummaryCard title="T" summary={text} model="gpt" />);

    // model badge shown
    expect(screen.getByTitle('Modelo IA')).toBeInTheDocument();

    // should render list items and strong label
    expect(screen.getByText(/Objetivo:/i)).toBeInTheDocument();
    expect(screen.getByText(/Otro punto/i)).toBeInTheDocument();
  });

  test('copy and download buttons work and regenerate disabled when loading', async () => {
    const text = 'Simple summary';
    const onRegenerate = jest.fn();
    render(<SummaryCard summary={text} onRegenerate={onRegenerate} isLoading={false} />);

    const copyBtn = screen.getByRole('button', { name: /Copiar/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);

    const dlBtn = screen.getByRole('button', { name: /Descargar/i });
    fireEvent.click(dlBtn);
    expect(global.URL.createObjectURL).toHaveBeenCalled();

    // regenerate button triggers callback
    const regBtn = screen.getByRole('button', { name: /Regenerar/i });
    fireEvent.click(regBtn);
    expect(onRegenerate).toHaveBeenCalled();
  });

  test('shows empty state when no bullets', () => {
    render(<SummaryCard summary={''} />);
    expect(screen.getByText(/No hay viñetas para mostrar/i)).toBeInTheDocument();
  });
});
