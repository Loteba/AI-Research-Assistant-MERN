const httpMocks = require('node-mocks-http');

jest.mock('../models/notificationModel');
const Notification = require('../models/notificationModel');

const { listMyNotifications, markRead, markAllRead, unreadCount } = require('../controllers/notificationController');

describe('notificationController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('listMyNotifications returns items', async () => {
    Notification.find.mockImplementation(() => ({
      sort: () => ({
        limit: () => Promise.resolve([{ _id: 'n1', text: 'hello' }]),
      }),
    }));

    const req = httpMocks.createRequest({ method: 'GET', user: { _id: 'u1' } });
    const res = httpMocks.createResponse();

    await listMyNotifications(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].text).toBe('hello');
  });

  it('markRead returns 404 when not found and success when found', async () => {
    Notification.findOne.mockResolvedValue(null);
    const req = httpMocks.createRequest({ method: 'POST', params: { id: 'no' }, user: { _id: 'u1' } });
    const res = httpMocks.createResponse();
    await expect(markRead(req, res)).rejects.toThrow();
    expect(res.statusCode).toBe(404);

    const doc = { _id: 'n1', read: false, save: jest.fn().mockResolvedValue(true) };
    Notification.findOne.mockResolvedValue(doc);
    const req2 = httpMocks.createRequest({ method: 'POST', params: { id: 'n1' }, user: { _id: 'u1' } });
    const res2 = httpMocks.createResponse();
    await markRead(req2, res2);
    expect(res2.statusCode).toBe(200);
    expect(res2._getJSONData().ok).toBe(true);
    expect(doc.save).toHaveBeenCalled();
  });

  it('markAllRead calls updateMany and returns ok', async () => {
    Notification.updateMany.mockResolvedValue({ nModified: 2 });
    const req = httpMocks.createRequest({ method: 'POST', user: { _id: 'u1' } });
    const res = httpMocks.createResponse();
    await markAllRead(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().ok).toBe(true);
    expect(Notification.updateMany).toHaveBeenCalledWith({ user: 'u1', read: false }, { $set: { read: true } });
  });

  it('unreadCount returns the count', async () => {
    Notification.countDocuments.mockResolvedValue(5);
    const req = httpMocks.createRequest({ method: 'GET', user: { _id: 'u1' } });
    const res = httpMocks.createResponse();
    await unreadCount(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().count).toBe(5);
  });
});
