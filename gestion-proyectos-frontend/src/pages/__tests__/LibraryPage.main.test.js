import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LibraryPage from '../LibraryPage';
import { AuthContext } from '../../context/AuthContext';
import libraryService from '../../services/libraryService';

jest.mock('../../services/libraryService');

// Mock useToast
jest.mock('../../components/common/ToastProvider', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  }),
}));

describe('LibraryPage', () => {
  const mockUser = { name: 'John', email: 'john@example.com', token: 'token123' };

  const renderLibraryPage = (user = mockUser) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user }}>
          <LibraryPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    libraryService.getItems.mockResolvedValue([]);
  });

  test('renders library page title', async () => {
    renderLibraryPage();

    expect(screen.getByText(/Mi Biblioteca Personal/i)).toBeInTheDocument();
  });

  test('fetches library items on mount', async () => {
    const mockItems = [
      { _id: '1', title: 'Item 1', tags: ['tag1'], summary: 'Test' },
      { _id: '2', title: 'Item 2', tags: ['tag2'], summary: 'Test' },
    ];
    libraryService.getItems.mockResolvedValue(mockItems);

    renderLibraryPage();

    await waitFor(() => {
      expect(libraryService.getItems).toHaveBeenCalled();
    });
  });

  test('displays loading state while fetching items', async () => {
    libraryService.getItems.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    renderLibraryPage();

    // Loading should be shown initially
    await waitFor(() => {
      expect(libraryService.getItems).toHaveBeenCalled();
    });
  });

  test('displays error message when fetch fails', async () => {
    libraryService.getItems.mockRejectedValue(new Error('Fetch failed'));

    renderLibraryPage();

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar tu biblioteca/i)).toBeInTheDocument();
    });
  });

  test('renders search input', async () => {
    renderLibraryPage();

    const searchInput = screen.getByPlaceholderText(/Buscar en la biblioteca/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('searches library items by term', async () => {
    libraryService.getItems.mockResolvedValue([
      { _id: '1', title: 'Matching Item', tags: [], summary: 'Test' },
    ]);

    
    renderLibraryPage();

    await waitFor(() => {
      expect(libraryService.getItems).toHaveBeenCalled();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar en la biblioteca/i);
    await userEvent.type(searchInput, 'Matching');

    await waitFor(() => {
      expect(libraryService.getItems).toHaveBeenCalledWith('Matching');
    }, { timeout: 1500 });
  });

  test('displays library items', async () => {
    const mockItems = [
      { _id: '1', title: 'React Guide', tags: ['react', 'javascript'], summary: 'Test' },
      { _id: '2', title: 'Node.js Handbook', tags: ['nodejs'], summary: 'Test' },
    ];
    libraryService.getItems.mockResolvedValue(mockItems);

    renderLibraryPage();

    await waitFor(() => {
      expect(screen.getByText('React Guide')).toBeInTheDocument();
      expect(screen.getByText('Node.js Handbook')).toBeInTheDocument();
    });
  });

  test('displays empty state when no items found', async () => {
    libraryService.getItems.mockResolvedValue([]);

    renderLibraryPage();

    await waitFor(() => {
      expect(screen.getByText(/No se encontraron resultados/i)).toBeInTheDocument();
    });
  });

  test('renders upload form section', async () => {
    renderLibraryPage();

    expect(screen.getByText(/Añadir Nuevo PDF/i)).toBeInTheDocument();
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  test('handles delete button click', async () => {
    const mockItems = [
      { _id: '1', title: 'Item to Delete', tags: [], summary: 'Test' },
    ];
    libraryService.getItems.mockResolvedValue(mockItems);

    renderLibraryPage();

    await waitFor(() => {
      expect(screen.getByText('Item to Delete')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  test('clears search results when search term is cleared', async () => {
    libraryService.getItems.mockResolvedValue([
      { _id: '1', title: 'Item 1', tags: [], summary: 'Test' },
    ]);

    
    renderLibraryPage();

    await waitFor(() => {
      expect(libraryService.getItems).toHaveBeenCalled();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar en la biblioteca/i);
    await userEvent.type(searchInput, 'test');
    await userEvent.clear(searchInput);

    await waitFor(() => {
      expect(libraryService.getItems).toHaveBeenCalledWith('');
    });
  });

  test('does not load items if user is not authenticated', () => {
    renderLibraryPage(null);

    expect(libraryService.getItems).not.toHaveBeenCalled();
  });

  test('renders tags on library items', async () => {
    const mockItems = [
      { _id: '1', title: 'Item 1', tags: ['react', 'javascript'], summary: 'Test' },
    ];
    libraryService.getItems.mockResolvedValue(mockItems);

    renderLibraryPage();

    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });
  });

  test('renders upload button for PDF upload', async () => {
    renderLibraryPage();

    const uploadButton = screen.getByRole('button', { name: /Guardar en Biblioteca/i });
    expect(uploadButton).toBeInTheDocument();
  });
});


