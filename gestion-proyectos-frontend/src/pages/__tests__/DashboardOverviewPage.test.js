import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardOverviewPage from '../DashboardOverviewPage';
import * as projectService from '../../services/projectService';
import renderWithProviders from '../../test-utils/renderWithProviders';

jest.mock('../../services/projectService', () => ({
  getProjects: jest.fn(),
  getProjectById: jest.fn(),
  getSummary: jest.fn(),
}));

const summary = { totalProjects: 2, completedTasks: 5 };

describe('DashboardOverviewPage', () => {
  afterEach(() => jest.resetAllMocks());

  test('muestra resumen y carga inicialmente', async () => {
    // DashboardOverviewPage usa getProjects para contar proyectos
    projectService.getProjects.mockResolvedValue([{ _id: '1' }, { _id: '2' }]);

  renderWithProviders(<DashboardOverviewPage />, { user: { token: 'token123' } });

    const stat = await screen.findByText('2');
    expect(stat).toBeInTheDocument();
  });
});
