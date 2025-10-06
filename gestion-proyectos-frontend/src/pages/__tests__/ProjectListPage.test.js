import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProjectListPage from '../ProjectListPage';
import * as projectService from '../../services/projectService';
import { BrowserRouter } from 'react-router-dom';
import renderWithProviders from '../../test-utils/renderWithProviders';

jest.mock('../../services/projectService', () => ({
  getProjects: jest.fn(),
  getProjectById: jest.fn(),
  getSummary: jest.fn(),
}));

const mockProjects = [
  { _id: '1', name: 'Proyecto A', description: 'Desc A' },
  { _id: '2', name: 'Proyecto B', description: 'Desc B' },
];

describe('ProjectListPage', () => {
  afterEach(() => jest.resetAllMocks());

  test('muestra loader y luego lista de proyectos', async () => {
    projectService.getProjects.mockResolvedValue(mockProjects);

    renderWithProviders(
      <BrowserRouter>
        <ProjectListPage />
      </BrowserRouter>,
      { user: { token: 'token123' } }
    );

    // La llamada es asíncrona: esperar a que aparezca el proyecto
    const item = await screen.findByText(/Proyecto A/i);
    expect(item).toBeInTheDocument();
  });

  test('muestra mensaje si no hay proyectos', async () => {
    projectService.getProjects.mockResolvedValue([]);

    renderWithProviders(
      <BrowserRouter>
        <ProjectListPage />
      </BrowserRouter>,
      { user: { token: 'token123' } }
    );

    const empty = await screen.findByText(/No hay proyectos/i);
    expect(empty).toBeInTheDocument();
  });
});
