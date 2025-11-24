const httpMocks = require('node-mocks-http');
const fs = require('fs');

jest.mock('../models/userModel');
const User = require('../models/userModel');

const { updateAvatar } = require('../controllers/avatarController');

describe('avatarController - updateAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if no file provided', async () => {
    const req = httpMocks.createRequest({ method: 'PUT', user: { _id: 'u1' } });
    const res = httpMocks.createResponse();

    await expect(updateAvatar(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 if file not image', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      user: { _id: 'u1' },
      file: { mimetype: 'text/plain', size: 100 }
    });
    const res = httpMocks.createResponse();

    await expect(updateAvatar(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 if file too large', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      user: { _id: 'u1' },
      file: { mimetype: 'image/png', size: 3 * 1024 * 1024 }
    });
    const res = httpMocks.createResponse();

    await expect(updateAvatar(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);
  });

  it('writes file and updates user avatarUrl on success', async () => {
    // Mock fs.promises
    jest.spyOn(fs.promises, 'mkdir').mockResolvedValue();
    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue();

    User.updateOne.mockResolvedValue({ acknowledged: true });

    const req = httpMocks.createRequest({
      method: 'PUT',
      protocol: 'http',
      get: () => 'localhost:3000',
      user: { _id: 'u1' },
      file: { mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from('abc') }
    });
    const res = httpMocks.createResponse();

    await updateAvatar(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('avatarUrl');

    fs.promises.mkdir.mockRestore();
    fs.promises.writeFile.mockRestore();
  });
});
