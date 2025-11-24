const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/userModel');
const httpMocks = require('node-mocks-http');
const bcrypt = require('bcryptjs');

let mongoServer;

jest.setTimeout(20000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'verifyMASTER' });
  process.env.JWT_SECRET = 'testsecret';
});

afterAll(async () => {
  try { await mongoose.disconnect(); } catch (e) {}
  try { if (mongoServer) await mongoServer.stop(); } catch (e) {}
});

afterEach(async () => {
  await User.deleteMany();
});

describe('userController - registerUser & loginUser', () => {
  const { registerUser, loginUser } = require('../controllers/userController');

  it('registerUser: crea usuario y devuelve token', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { name: 'Test', email: 'test@mail.com', password: '123456' },
    });
    const res = httpMocks.createResponse();
    await registerUser(req, res);
    const data = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(data).toHaveProperty('token');
    expect(data.email).toBe('test@mail.com');
  });

  it('registerUser: falla si faltan campos', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: { email: 'x@x.com' } });
    const res = httpMocks.createResponse();
    let err;
    try { await registerUser(req, res); } catch (e) { err = e; }
    expect(err).toBeDefined();
    expect(res.statusCode).toBe(400);
  });

  it('loginUser: permite login con credenciales correctas', async () => {
    const password = 'mypass';
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    await User.create({ name: 'L', email: 'l@mail.com', password: hashed });

    const req = httpMocks.createRequest({ method: 'POST', body: { email: 'l@mail.com', password } });
    const res = httpMocks.createResponse();
    await loginUser(req, res);
    const data = res._getJSONData();
    expect(data).toHaveProperty('token');
    expect(data.email).toBe('l@mail.com');
  });

  it('loginUser: falla con credenciales inválidas', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: { email: 'no@no.com', password: 'x' } });
    const res = httpMocks.createResponse();
    let err;
    try { await loginUser(req, res); } catch (e) { err = e; }
    expect(err).toBeDefined();
    expect(res.statusCode).toBe(401);
  });
});
