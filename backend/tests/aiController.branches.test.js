jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(),
}));

const httpMocks = require('node-mocks-http');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

// Provide a default mock implementation so controller's module-level `ai` is usable
const defaultInst = { models: { generateContent: jest.fn() } };
GoogleGenAI.mockImplementation(() => defaultInst);
// Now require controller after mocking GoogleGenAI
const { summarizeText, handleChat, suggestArticles } = require('../controllers/aiController');

describe('aiController branches and extraction', () => {
  let inst;
  beforeAll(() => {
    // ensure SerpAPI key present for suggestArticles branches
    process.env.SERPAPI_API_KEY = process.env.SERPAPI_API_KEY || 'testkey';
  });

  beforeEach(() => {
    // ensure fresh mock per test and update controller.ai reference via mockImplementation
    inst = { models: { generateContent: jest.fn() } };
    GoogleGenAI.mockImplementation(() => inst);
    // ensure the controller's module-level `ai` (defaultInst) uses this test's mock
    if (defaultInst && defaultInst.models) {
      defaultInst.models.generateContent = inst.models.generateContent;
    }
  });

  test('summarizeText returns 400 when text missing', async () => {
    const req = httpMocks.createRequest({ method: 'POST', url: '/api/ai/summarize', body: {} });
    const res = httpMocks.createResponse();
    await summarizeText(req, res);
    expect(res.statusCode).toBe(400);
    const data = res._getJSONData();
    expect(data).toHaveProperty('message', 'text requerido');
  });

  test('summarizeText retries on RESOURCE_EXHAUSTED then succeeds and uses text property', async () => {
    // first call rejects with RESOURCE_EXHAUSTED, second resolves with text
    inst.models.generateContent
      .mockRejectedValueOnce({ code: 'RESOURCE_EXHAUSTED', message: 'quota' })
      .mockResolvedValueOnce({ text: 'Resumen final' });

    const req = httpMocks.createRequest({ method: 'POST', url: '/api/ai/summarize', body: { text: 'Hola mundo' } });
    const res = httpMocks.createResponse();
    await summarizeText(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('summary', 'Resumen final');
    expect(data).toHaveProperty('model');
  });

  test('handleChat returns 400 when message missing', async () => {
    const req = httpMocks.createRequest({ method: 'POST', url: '/api/ai/chat', body: {} });
    const res = httpMocks.createResponse();
    await handleChat(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toHaveProperty('message', 'message requerido');
  });

  test('handleChat extracts text from candidates.parts fallback', async () => {
    inst.models.generateContent.mockResolvedValueOnce({ candidates: [{ content: { parts: [{ text: 'parte1' }, { text: 'parte2' }] } }] });

    const req = httpMocks.createRequest({ method: 'POST', url: '/api/ai/chat', body: { message: 'hola' } });
    const res = httpMocks.createResponse();
    await handleChat(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('text');
    expect(data.text).toContain('parte1');
  });

  test('suggestArticles handles SerpAPI error and returns 502', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: { error: 'quota' } });
    const req = httpMocks.createRequest({ method: 'POST', url: '/api/ai/suggest', body: { query: 'fake' } });
    const res = httpMocks.createResponse();
    await suggestArticles(req, res);
    expect(res.statusCode).toBe(502);
    const data = res._getJSONData();
    expect(data).toHaveProperty('message');
    axios.get.mockRestore();
  });

  test('suggestArticles maps results and pdfUrl correctly', async () => {
    const fakeItem = {
      title: 'T',
      link: '',
      snippet: 'Sni',
      publication_info: { authors: [{ name: 'A' }], summary: '(2020) example' },
      resources: [{ file_format: 'PDF', link: 'http://file.pdf' }],
      result_id: 'r1',
    };
    jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: { organic_results: [fakeItem] } });
    const req = httpMocks.createRequest({ method: 'POST', url: '/api/ai/suggest', body: { query: 'q' } });
    const res = httpMocks.createResponse();
    await suggestArticles(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results[0]).toHaveProperty('pdfUrl', 'http://file.pdf');
    axios.get.mockRestore();
  });
});
