const httpMocks = require('node-mocks-http');

jest.mock('../models/userModel');
jest.mock('../config/email');
jest.mock('bcryptjs');

const User = require('../models/userModel');
const { sendMail } = require('../config/email');
const bcrypt = require('bcryptjs');

const { forgotPassword, resetPassword } = require('../controllers/passwordController');

describe('passwordController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('forgotPassword returns 400 when email missing', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: {} });
    const res = httpMocks.createResponse();

    await expect(forgotPassword(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);
  });

  it('forgotPassword returns 404 when user not found', async () => {
    User.findOne.mockResolvedValue(null);
    const req = httpMocks.createRequest({ method: 'POST', body: { email: 'no@no.com' } });
    const res = httpMocks.createResponse();

    await expect(forgotPassword(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(404);
  });

  it('forgotPassword sends mail and responds', async () => {
    const mockUser = { email: 'x@x.com', save: jest.fn().mockResolvedValue(true) };
    User.findOne.mockResolvedValue(mockUser);
    sendMail.mockResolvedValue(true);

    const req = httpMocks.createRequest({ method: 'POST', body: { email: 'x@x.com' } });
    const res = httpMocks.createResponse();

    await forgotPassword(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.message).toMatch(/Enviamos/);
  });

  it('resetPassword returns 400 when missing fields', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: {} });
    const res = httpMocks.createResponse();

    await expect(resetPassword(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);
  });

  it('resetPassword fails when token invalid', async () => {
    User.findOne.mockResolvedValue(null);
    const req = httpMocks.createRequest({ method: 'POST', body: { email: 'x@x.com', token: 't', password: 'p' } });
    const res = httpMocks.createResponse();

    await expect(resetPassword(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);
  });

  it('resetPassword updates password on success', async () => {
    const mockUser = { save: jest.fn().mockResolvedValue(true) };
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedpass');

    const req = httpMocks.createRequest({ method: 'POST', body: { email: 'x@x.com', token: 't', password: 'newpass' } });
    const res = httpMocks.createResponse();

    await resetPassword(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.message).toMatch(/Contraseña/);
  });
});
