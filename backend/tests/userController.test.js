jest.mock('../models/userModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const User = require('../models/userModel');
const httpMocks = require('node-mocks-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser } = require('../controllers/userController');

process.env.JWT_SECRET = 'testsecret';

describe('userController - registerUser & loginUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('registerUser: crea usuario y devuelve token', async () => {
    const mockUser = {
      _id: 'user123',
      name: 'Test',
      email: 'test@mail.com',
      password: 'hashedpass',
      toJSON: () => ({ _id: 'user123', name: 'Test', email: 'test@mail.com' }),
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedpass');
    User.create.mockResolvedValue(mockUser);
    jwt.sign.mockReturnValue('token123');

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { name: 'Test', email: 'test@mail.com', password: '123456' },
    });
    const res = httpMocks.createResponse();

    await registerUser(req, res);

    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data).toHaveProperty('token');
  });

  it('registerUser: falla si faltan campos', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'x@x.com' },
    });
    const res = httpMocks.createResponse();

    try {
      await registerUser(req, res);
    } catch (e) {
      // Expected error
    }

    expect(res.statusCode).toBe(400);
  });

  it('registerUser: falla si usuario ya existe', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing', email: 'test@mail.com' });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { name: 'Test', email: 'test@mail.com', password: '123456' },
    });
    const res = httpMocks.createResponse();

    try {
      await registerUser(req, res);
    } catch (e) {
      // Expected error
    }

    expect(res.statusCode).toBe(400);
  });

  it('loginUser: permite login con credenciales correctas', async () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@mail.com',
      password: 'hashedpass',
      toJSON: () => ({ _id: 'user123', email: 'test@mail.com' }),
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token123');

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'test@mail.com', password: 'correctpass' },
    });
    const res = httpMocks.createResponse();

    await loginUser(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('token');
  });

  it('loginUser: falla con credenciales inválidas', async () => {
    User.findOne.mockResolvedValue(null);

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'no@no.com', password: 'wrongpass' },
    });
    const res = httpMocks.createResponse();

    try {
      await loginUser(req, res);
    } catch (e) {
      // Expected error
    }

    expect(res.statusCode).toBe(401);
  });

  it('loginUser: falla con contraseña incorrecta', async () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@mail.com',
      password: 'hashedpass',
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'test@mail.com', password: 'wrongpass' },
    });
    const res = httpMocks.createResponse();

    try {
      await loginUser(req, res);
    } catch (e) {
      // Expected error
    }

    expect(res.statusCode).toBe(401);
  });
});
