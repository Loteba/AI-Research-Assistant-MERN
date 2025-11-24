const httpMocks = require('node-mocks-http');

jest.mock('../models/projectModel');
jest.mock('../models/taskModel');
jest.mock('../models/projectMemberModel');
jest.mock('../models/projectInvitationModel');
jest.mock('../models/userModel');
jest.mock('../models/notificationModel');
jest.mock('../models/projectResourceLinkModel');
jest.mock('../models/projectWorkLinkModel');
jest.mock('axios');

const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const ProjectMember = require('../models/projectMemberModel');
const ProjectResourceLink = require('../models/projectResourceLinkModel');
const ProjectWorkLink = require('../models/projectWorkLinkModel');
const axios = require('axios');

const {
  createProject,
  updateProject,
  createTaskForProject,
  addProjectLink,
  getProjectById,
} = require('../controllers/projectController');

describe('projectController (selected functions)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createProject: fails when missing fields', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: { name: 'x' }, user: { id: 'u1' } });
    const res = httpMocks.createResponse();

    await expect(createProject(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);
  });

  it('createProject: creates project and handles webhook error gracefully', async () => {
    process.env.N8N_PROJECT_WEBHOOK_URL = 'http://example.com/webhook';
    const mockProject = { _id: 'p1', name: 'P', description: 'D', areaTematica: 'A' };
    Project.create.mockResolvedValue(mockProject);
    axios.post.mockRejectedValue(new Error('webhook failed'));

    const req = httpMocks.createRequest({ method: 'POST', body: { name: 'P', description: 'D', areaTematica: 'A' }, user: { id: 'u1', name: 'User', email: 'u@x' } });
    const res = httpMocks.createResponse();

    await createProject(req, res);

    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data._id || data.name).toBeTruthy();
  });

  it('updateProject: 404 when not found', async () => {
    Project.findById.mockResolvedValue(null);
    const req = httpMocks.createRequest({ method: 'PUT', params: { id: 'pX' }, user: { id: 'u1' } });
    const res = httpMocks.createResponse();

    await expect(updateProject(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(404);
  });

  it('updateProject: 401 when not owner', async () => {
    Project.findById.mockResolvedValue({ user: 'other' });
    const req = httpMocks.createRequest({ method: 'PUT', params: { id: 'p1' }, user: { id: 'u1' } });
    const res = httpMocks.createResponse();

    await expect(updateProject(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(401);
  });

  it('updateProject: success when owner', async () => {
    Project.findById.mockResolvedValue({ user: 'u1' });
    Project.findByIdAndUpdate.mockResolvedValue({ _id: 'p1', name: 'updated' });

    const req = httpMocks.createRequest({ method: 'PUT', params: { id: 'p1' }, body: { name: 'updated' }, user: { id: 'u1' } });
    const res = httpMocks.createResponse();

    await updateProject(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.name).toBe('updated');
  });

  it('createTaskForProject: 404 when project missing', async () => {
    Project.findById.mockResolvedValue(null);
    const req = httpMocks.createRequest({ method: 'POST', params: { id: 'p1' }, user: { id: 'u1' } });
    const res = httpMocks.createResponse();

    await expect(createTaskForProject(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(404);
  });

  it('createTaskForProject: 404 when not owner nor member', async () => {
    Project.findById.mockResolvedValue({ _id: 'p1', user: 'owner' });
    ProjectMember.exists.mockResolvedValue(false);
    const req = httpMocks.createRequest({ method: 'POST', params: { id: 'p1' }, user: { _id: 'u1', id: 'u1' }, body: { title: 't' } });
    const res = httpMocks.createResponse();

    await expect(createTaskForProject(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(404);
  });

  it('createTaskForProject: success with dueInDays and webhook error', async () => {
    process.env.N8N_TASK_WEBHOOK_URL = 'http://example.com/task-webhook';
    const project = { _id: 'p1', user: 'u1', name: 'proj' };
    Project.findById.mockResolvedValue(project);
    ProjectMember.exists.mockResolvedValue(false);
    Task.create.mockResolvedValue({ _id: 't1', title: 't1' });
    axios.post.mockRejectedValue(new Error('webhook fail'));
    Task.findById.mockImplementation(() => ({ populate: jest.fn().mockResolvedValue({ _id: 't1', title: 't1' }) }));

    const req = httpMocks.createRequest({ method: 'POST', params: { id: 'p1' }, user: { id: 'u1', _id: 'u1', email: 'u@x', name: 'n' }, body: { title: 'Title', dueInDays: '3' } });
    const res = httpMocks.createResponse();

    await createTaskForProject(req, res);
    expect(res.statusCode).toBe(201);
  });

  it('addProjectLink: validates url and creates link', async () => {
    const project = { _id: 'p1', user: 'u1' };
    Project.findById.mockResolvedValue(project);
    ProjectMember.exists.mockResolvedValue(true);
    ProjectResourceLink.create.mockResolvedValue({ _id: 'l1', name: 'n', url: 'https://x', createdAt: new Date() });

    const req = httpMocks.createRequest({ method: 'POST', params: { id: 'p1' }, user: { _id: 'u1' }, body: { name: 'Link', url: 'https://example.com' } });
    const res = httpMocks.createResponse();

    await addProjectLink(req, res);
    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data.url).toContain('https://');
  });

  it('getProjectById: not found or not authorized', async () => {
    Project.findById.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue(null) }));
    const req = httpMocks.createRequest({ method: 'GET', params: { id: 'pX' }, user: { _id: 'u1' } });
    const res = httpMocks.createResponse();
    await expect(getProjectById(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(404);

    // not owner nor member
    Project.findById.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue({ _id: 'p1', user: 'other' }) }));
    ProjectMember.exists.mockResolvedValue(false);
    const req2 = httpMocks.createRequest({ method: 'GET', params: { id: 'p1' }, user: { _id: 'u1' } });
    const res2 = httpMocks.createResponse();
    await expect(getProjectById(req2, res2)).rejects.toThrow();
    expect(res2.statusCode).toBe(404);
  });
});
