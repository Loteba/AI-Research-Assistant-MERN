const httpMocks = require('node-mocks-http');

jest.mock('../models/projectModel');
jest.mock('../models/libraryItemModel');
jest.mock('../models/metricEventModel');

const Project = require('../models/projectModel');
const LibraryItem = require('../models/libraryItemModel');
const MetricEvent = require('../models/metricEventModel');

const { overview, exportMetrics, timeseries, userOverview, userTimeseries } = require('../controllers/metricsController');

describe('metricsController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('overview returns counts', async () => {
    Project.countDocuments.mockResolvedValue(5);
    LibraryItem.countDocuments.mockResolvedValue(10);
    MetricEvent.countDocuments.mockResolvedValue(2);

    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    await overview(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.projects).toBe(5);
    expect(data.papers).toBe(10);
    expect(data.summaries).toBe(2);
  });

  it('exportMetrics returns csv by default and json when requested', async () => {
    Project.countDocuments.mockResolvedValue(1);
    LibraryItem.countDocuments.mockResolvedValue(2);
    MetricEvent.countDocuments.mockResolvedValue(3);

    // CSV
    const reqCsv = httpMocks.createRequest({ method: 'GET', query: {} });
    const resCsv = httpMocks.createResponse();
    await exportMetrics(reqCsv, resCsv);
    expect(resCsv._getData()).toContain('metric,');

    // JSON
    const reqJson = httpMocks.createRequest({ method: 'GET', query: { format: 'json' } });
    const resJson = httpMocks.createResponse();
    await exportMetrics(reqJson, resJson);
    const json = resJson._getJSONData();
    expect(json.projects).toBe(1);
  });

  it('timeseries returns aggregated data', async () => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    Project.aggregate.mockResolvedValue([{ _id: '2025-11-01', count: 2 }]);
    LibraryItem.aggregate.mockResolvedValue([{ _id: '2025-11-01', count: 1 }]);
    MetricEvent.aggregate.mockResolvedValue([{ _id: '2025-11-01', count: 0 }]);

    const req = httpMocks.createRequest({ method: 'GET', query: { days: '7' } });
    const res = httpMocks.createResponse();

    await timeseries(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.data.length).toBeGreaterThanOrEqual(1);
  });

  it('userOverview and userTimeseries work for user scope', async () => {
    Project.countDocuments.mockResolvedValue(2);
    LibraryItem.countDocuments.mockResolvedValue(3);
    MetricEvent.countDocuments.mockResolvedValue(1);

    const req = httpMocks.createRequest({ method: 'GET', user: { _id: 'u1' } });
    const res = httpMocks.createResponse();

    await userOverview(req, res);
    expect(res.statusCode).toBe(200);

    Project.aggregate.mockResolvedValue([{ _id: '2025-11-01', count: 1 }]);
    LibraryItem.aggregate.mockResolvedValue([{ _id: '2025-11-01', count: 0 }]);
    MetricEvent.aggregate.mockResolvedValue([{ _id: '2025-11-01', count: 0 }]);

    const req2 = httpMocks.createRequest({ method: 'GET', user: { _id: 'u1' }, query: { days: '7' } });
    const res2 = httpMocks.createResponse();

    await userTimeseries(req2, res2);
    expect(res2.statusCode).toBe(200);
  });
});
