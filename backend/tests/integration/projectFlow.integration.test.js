const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;

describe('Integración: flujo proyectos y tareas', () => {
  let mongoServer;
  jest.setTimeout(30000);
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    process.env.JWT_SECRET = 'testsecret';
    // cargar la app después de setear MONGO_URI
    app = require('../../server');
  });

  afterAll(async () => {
    try { await mongoose.disconnect(); } catch (e) {}
    try { if (mongoServer) await mongoServer.stop(); } catch (e) {}
  });

  test('registro -> login -> crear proyecto -> crear tarea -> obtener tareas -> borrar proyecto', async () => {
    const agent = request(app);

  // Registro
  const regRes = await agent.post('/api/users/register').send({ name: 'IntTest', email: 'int@test.com', password: 'password' });
  expect(regRes.statusCode).toBe(201);
  expect(regRes.body).toHaveProperty('token');

  // Login
  const loginRes = await agent.post('/api/users/login').send({ email: 'int@test.com', password: 'password' });
    expect(loginRes.statusCode).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeTruthy();

  // Crear proyecto (usar campos esperados: name, description, areaTematica)
  const projRes = await agent.post('/api/projects').set('Authorization', `Bearer ${token}`).send({ name: 'Proyecto Int', description: 'desc', areaTematica: 'General' });
    expect([200,201]).toContain(projRes.statusCode);
    const projectId = projRes.body._id || projRes.body.id;
    expect(projectId).toBeTruthy();

    // Crear tarea para el proyecto
    const taskRes = await agent.post(`/api/projects/${projectId}/tasks`).set('Authorization', `Bearer ${token}`).send({ title: 'Tarea 1', description: 'tarea' });
    expect([200,201]).toContain(taskRes.statusCode);
    const taskId = taskRes.body._id || taskRes.body.id;
    expect(taskId).toBeTruthy();

    // Obtener tareas del proyecto
    const tasksRes = await agent.get(`/api/projects/${projectId}/tasks`).set('Authorization', `Bearer ${token}`);
    expect(tasksRes.statusCode).toBe(200);
    expect(Array.isArray(tasksRes.body)).toBe(true);
    expect(tasksRes.body.length).toBeGreaterThanOrEqual(1);

    // Borrar proyecto
    const delRes = await agent.delete(`/api/projects/${projectId}`).set('Authorization', `Bearer ${token}`);
    expect([200,204]).toContain(delRes.statusCode);
  }, 30000);
});
