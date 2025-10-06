import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectDetailPage from '../ProjectDetailPage';
import * as projectService from '../../services/projectService';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import renderWithProviders from '../../test-utils/renderWithProviders';

jest.mock('../../services/projectService', () => ({
  getProjects: jest.fn(),
  getProjectById: jest.fn(),
  getSummary: jest.fn(),
  getTasksForProject: jest.fn(),
  createTaskForProject: jest.fn(),
}));

describe('ProjectDetailPage', () => {
  afterEach(() => jest.resetAllMocks());

  test('muestra lista de tareas cuando existen', async () => {
    projectService.getTasksForProject.mockResolvedValue([
      { _id: 't1', title: 'Tarea 1', status: 'OPEN' },
    ]);

    renderWithProviders(
      <MemoryRouter initialEntries={["/projects/1"]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
      { user: { token: 'token123' } }
    );

    const task = await screen.findByText(/Tarea 1/i);
    expect(task).toBeInTheDocument();
  });

  test('muestra mensaje cuando no hay tareas', async () => {
    projectService.getTasksForProject.mockResolvedValue([]);

    renderWithProviders(
      <MemoryRouter initialEntries={["/projects/1"]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
      { user: { token: 'token123' } }
    );

    const empty = await screen.findByText(/No hay tareas para este proyecto/i);
    expect(empty).toBeInTheDocument();
  });
});
