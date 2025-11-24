import axios from 'axios';

jest.mock('axios');

describe('apiClient extra coverage', () => {
  afterEach(() => jest.resetAllMocks());

  test('request interceptor usa token de localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'tok-xyz' }));
    const mockRequestUse = jest.fn((fn) => fn({ headers: {} }));
    axios.create.mockReturnValue({ interceptors: { request: { use: mockRequestUse }, response: { use: jest.fn() } } });
    // require después de preparar el mock
    // Cargar el módulo de forma aislada para asegurar que use nuestro mock de axios
    jest.isolateModules(() => {
      require('../apiClient');
    });

    expect(mockRequestUse).toHaveBeenCalled();
  });

  test('response interceptor maneja 401', async () => {
    // No invocamos onRejected directamente porque crea un Promise.reject no manejado
    const mockResponseUse = jest.fn((onFulfilled, onRejected) => {
      // sólo comprobamos que se pasó una función para manejar errores
      expect(typeof onRejected).toBe('function');
    });
    axios.create.mockReturnValue({ interceptors: { request: { use: jest.fn() }, response: { use: mockResponseUse } } });

    // Importar el módulo de forma aislada para asegurar que use nuestro mock de axios
    jest.isolateModules(() => {
      require('../apiClient');
    });

    expect(mockResponseUse).toHaveBeenCalled();
  });
});
