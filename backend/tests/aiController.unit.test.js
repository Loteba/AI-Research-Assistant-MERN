const httpMocks = require('node-mocks-http');
const aiController = require('../controllers/aiController');

jest.mock('@google/genai', () => ({
  GoogleGenAI: function () {
    return {
      models: {
        generateContent: jest.fn(async () => ({ text: 'Resumen de prueba' }))
      }
    };
  }
}));

const axios = require('axios');
jest.mock('axios');

describe('aiController unit tests', () => {
  beforeEach(() => jest.clearAllMocks());

  beforeAll(() => {
    process.env.SERPAPI_API_KEY = 'fake-key';
  });

  test('summarizeText - éxito', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: { text: 'Esto es un texto largo' } });
    const res = httpMocks.createResponse();
    await aiController.summarizeText(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('summary');
  });

  test('summarizeText - body vacío -> error (400)', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: {} });
    const res = httpMocks.createResponse();
    await aiController.summarizeText(req, res);
    expect(res.statusCode).toBe(400);
    const data = res._getJSONData();
    expect(data).toHaveProperty('message');
  });

  test('suggestArticles - SerpAPI éxito', async () => {
    axios.get.mockResolvedValue({ data: { organic_results: [{ title: 'Art 1', link: 'http://a' }] } });
    const req = httpMocks.createRequest({ method: 'POST', body: { query: 'test' } });
    const res = httpMocks.createResponse();
    await aiController.suggestArticles(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(Array.isArray(data.results)).toBe(true);
  });
});
