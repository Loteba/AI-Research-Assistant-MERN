import * as projectService from '../projectService';
import API from '../apiClient';

jest.mock('../apiClient');

describe('projectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    test('fetches all projects for authenticated user', async () => {
      const mockProjects = [
        { _id: '1', name: 'Project 1' },
        { _id: '2', name: 'Project 2' },
      ];

      API.get.mockResolvedValue({ data: mockProjects });

      const result = await projectService.getProjects();

      expect(API.get).toHaveBeenCalledWith('/projects');
      expect(result).toEqual(mockProjects);
    });

    test('handles error when fetching projects', async () => {
      const error = new Error('Fetch failed');
      API.get.mockRejectedValue(error);

      await expect(projectService.getProjects()).rejects.toThrow('Fetch failed');
    });
  });

  describe('createProject', () => {
    test('creates a new project', async () => {
      const projectData = {
        name: 'New Project',
        description: 'A test project',
      };

      const mockResponse = {
        _id: '123',
        name: 'New Project',
        description: 'A test project',
      };

      API.post.mockResolvedValue({ data: mockResponse });

      const result = await projectService.createProject(projectData);

      expect(API.post).toHaveBeenCalledWith('/projects', projectData);
      expect(result).toEqual(mockResponse);
    });

    test('handles error when creating project', async () => {
      const projectData = { name: 'New Project' };
      const error = new Error('Creation failed');
      API.post.mockRejectedValue(error);

      await expect(projectService.createProject(projectData)).rejects.toThrow(
        'Creation failed'
      );
    });
  });

  describe('updateProject', () => {
    test('updates an existing project', async () => {
      const projectId = '123';
      const projectData = { name: 'Updated Project' };
      const mockResponse = {
        _id: '123',
        name: 'Updated Project',
      };

      API.put.mockResolvedValue({ data: mockResponse });

      const result = await projectService.updateProject(projectId, projectData);

      expect(API.put).toHaveBeenCalledWith(`/projects/${projectId}`, projectData);
      expect(result).toEqual(mockResponse);
    });

    test('handles error when updating project', async () => {
      const projectId = '123';
      const projectData = { name: 'Updated Project' };
      const error = new Error('Update failed');
      API.put.mockRejectedValue(error);

      await expect(projectService.updateProject(projectId, projectData)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('deleteProject', () => {
    test('deletes a project', async () => {
      const projectId = '123';
      const mockResponse = { id: '123' };

      API.delete.mockResolvedValue({ data: mockResponse });

      const result = await projectService.deleteProject(projectId);

      expect(API.delete).toHaveBeenCalledWith(`/projects/${projectId}`);
      expect(result).toEqual(mockResponse);
    });

    test('handles error when deleting project', async () => {
      const projectId = '123';
      const error = new Error('Delete failed');
      API.delete.mockRejectedValue(error);

      await expect(projectService.deleteProject(projectId)).rejects.toThrow(
        'Delete failed'
      );
    });
  });

  describe('getTasksForProject', () => {
    test('fetches tasks for a specific project', async () => {
      const projectId = '123';
      const mockTasks = [
        { _id: '1', title: 'Task 1' },
        { _id: '2', title: 'Task 2' },
      ];

      API.get.mockResolvedValue({ data: mockTasks });

      const result = await projectService.getTasksForProject(projectId);

      expect(API.get).toHaveBeenCalledWith(`/projects/${projectId}/tasks`);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('createTaskForProject', () => {
    test('creates a new task for a project', async () => {
      const projectId = '123';
      const taskData = { title: 'New Task', description: 'Test' };
      const mockResponse = {
        _id: 'task1',
        title: 'New Task',
        description: 'Test',
      };

      API.post.mockResolvedValue({ data: mockResponse });

      const result = await projectService.createTaskForProject(projectId, taskData);

      expect(API.post).toHaveBeenCalledWith(`/projects/${projectId}/tasks`, taskData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateTaskStatus', () => {
    test('updates task status', async () => {
      const projectId = '123';
      const taskId = 'task1';
      const status = 'completed';
      const mockResponse = { _id: 'task1', status: 'completed' };

      API.put.mockResolvedValue({ data: mockResponse });

      const result = await projectService.updateTaskStatus(projectId, taskId, status);

      expect(API.put).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/status`,
        { status }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteTask', () => {
    test('deletes a task from a project', async () => {
      const projectId = '123';
      const taskId = 'task1';

      API.delete.mockResolvedValue({ data: {} });

      await projectService.deleteTask(projectId, taskId);

      expect(API.delete).toHaveBeenCalledWith(`/projects/${projectId}/tasks/${taskId}`);
    });
  });

  describe('inviteToProject', () => {
    test('invites user to project', async () => {
      const projectId = '123';
      const email = 'user@example.com';
      const mockResponse = { invitationId: 'inv1', status: 'pending' };

      API.post.mockResolvedValue({ data: mockResponse });

      const result = await projectService.inviteToProject(projectId, email);

      expect(API.post).toHaveBeenCalledWith(`/projects/${projectId}/invite`, { email });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listMyInvitations', () => {
    test('fetches user invitations', async () => {
      const mockInvitations = [
        { _id: '1', projectName: 'Project A' },
        { _id: '2', projectName: 'Project B' },
      ];

      API.get.mockResolvedValue({ data: mockInvitations });

      const result = await projectService.listMyInvitations();

      expect(API.get).toHaveBeenCalledWith('/projects/invitations/me');
      expect(result).toEqual(mockInvitations);
    });
  });

  describe('acceptInvitation', () => {
    test('accepts a project invitation', async () => {
      const invId = 'inv1';
      const mockResponse = { success: true };

      API.post.mockResolvedValue({ data: mockResponse });

      const result = await projectService.acceptInvitation(invId);

      expect(API.post).toHaveBeenCalledWith(`/projects/invitations/${invId}/accept`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('declineInvitation', () => {
    test('declines a project invitation', async () => {
      const invId = 'inv1';
      const mockResponse = { success: true };

      API.post.mockResolvedValue({ data: mockResponse });

      const result = await projectService.declineInvitation(invId);

      expect(API.post).toHaveBeenCalledWith(`/projects/invitations/${invId}/decline`);
      expect(result).toEqual(mockResponse);
    });
  });
});
