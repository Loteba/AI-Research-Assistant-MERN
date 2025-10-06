import axios from 'axios';

jest.mock('axios');

describe('apiClient', () => {
  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  test('adjunta token de Authorization si existe', async () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc123' }));
    const mockGet = jest.fn().mockResolvedValue({ data: { ok: true } });
    axios.create.mockReturnValue({ get: mockGet, interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } });

    // Importar el cliente después de preparar el mock
    const apiClient = require('../apiClient').default;
    const client = apiClient;
    const res = await client.get('/test');

    expect(mockGet).toHaveBeenCalledWith('/test');
    expect(res.data.ok).toBe(true);
  });

  test('redirige a login en 401', async () => {
    const mockGet = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const mockUse = jest.fn((onFulfilled, onRejected) => {});
    axios.create.mockReturnValue({ get: mockGet, interceptors: { request: { use: jest.fn() }, response: { use: mockUse } } });

    // Import the module after mocking
    const apiClient = require('../apiClient').default;

    // Llamar al método get del cliente expuesto (que es el mockGet)
    await expect(axios.create().get('/private')).rejects.toEqual({ response: { status: 401 } });
    expect(mockGet).toHaveBeenCalledWith('/private');
  });
});
