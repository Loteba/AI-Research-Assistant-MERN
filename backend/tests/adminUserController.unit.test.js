const httpMocks = require('node-mocks-http');

jest.mock('../models/userModel');
jest.mock('../models/projectModel');
jest.mock('../models/taskModel');
jest.mock('../models/libraryItemModel');
jest.mock('../models/auditLogModel');
jest.mock('bcryptjs');

const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const LibraryItem = require('../models/libraryItemModel');
const AuditLog = require('../models/auditLogModel');
const bcrypt = require('bcryptjs');

const { listUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/adminUserController');

describe('adminUserController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('listUsers returns array', async () => {
    User.find.mockImplementation(() => ({ sort: () => Promise.resolve([{ _id: 'u1', name: 'A' }]) }));
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    await listUsers(req, res);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res._getJSONData())).toBe(true);
  });

  it('getUserById returns 404 when missing and user when present', async () => {
    User.findById.mockImplementation(() => ({ select: () => Promise.resolve(null) }));
    const req = httpMocks.createRequest({ params: { id: 'no' } });
    const res = httpMocks.createResponse();
    await expect(getUserById(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(404);

    const user = { _id: 'u1', name: 'X', email: 'x@x' };
    User.findById.mockImplementation(() => ({ select: () => Promise.resolve(user) }));
    const req2 = httpMocks.createRequest({ params: { id: 'u1' } });
    const res2 = httpMocks.createResponse();
    await getUserById(req2, res2);
    expect(res2.statusCode).toBe(200);
    expect(res2._getJSONData().email).toBe('x@x');
  });

  describe('createUser validations', () => {
    it('rejects missing fields', async () => {
      const req = httpMocks.createRequest({ body: { name: 'N', email: 'e' } });
      const res = httpMocks.createResponse();
      await expect(createUser(req, res)).rejects.toThrow();
      expect(res.statusCode).toBe(400);
    });

    it('rejects invalid role', async () => {
      const req = httpMocks.createRequest({ body: { name: 'N', email: 'e@e', password: 'p', role: 'nope' } });
      const res = httpMocks.createResponse();
      await expect(createUser(req, res)).rejects.toThrow();
      expect(res.statusCode).toBe(400);
    });

    it('rejects creating superadmin by non-superadmin', async () => {
      const req = httpMocks.createRequest({ body: { name: 'N', email: 'e@e', password: 'p', role: 'superadmin' }, user: { role: 'admin' } });
      const res = httpMocks.createResponse();
      await expect(createUser(req, res)).rejects.toThrow();
      expect(res.statusCode).toBe(403);
    });

    it('rejects when email exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'exists' });
      const req = httpMocks.createRequest({ body: { name: 'N', email: 'e@e', password: 'p' }, user: { role: 'superadmin' } });
      const res = httpMocks.createResponse();
      await expect(createUser(req, res)).rejects.toThrow();
      expect(res.statusCode).toBe(400);
    });

    it('creates user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.create.mockResolvedValue({ id: 'u1', name: 'N', email: 'e@e', role: 'user' });
      const req = httpMocks.createRequest({ body: { name: 'N', email: 'e@e', password: 'p' }, user: { role: 'superadmin' } });
      const res = httpMocks.createResponse();
      await createUser(req, res);
      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()._id).toBe('u1');
    });
  });

  describe('updateUser flows', () => {
    it('returns 404 when user not found', async () => {
      User.findById.mockResolvedValue(null);
      const req = httpMocks.createRequest({ params: { id: 'no' }, body: {} });
      const res = httpMocks.createResponse();
      await expect(updateUser(req, res)).rejects.toThrow();
      expect(res.statusCode).toBe(404);
    });

    it('rejects when new email in use', async () => {
      const user = { _id: 'u1', email: 'old', role: 'user', save: jest.fn() };
      User.findById.mockResolvedValue(user);
      User.findOne.mockResolvedValue({ _id: 'other' });
      const req = httpMocks.createRequest({ params: { id: 'u1' }, body: { email: 'new@e' } });
      const res = httpMocks.createResponse();
      await expect(updateUser(req, res)).rejects.toThrow();
      expect(res.statusCode).toBe(400);
    });

    it('prevents non-superadmin editing superadmin', async () => {
      const user = { _id: 'u1', email: 'old', role: 'superadmin', save: jest.fn() };
      User.findById.mockResolvedValue(user);
      const req = httpMocks.createRequest({ params: { id: 'u1' }, body: {}, user: { role: 'admin' } });
      const res = httpMocks.createResponse();
      await expect(updateUser(req, res)).rejects.toThrow();
      expect(res.statusCode).toBe(403);
    });

    it('updates user and logs role change', async () => {
      const user = { _id: 'u1', email: 'old', role: 'user', save: jest.fn().mockResolvedValue(true) };
      User.findById.mockResolvedValue(user);
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      AuditLog.create.mockResolvedValue({});
      const req = httpMocks.createRequest({ params: { id: 'u1' }, body: { role: 'admin', password: 'newp' }, user: { _id: 'actor', role: 'superadmin' }, ip: '1.2.3.4' });
      const res = httpMocks.createResponse();
      await updateUser(req, res);
      expect(res.statusCode).toBe(200);
      expect(AuditLog.create).toHaveBeenCalled();
    });
  });

  describe('deleteUser flows', () => {
    it('returns 404 when not found', async () => {
      User.findById.mockResolvedValue(null);
      const req = httpMocks.createRequest({ params: { id: 'no' }, user: { role: 'superadmin' } });
      const res = httpMocks.createResponse();
      await expect(deleteUser(req, res)).rejects.toThrow();
      expect(res.statusCode).toBe(404);
    });

    it('prevents deleting superadmin by non-superadmin', async () => {
      const exists = { _id: 'u1', role: 'superadmin' };
      User.findById.mockResolvedValue(exists);
      const req = httpMocks.createRequest({ params: { id: 'u1' }, user: { role: 'admin' } });
      const res = httpMocks.createResponse();
      await expect(deleteUser(req, res)).rejects.toThrow();
      expect(res.statusCode).toBe(403);
    });

    it('deletes user and related resources', async () => {
      const exists = { _id: 'u1', role: 'user' };
      User.findById.mockResolvedValue(exists);
      Project.deleteMany.mockResolvedValue({});
      Task.deleteMany.mockResolvedValue({});
      LibraryItem.deleteMany.mockResolvedValue({});
      User.deleteOne.mockResolvedValue({});
      const req = httpMocks.createRequest({ params: { id: 'u1' }, user: { role: 'superadmin' } });
      const res = httpMocks.createResponse();
      await deleteUser(req, res);
      expect(res.statusCode).toBe(204);
    });
  });
});
