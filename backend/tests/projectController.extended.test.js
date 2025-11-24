const httpMocks = require('node-mocks-http');

jest.mock('../models/projectModel');
jest.mock('../models/projectMemberModel');
jest.mock('../models/projectInvitationModel');
jest.mock('../models/userModel');
jest.mock('../models/notificationModel');
jest.mock('../models/projectResourceLinkModel');
jest.mock('../models/projectWorkLinkModel');

const Project = require('../models/projectModel');
const ProjectMember = require('../models/projectMemberModel');
const ProjectInvitation = require('../models/projectInvitationModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const ProjectWorkLink = require('../models/projectWorkLinkModel');

const {
  inviteToProject,
  listMyInvitations,
  acceptInvitation,
  declineInvitation,
  listProjectMembers,
  removeProjectMember,
  getProjectStats,
  listProjectInvitations,
  cancelProjectInvitation,
  getProjectWorkLink,
  setProjectWorkLink,
} = require('../controllers/projectController');

// Helpers to mock mongoose chainable query methods like .populate().sort().lean()
function mockFindResolve(fn, value) {
  fn.mockImplementation(() => {
    const chain = {
      populate: function () { return chain; },
      sort: function () { return chain; },
      lean: function () { return Promise.resolve(value); },
    };
    return chain;
  });
}

function mockFindOneResolve(fn, value) {
  fn.mockImplementation(() => ({
    lean: () => Promise.resolve(value),
  }));
}

describe('projectController extended', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inviteToProject: handles missing project and various failures', async () => {
    Project.findById.mockResolvedValue(null);
    const req = httpMocks.createRequest({ method: 'POST', params: { id: 'p1' }, user: { _id: 'u1', id: 'u1', name: 'N', email: 'n@x' }, body: { email: 'a@b.com' } });
    const res = httpMocks.createResponse();
    await expect(inviteToProject(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(404);

    // project exists but not owner
    Project.findById.mockResolvedValue({ _id: 'p1', user: 'other' });
    const req2 = httpMocks.createRequest({ method: 'POST', params: { id: 'p1' }, user: { _id: 'u1', id: 'u1' }, body: { email: 'a@b.com' } });
    const res2 = httpMocks.createResponse();
    await expect(inviteToProject(req2, res2)).rejects.toThrow();
    expect(res2.statusCode).toBe(403);
  });

  it('inviteToProject: success path', async () => {
    const project = { _id: 'p1', user: 'u1', name: 'Proj' };
    Project.findById.mockResolvedValue(project);
    User.findOne.mockResolvedValue({ _id: 'invitee', email: 'a@b.com' });
    ProjectMember.exists.mockResolvedValue(false);
    mockFindOneResolve(ProjectInvitation.findOne, null);
    ProjectInvitation.create.mockResolvedValue({ _id: 'inv1' });
    Notification.create.mockResolvedValue({});

    const req = httpMocks.createRequest({ method: 'POST', params: { id: 'p1' }, user: { _id: 'u1', id: 'u1', name: 'Owner', email: 'owner@x' }, body: { email: 'a@b.com' } });
    const res = httpMocks.createResponse();

    await inviteToProject(req, res);
    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data.ok).toBe(true);
  });

  it('listMyInvitations returns list', async () => {
    mockFindResolve(ProjectInvitation.find, [{ _id: 'inv1' }]);
    const req = httpMocks.createRequest({ method: 'GET', user: { _id: 'u1', email: 'u@x' } });
    const res = httpMocks.createResponse();
    await listMyInvitations(req, res);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res._getJSONData())).toBe(true);
  });

  it('acceptInvitation and declineInvitation handle not found and success', async () => {
    ProjectInvitation.findById.mockResolvedValue(null);
    const req = httpMocks.createRequest({ method: 'POST', params: { id: 'i1' }, user: { _id: 'u1', email: 'u@x' } });
    const res = httpMocks.createResponse();
    await expect(acceptInvitation(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(404);

    // success accept
    const inv = { _id: 'i2', status: 'pending', inviteeUser: 'u1', project: 'p1', save: jest.fn().mockResolvedValue(true) };
    ProjectInvitation.findById.mockResolvedValue(inv);
    ProjectMember.updateOne.mockResolvedValue({});
    Notification.create.mockResolvedValue({});
    const req2 = httpMocks.createRequest({ method: 'POST', params: { id: 'i2' }, user: { _id: 'u1', email: 'u@x', name: 'Me' } });
    const res2 = httpMocks.createResponse();
    await acceptInvitation(req2, res2);
    expect(res2.statusCode).toBe(200);
    expect(res2._getJSONData().ok).toBe(true);

    // decline not found
    ProjectInvitation.findById.mockResolvedValue(null);
    const req3 = httpMocks.createRequest({ method: 'POST', params: { id: 'no' }, user: { _id: 'u1', email: 'u@x' } });
    const res3 = httpMocks.createResponse();
    await expect(declineInvitation(req3, res3)).rejects.toThrow();
    expect(res3.statusCode).toBe(404);

    // decline success
    const inv2 = { _id: 'i3', status: 'pending', inviteeUser: 'u1', save: jest.fn().mockResolvedValue(true), inviter: 'owner' };
    ProjectInvitation.findById.mockResolvedValue(inv2);
    Notification.create.mockResolvedValue({});
    const req4 = httpMocks.createRequest({ method: 'POST', params: { id: 'i3' }, user: { _id: 'u1', email: 'u@x' } });
    const res4 = httpMocks.createResponse();
    await declineInvitation(req4, res4);
    expect(res4.statusCode).toBe(200);
  });

  it('listProjectMembers returns owner + members', async () => {
    const project = { _id: 'p1', user: 'ownerId' };
    Project.findById.mockResolvedValue(project);
    ProjectMember.exists.mockResolvedValue(true);
    mockFindResolve(ProjectMember.find, [{ _id: 'm1', user: 'mem1' }]);
    User.findById.mockImplementation(() => ({ select: () => ({ lean: () => Promise.resolve({ _id: 'ownerId', name: 'Owner', email: 'owner@x', avatarUrl: '' }) }) }));

    const req = httpMocks.createRequest({ method: 'GET', params: { id: 'p1' }, user: { _id: 'ownerId' } });
    const res = httpMocks.createResponse();
    await listProjectMembers(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(Array.isArray(data)).toBe(true);
  });

  it('removeProjectMember prevents removing owner and allows removing member', async () => {
    const project = { _id: 'p1', user: 'ownerId', name: 'Proj' };
    Project.findById.mockResolvedValue(project);

    // attempt to remove owner
    const req = httpMocks.createRequest({ method: 'DELETE', params: { id: 'p1', userId: 'ownerId' }, user: { _id: 'ownerId' } });
    const res = httpMocks.createResponse();
    await expect(removeProjectMember(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(400);

    // success remove
    const req2 = httpMocks.createRequest({ method: 'DELETE', params: { id: 'p1', userId: 'mem1' }, user: { _id: 'ownerId' } });
    const res2 = httpMocks.createResponse();
    ProjectMember.deleteOne.mockResolvedValue({});
    Notification.create.mockResolvedValue({});
    await removeProjectMember(req2, res2);
    expect(res2.statusCode).toBe(204);
  });

  it('getProjectStats returns members and pending when owner', async () => {
    const project = { _id: 'p1', user: 'ownerId' };
    Project.findById.mockResolvedValue(project);
    ProjectMember.exists.mockResolvedValue(true);
    ProjectMember.countDocuments.mockResolvedValue(2);
    ProjectInvitation.countDocuments.mockResolvedValue(1);

    const req = httpMocks.createRequest({ method: 'GET', params: { id: 'p1' }, user: { _id: 'ownerId' } });
    const res = httpMocks.createResponse();
    await getProjectStats(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.members).toBe(3);
  });

  it('listProjectInvitations and cancelProjectInvitation flows', async () => {
    const project = { _id: 'p1', user: 'ownerId' };
    Project.findById.mockResolvedValue(project);
    mockFindResolve(ProjectInvitation.find, [{ _id: 'inv1' }]);

    const req = httpMocks.createRequest({ method: 'GET', params: { id: 'p1' }, user: { _id: 'ownerId' } });
    const res = httpMocks.createResponse();
    await listProjectInvitations(req, res);
    expect(res.statusCode).toBe(200);

    // cancel not found
    ProjectInvitation.findById.mockResolvedValue(null);
    const req2 = httpMocks.createRequest({ method: 'DELETE', params: { id: 'no' }, user: { _id: 'ownerId' } });
    const res2 = httpMocks.createResponse();
    await expect(cancelProjectInvitation(req2, res2)).rejects.toThrow();
    expect(res2.statusCode).toBe(404);

    // cancel success
    const inv = { _id: 'i1', status: 'pending', project: 'p1', save: jest.fn().mockResolvedValue(true), inviteeUser: 'mem1' };
    ProjectInvitation.findById.mockResolvedValue(inv);
    Project.findById.mockImplementation(() => ({ select: () => Promise.resolve({ _id: 'p1', user: 'ownerId', name: 'Proj' }) }));
    Notification.create.mockResolvedValue({});
    const req3 = httpMocks.createRequest({ method: 'DELETE', params: { id: 'i1' }, user: { _id: 'ownerId' } });
    const res3 = httpMocks.createResponse();
    await cancelProjectInvitation(req3, res3);
    expect(res3.statusCode).toBe(204);
  });

  it('getProjectWorkLink and setProjectWorkLink validate and return', async () => {
    const project = { _id: 'p1', user: 'ownerId' };
    Project.findById.mockResolvedValue(project);

    // get empty
    const req = httpMocks.createRequest({ method: 'GET', params: { id: 'p1' }, user: { _id: 'ownerId' } });
    const res = httpMocks.createResponse();
    mockFindOneResolve(ProjectWorkLink.findOne, null);
    await getProjectWorkLink(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().url).toBe('');

    // set invalid url
    const req2 = httpMocks.createRequest({ method: 'PUT', params: { id: 'p1' }, user: { _id: 'ownerId' }, body: { url: 'ftp://x' } });
    const res2 = httpMocks.createResponse();
    await expect(setProjectWorkLink(req2, res2)).rejects.toThrow();
    expect(res2.statusCode).toBe(400);

    // set valid
    const req3 = httpMocks.createRequest({ method: 'PUT', params: { id: 'p1' }, user: { _id: 'ownerId' }, body: { url: 'https://ok.com' } });
    const res3 = httpMocks.createResponse();
    ProjectWorkLink.findOneAndUpdate.mockImplementation(() => ({ lean: () => Promise.resolve({ url: 'https://ok.com' }) }));
    await setProjectWorkLink(req3, res3);
    expect(res3.statusCode).toBe(200);
    expect(res3._getJSONData().url).toBe('https://ok.com');
  });
});
