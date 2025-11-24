const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

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

describe('authMiddleware - protect', () => {
  const { protect } = require('../middleware/authMiddleware');

  it('permite acceso si token válido', async () => {
    process.env.JWT_SECRET = 'testsecret';
    const user = await User.create({ name: 'A', email: 'a@mail.com', password: '123' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = httpMocks.createRequest({ headers: { authorization: `Bearer ${token}` } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await protect(req, res, next);
    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  it('rechaza si token inválido', async () => {
    const req = httpMocks.createRequest({ headers: { authorization: 'Bearer badtoken' } });
    const res = httpMocks.createResponse();
    // protect usa asyncHandler que lanza; capturamos y verificamos status
    try { await require('../middleware/authMiddleware').protect(req, res, () => {}); } catch (e) {}
    expect(res.statusCode).toBe(401);
  });

  it('rechaza si no hay token', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    try { await require('../middleware/authMiddleware').protect(req, res, () => {}); } catch (e) {}
    expect(res.statusCode).toBe(401);
  });
});
