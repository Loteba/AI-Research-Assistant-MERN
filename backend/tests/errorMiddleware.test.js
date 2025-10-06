const { errorHandler } = require('../middleware/errorMiddleware');
const httpMocks = require('node-mocks-http');

describe('errorMiddleware', () => {
  test('returns JSON with stack when not in production', () => {
    process.env.NODE_ENV = 'test';
    const err = new Error('boom');
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    res.statusCode = 418; // pretend previous status set
    errorHandler(err, req, res, () => {});
    expect(res.statusCode).toBe(418);
    const data = res._getJSONData();
    expect(data).toHaveProperty('message', 'boom');
    expect(data).toHaveProperty('stack');
  });
});
