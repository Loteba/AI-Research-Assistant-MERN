const httpMocks = require('node-mocks-http');

jest.mock('../models/userModel');
jest.mock('../models/projectModel');
jest.mock('../models/taskModel');
jest.mock('../models/libraryItemModel');
jest.mock('../services/dropboxClient');
jest.mock('bcryptjs');

const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const LibraryItem = require('../models/libraryItemModel');
const { getDropboxClient } = require('../services/dropboxClient');
const bcrypt = require('bcryptjs');

const { getMe, deleteMe, updateMe, checkEmailUnique, updateAvatar } = require('../controllers/privacyController');

describe('privacyController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getMe returns user', async () => {
    const req = httpMocks.createRequest({ method: 'GET', user: { _id: 'u1', name: 'User' } });
    const res = httpMocks.createResponse();
    await getMe(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.name).toBe('User');
  });

  it('deleteMe removes data and returns 204', async () => {
    Project.deleteMany.mockResolvedValue();
    Task.deleteMany.mockResolvedValue();
    LibraryItem.deleteMany.mockResolvedValue();
    User.deleteOne.mockResolvedValue();

    const req = httpMocks.createRequest({ method: 'DELETE', user: { _id: 'u1' } });
    const res = httpMocks.createResponse();
    await deleteMe(req, res);
    expect(res.statusCode).toBe(204);
  });

  it('updateMe: user not found', async () => {
    User.findById.mockResolvedValue(null);
    const req = httpMocks.createRequest({ method: 'PUT', user: { _id: 'u1' }, body: {} });
    const res = httpMocks.createResponse();
    await expect(updateMe(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(404);
  });

  it('updateMe: change email fails if already exists', async () => {
    const user = { _id: 'u1', email: 'a@b.com', password: 'h' };
    User.findById.mockResolvedValue(user);
    User.findOne.mockImplementation(() => ({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'other' }) }) }));

    const req = httpMocks.createRequest({ method: 'PUT', user: { _id: 'u1' }, body: { email: 'new@x.com', currentPassword: 'p' } });
    const res = httpMocks.createResponse();

    await expect(updateMe(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);
  });

  it('updateMe: change email requires current password', async () => {
    const user = { _id: 'u1', email: 'a@b.com', password: 'h' };
    User.findById.mockResolvedValue(user);
    User.findOne.mockImplementation(() => ({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }) }));

    const req = httpMocks.createRequest({ method: 'PUT', user: { _id: 'u1' }, body: { email: 'new@x.com' } });
    const res = httpMocks.createResponse();

    await expect(updateMe(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);
  });

  it('updateMe: change password fails when currentPassword incorrect', async () => {
    const user = { _id: 'u1', email: 'a@b.com', password: 'hashed' };
    User.findById.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    const req = httpMocks.createRequest({ method: 'PUT', user: { _id: 'u1' }, body: { currentPassword: 'wrong', newPassword: 'new' } });
    const res = httpMocks.createResponse();

    await expect(updateMe(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);
  });

  it('updateMe: updates name and returns user data', async () => {
    const user = { _id: 'u1', email: 'a@b.com', password: 'hashed', save: jest.fn().mockResolvedValue(true), id: 'u1', name: 'Old' };
    User.findById.mockResolvedValue(user);
    const req = httpMocks.createRequest({ method: 'PUT', user: { _id: 'u1' }, body: { name: 'New' } });
    const res = httpMocks.createResponse();
    await updateMe(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.name).toBe('New');
  });

  it('checkEmailUnique returns false for empty email and respects existing', async () => {
    const req1 = httpMocks.createRequest({ method: 'GET', query: { email: '' }, user: { _id: 'u1' } });
    const res1 = httpMocks.createResponse();
    await checkEmailUnique(req1, res1);
    expect(res1._getJSONData().available).toBe(false);

    User.findOne.mockImplementation(() => ({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'other' }) }) }));
    const req2 = httpMocks.createRequest({ method: 'GET', query: { email: 'a@b.com' }, user: { _id: 'u1' } });
    const res2 = httpMocks.createResponse();
    await checkEmailUnique(req2, res2);
    expect(res2._getJSONData().available).toBe(false);

    User.findOne.mockImplementation(() => ({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }) }));
    const req3 = httpMocks.createRequest({ method: 'GET', query: { email: 'x@y.com' }, user: { _id: 'u1' } });
    const res3 = httpMocks.createResponse();
    await checkEmailUnique(req3, res3);
    expect(res3._getJSONData().available).toBe(true);
  });

  it('updateAvatar uploads to dropbox and updates user', async () => {
    const mockDbx = {
      filesUpload: jest.fn().mockResolvedValue({ result: { path_lower: '/avatars/u1.png' } }),
      sharingCreateSharedLinkWithSettings: jest.fn().mockResolvedValue({ result: { url: 'https://dropbox.com/some?dl=0', path_lower: '/avatars/u1.png' } })
    };
    getDropboxClient.mockResolvedValue(mockDbx);
    User.updateOne.mockResolvedValue({ acknowledged: true });

    const req = httpMocks.createRequest({ method: 'PUT', user: { _id: 'u1' }, file: { mimetype: 'image/png', size: 1024, buffer: Buffer.from('a') } });
    const res = httpMocks.createResponse();

    await updateAvatar(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.avatarUrl).toContain('https://');
  });
});
