const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const httpMocks = require('node-mocks-http');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');

let mongoServer;

jest.setTimeout(20000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'verifyMASTER' });
});

afterAll(async () => {
  try { await mongoose.disconnect(); } catch (e) {}
  try { if (mongoServer) await mongoServer.stop(); } catch (e) {}
});

afterEach(async () => {
  await Project.deleteMany();
  await Task.deleteMany();
  await User.deleteMany();
});

describe('projectController & taskController', () => {
  const projectController = require('../controllers/projectController');
  const taskController = require('../controllers/taskController');

  it('createProject: crea proyecto con datos válidos', async () => {
    const user = await User.create({ name: 'U', email: 'u@mail.com', password: 'p' });
    const req = httpMocks.createRequest({ body: { name: 'P', description: 'D', areaTematica: 'IA' }, user });
    const res = httpMocks.createResponse();
    await projectController.createProject(req, res);
    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data.name).toBe('P');
  });

  it('createProject: falla si faltan campos', async () => {
    const user = await User.create({ name: 'U', email: 'u@mail.com', password: 'p' });
    const req = httpMocks.createRequest({ body: { name: '' }, user });
    const res = httpMocks.createResponse();
    let err;
    try { await projectController.createProject(req, res); } catch (e) { err = e; }
    expect(err).toBeDefined();
    expect(res.statusCode).toBe(400);
  });

  it('createTaskForProject: solo owner puede crear tarea', async () => {
    const owner = await User.create({ name: 'Owner', email: 'o@mail.com', password: 'p' });
    const other = await User.create({ name: 'Other', email: 'x@mail.com', password: 'p' });
  const project = await Project.create({ name: 'Proj', description: 'D', areaTematica: 'X', user: owner._id });

    // Mockear Project.findById para devolver owner y members que espera el controlador
    const realFind = Project.findById;
    const spy = jest.spyOn(Project, 'findById').mockImplementation(async (id) => {
      return {
        _id: project._id,
        name: project.name,
        owner: owner._id,
        members: [],
        // simulate mongoose Document equals for owner
        toObject() { return this; },
      };
    });

    // intento por otro usuario
  const req1 = httpMocks.createRequest({ params: { projectId: project._id.toString() }, body: { title: 'T1' }, user: { _id: other._id } });
    const res1 = httpMocks.createResponse();
    let err1;
    try { await taskController.createTaskForProject(req1, res1); } catch (e) { err1 = e; }
    expect(err1).toBeDefined();
    expect(res1.statusCode).toBe(403);

    // intento por owner
  const req2 = httpMocks.createRequest({ params: { projectId: project._id.toString() }, body: { title: 'T2' }, user: { _id: owner._id, id: owner._id } });
    const res2 = httpMocks.createResponse();
    await taskController.createTaskForProject(req2, res2);
    expect(res2.statusCode).toBe(201);
    const t = res2._getJSONData();
    expect(t.title).toBe('T2');
    spy.mockRestore();
  });

  it('getTasksForProject: permiso denegado si no miembro ni owner', async () => {
    const owner = await User.create({ name: 'Owner', email: 'o@mail.com', password: 'p' });
    const other = await User.create({ name: 'Other', email: 'x@mail.com', password: 'p' });
    const project = await Project.create({ name: 'Proj', description: 'D', areaTematica: 'X', user: owner._id });
    const spy = jest.spyOn(Project, 'findById').mockImplementation(async (id) => ({ _id: project._id, owner: owner._id, members: [] }));
    const req = httpMocks.createRequest({ params: { projectId: project._id.toString() }, user: { _id: other._id } });
    const res = httpMocks.createResponse();
    let err;
    try { await taskController.getTasksForProject(req, res); } catch (e) { err = e; }
    expect(err).toBeDefined();
    expect(res.statusCode).toBe(403);
    spy.mockRestore();
  });
});
