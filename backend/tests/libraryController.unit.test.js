const httpMocks = require('node-mocks-http');
jest.mock('dropbox', () => ({
  Dropbox: function () {
    return {
      filesUpload: jest.fn(async () => ({ result: { path_lower: '/proyectifyia/file.pdf' } })),
      sharingCreateSharedLinkWithSettings: jest.fn(async () => ({ result: { url: 'https://dropbox.com/s/link?dl=0' } })),
    };
  }
}));

jest.mock('../models/libraryItemModel');
const LibraryItem = require('../models/libraryItemModel');
const controller = require('../controllers/libraryController');

describe('libraryController unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DROPBOX_ACCESS_TOKEN = 'fake-token';
  });

  test('getLibraryItems - success with search', async () => {
  const fakeItems = [{ title: 'A' }, { title: 'B' }];
  LibraryItem.find.mockImplementation(() => ({ sort: jest.fn().mockResolvedValue(fakeItems) }));
    LibraryItem.countDocuments.mockResolvedValue(2);

    const req = httpMocks.createRequest({ method: 'GET', user: { id: 'u1' }, query: { search: 'A' } });
    const res = httpMocks.createResponse();
    await controller.getLibraryItems(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(Array.isArray(data)).toBe(true);
  });

  test('uploadLibraryItem - pdf success', async () => {
    const created = { _id: 'li1', title: 'file' };
    LibraryItem.create.mockResolvedValue(created);

    const req = httpMocks.createRequest({
      method: 'POST',
      user: { id: 'u1' },
      body: { summary: 's', tags: 't1,t2', itemType: 'pdf' },
      file: { originalname: 'doc.pdf', buffer: Buffer.from('PDF') }
    });
    const res = httpMocks.createResponse();
    await controller.uploadLibraryItem(req, res);
    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data).toHaveProperty('_id');
  });

  test('uploadLibraryItem - no file -> throw', async () => {
    const req = httpMocks.createRequest({ method: 'POST', user: { id: 'u1' }, body: { itemType: 'pdf' } });
    const res = httpMocks.createResponse();
    await expect(controller.uploadLibraryItem(req, res)).rejects.toThrow('No se ha subido ningún archivo PDF.');
  });

  test('saveSuggestedArticle - success and duplicate', async () => {
    LibraryItem.findOne.mockResolvedValue(null);
    LibraryItem.create.mockResolvedValue({ _id: 'li2', title: 'X' });
    const req = httpMocks.createRequest({ method: 'POST', user: { id: 'u1' }, body: { title: 'T', link: 'L', summary: 'S', resultId: 'r1' } });
    const res = httpMocks.createResponse();
    await controller.saveSuggestedArticle(req, res);
    expect(res.statusCode).toBe(201);

    // Duplicate
    LibraryItem.findOne.mockResolvedValue({ _id: 'li2' });
    const req2 = httpMocks.createRequest({ method: 'POST', user: { id: 'u1' }, body: { title: 'T', link: 'L', summary: 'S', resultId: 'r1' } });
    const res2 = httpMocks.createResponse();
    await expect(controller.saveSuggestedArticle(req2, res2)).rejects.toThrow('Este artículo ya está en tu biblioteca.');
  });

  test('deleteLibraryItem - not found and unauthorized and success', async () => {
    LibraryItem.findById.mockResolvedValue(null);
    const req = httpMocks.createRequest({ method: 'DELETE', user: { id: 'u1' }, params: { id: 'x' } });
    const res = httpMocks.createResponse();
    await expect(controller.deleteLibraryItem(req, res)).rejects.toThrow('Elemento no encontrado');

    // Unauthorized
    LibraryItem.findById.mockResolvedValue({ _id: 'i1', user: 'other', deleteOne: jest.fn() });
    const req2 = httpMocks.createRequest({ method: 'DELETE', user: { id: 'u1' }, params: { id: 'i1' } });
    const res2 = httpMocks.createResponse();
    await expect(controller.deleteLibraryItem(req2, res2)).rejects.toThrow('Usuario no autorizado');

    // Success
    const delMock = jest.fn().mockResolvedValue(true);
    LibraryItem.findById.mockResolvedValue({ _id: 'i2', user: 'u1', deleteOne: delMock });
    const req3 = httpMocks.createRequest({ method: 'DELETE', user: { id: 'u1' }, params: { id: 'i2' } });
    const res3 = httpMocks.createResponse();
    await controller.deleteLibraryItem(req3, res3);
    expect(res3.statusCode).toBe(200);
  });
});
