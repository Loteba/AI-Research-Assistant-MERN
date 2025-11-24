const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const httpMocks = require('node-mocks-http');
const axios = require('axios');
jest.mock('axios');

// Mock de Google GenAI para evitar llamadas reales y credenciales
jest.mock('@google/genai', () => ({
  GoogleGenAI: function () {
    this.models = {
      generateContent: jest.fn().mockResolvedValue({ text: 'Resumen generado' }),
    };
  },
}));

const LibraryItem = require('../models/libraryItemModel');
const User = require('../models/userModel');

let mongoServer;

// Allow longer time for in-memory mongo startup on CI/slow machines
jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'verifyMASTER' });
  process.env.SERPAPI_API_KEY = 'fake';
});

afterAll(async () => {
  try {
    await mongoose.disconnect();
  } catch (e) {}
  try {
    if (mongoServer) await mongoServer.stop();
  } catch (e) {}
});

afterEach(async () => {
  await LibraryItem.deleteMany();
  await User.deleteMany();
  jest.clearAllMocks();
});

describe('aiController & libraryController & webhook handling', () => {
  const aiController = require('../controllers/aiController');
  const libraryController = require('../controllers/libraryController');
  const projectController = require('../controllers/projectController');

  it('summarizeText: 400 si falta text', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    await aiController.summarizeText(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('summarizeText: maneja respuesta de ai y extrae texto', async () => {
    const req = httpMocks.createRequest({ body: { text: 'texto largo' } });
    const res = httpMocks.createResponse();
    await aiController.summarizeText(req, res);
    expect(res._getJSONData().summary).toBe('Resumen generado');
  });

  it('suggestArticles: devuelve 400 si falta query', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    await aiController.suggestArticles(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('suggestArticles: maneja error de SerpAPI y responde 502', async () => {
    axios.get.mockResolvedValue({ data: { error: 'quota' } });
    const req = httpMocks.createRequest({ body: { query: 'AI', num: 2 } });
    const res = httpMocks.createResponse();
    await aiController.suggestArticles(req, res);
    expect(res.statusCode).toBe(502);
  });

  it('saveSuggestedArticle: crea item nuevo y evita duplicados', async () => {
    const user = await User.create({ name: 'U', email: 'u@u.com', password: 'p' });
    const req1 = httpMocks.createRequest({ body: { title: 'T', link: 'http://x', resultId: 'r1' }, user: { id: user._id } });
    const res1 = httpMocks.createResponse();
    await libraryController.saveSuggestedArticle(req1, res1);
    expect(res1.statusCode).toBe(201);

    const req2 = httpMocks.createRequest({ body: { title: 'T2', link: 'http://x', resultId: 'r1' }, user: { id: user._id } });
    const res2 = httpMocks.createResponse();
    let err;
    try { await libraryController.saveSuggestedArticle(req2, res2); } catch (e) { err = e; }
    expect(err).toBeDefined();
    expect(res2.statusCode).toBe(409);
  });

  it('getLibraryItems: búsqueda vacía devuelve lista', async () => {
    const user = await User.create({ name: 'U', email: 'u@u.com', password: 'p' });
    await LibraryItem.create({ user: user._id, title: 'Doc', link: 'http://', itemType: 'link' });
    const req = httpMocks.createRequest({ user: { id: user._id }, query: {} });
    const res = httpMocks.createResponse();
    await libraryController.getLibraryItems(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('deleteLibraryItem: no autorizado si otro usuario intenta borrar', async () => {
    const u1 = await User.create({ name: 'U1', email: 'u1@u.com', password: 'p' });
    const u2 = await User.create({ name: 'U2', email: 'u2@u.com', password: 'p' });
    const item = await LibraryItem.create({ user: u1._id, title: 'Doc', link: 'http://', itemType: 'link' });
    const req = httpMocks.createRequest({ params: { id: item._id }, user: { id: u2._id } });
    const res = httpMocks.createResponse();
    let err;
    try { await libraryController.deleteLibraryItem(req, res); } catch (e) { err = e; }
    expect(err).toBeDefined();
    expect(res.statusCode).toBe(401);
  });

  it('projectController webhook: maneja fallo en axios sin lanzar', async () => {
    const owner = await User.create({ name: 'O', email: 'o@o.com', password: 'p' });
    const req = httpMocks.createRequest({ body: { name: 'P', description: 'D', areaTematica: 'X' }, user: { id: owner._id, name: owner.name, email: owner.email } });
    const res = httpMocks.createResponse();
    process.env.N8N_PROJECT_WEBHOOK_URL = 'http://example.invalid';
    axios.post.mockRejectedValue(new Error('network')); // forzar fallo
    await projectController.createProject(req, res);
    expect(res.statusCode).toBe(201);
  });
});
